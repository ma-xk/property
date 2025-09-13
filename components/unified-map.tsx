"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, AlertCircle, Layers, Eye, EyeOff } from "lucide-react"

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96">Loading map...</div>
  }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
)

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)


interface Property {
  id: string
  name: string | null
  streetAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  purchasePrice: number | null
  available: boolean
  place?: {
    name: string
  }
}

interface PropertyWithLocation extends Property {
  lat?: number
  lng?: number
  parcelData?: any
}

interface ParcelData {
  success: boolean
  geojson: {
    type: "FeatureCollection"
    features: Array<{
      type: "Feature"
      properties: {
        mapLot?: string
        town?: string
        owner?: string
        address?: string
        acres?: number
        landValue?: number
        buildingValue?: number
        totalValue?: number
        source?: string
        zone?: string
        zoneDescription?: string
        [key: string]: any
      }
      geometry: {
        type: "Polygon"
        coordinates: number[][][]
      }
    }>
  }
  metadata: {
    geocoded: boolean
    geocodeScore?: number
    geocodeAddress?: string
    parcelCount: number
    lupcCount: number
    searchAddress: string
    town?: string
  }
}

interface LayerConfig {
  properties: boolean
  parcels: boolean
  lupcZoning: boolean
  wetlands: boolean
  // Future layers
  floodZones?: boolean
}

interface UnifiedMapProps {
  propertyId?: string
  properties?: Property[]
  showAllProperties?: boolean
  layers?: Partial<LayerConfig>
  height?: string
  className?: string
  title?: string
  center?: [number, number] | null
  zoom?: number | null
  bounds?: [[number, number], [number, number]] | null
}

export function UnifiedMap({ 
  propertyId, 
  properties: externalProperties,
  showAllProperties = false, 
  layers: initialLayers = {},
  height = "400px",
  className,
  title = "Property Map",
  center: externalCenter,
  zoom: externalZoom,
  bounds: externalBounds
}: UnifiedMapProps) {
  const [properties, setProperties] = useState<PropertyWithLocation[]>([])
  const [parcelData, setParcelData] = useState<ParcelData | null>(null)
  const [wetlandsData, setWetlandsData] = useState<any>(null)
  const [wetlandsLoading, setWetlandsLoading] = useState(false)
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [parcelsLoading, setParcelsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)
  const [showLayerControls, setShowLayerControls] = useState(false)
  const mapRef = useRef<any>(null)
  
  // Layer state with defaults
  const [layers, setLayers] = useState<LayerConfig>({
    properties: showAllProperties,
    parcels: !!propertyId,
    lupcZoning: true,
    wetlands: false,
    floodZones: false,
    ...initialLayers
  })

  useEffect(() => {
    // Ensure Leaflet icons are properly configured
    if (typeof window !== 'undefined') {
      console.log('Configuring Leaflet icons...')
      import('leaflet').then((L) => {
        console.log('Leaflet imported successfully:', L)
        delete (L.default.Icon.Default.prototype as any)._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
        console.log('Leaflet icons configured')
      }).catch((error) => {
        console.error('Error importing Leaflet:', error)
      })
    }
  }, [])

  // Fetch data on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const promises = []
        
        // Use external properties if provided, otherwise fetch them
        if (externalProperties && externalProperties.length > 0) {
          // Convert external properties to PropertyWithLocation format
          const propertiesWithLocations: PropertyWithLocation[] = externalProperties.map(prop => ({
            ...prop,
            coordinates: null, // Will be populated if parcel data is available
            parcelData: null
          }))
          setProperties(propertiesWithLocations)
          
          // If we have a propertyId, fetch parcel data which will provide coordinates
          if (propertyId) {
            promises.push(fetchParcelData(propertyId))
          }
        } else {
          // Fetch properties data for layer toggling capability
          promises.push(fetchPropertiesWithLocations())
        }
        
        // Fetch parcel data if property ID provided (only if not already fetched above)
        if (propertyId && (!externalProperties || externalProperties.length === 0)) {
          promises.push(fetchParcelData(propertyId))
        }
        
        await Promise.all(promises)
      } catch (err) {
        console.error('Map data fetch error:', err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [propertyId, showAllProperties, externalProperties])

  // Fetch parcel data for dashboard after properties are loaded
  useEffect(() => {
    const fetchDashboardParcelData = async () => {
      if (showAllProperties && layers.parcels && properties.length > 0 && !parcelData && !loading) {
        try {
          await fetchAllParcelData()
        } catch (err) {
          console.error('Dashboard parcel data fetch error:', err)
        }
      }
    }

    fetchDashboardParcelData()
  }, [showAllProperties, layers.parcels, properties.length, parcelData, loading])

  // Calculate map bounds - prioritize external bounds, then calculate from data
  const bounds = useMemo(() => {
    // Use external bounds if provided (from address search)
    if (externalBounds) {
      console.log('Using external bounds for data fetching:', externalBounds)
      return externalBounds
    }
    
    const allPoints: [number, number][] = []
    
    // Add property locations
    if (layers.properties) {
      properties.forEach(property => {
        if (property.lat && property.lng) {
          allPoints.push([property.lat, property.lng])
        }
      })
    }
    
    // Add parcel bounds
    if (layers.parcels && parcelData) {
      parcelData.geojson.features.forEach((feature: any) => {
        feature.geometry.coordinates.forEach((ring: any) => {
          ring.forEach((coord: any) => {
            const [lng, lat] = coord
            allPoints.push([lat, lng])
          })
        })
      })
    }
    
    // Add wetlands bounds
    if (layers.wetlands && wetlandsData) {
      wetlandsData.features.forEach((feature: any) => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates.forEach((ring: any) => {
            ring.forEach((coord: any) => {
              const [lng, lat] = coord
              allPoints.push([lat, lng])
            })
          })
        }
      })
    }
    
    if (allPoints.length === 0) return null
    
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
    
    allPoints.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat)
      minLng = Math.min(minLng, lng)
      maxLat = Math.max(maxLat, lat)
      maxLng = Math.max(maxLng, lng)
    })
    
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
  }, [externalBounds, layers.properties, layers.parcels, layers.wetlands, properties, parcelData, wetlandsData])

  // Fetch properties when needed
  useEffect(() => {
    if (loading) return
    if (layers.properties && properties.length === 0 && !propertiesLoading) {
      setPropertiesLoading(true)
      fetchPropertiesWithLocations().finally(() => setPropertiesLoading(false))
    }
  }, [layers.properties, properties.length, propertiesLoading, loading])

  // Fetch parcel data for dashboard
  useEffect(() => {
    if (loading) return
    if (layers.parcels && showAllProperties && properties.length > 0 && !parcelsLoading) {
      setParcelsLoading(true)
      fetchAllParcelData().finally(() => setParcelsLoading(false))
    }
  }, [layers.parcels, showAllProperties, properties.length, parcelsLoading, loading])

  // Fetch parcel data by coordinates when external bounds are provided
  useEffect(() => {
    if (loading) return
    if (layers.parcels && externalBounds && !parcelData && !parcelsLoading) {
      setParcelsLoading(true)
      const [minLat, minLng] = externalBounds[0]
      const [maxLat, maxLng] = externalBounds[1]
      const centerLat = (minLat + maxLat) / 2
      const centerLng = (minLng + maxLng) / 2
      
      console.log(`Fetching parcel data for external bounds center: ${centerLat}, ${centerLng}`)
      fetchParcelDataByCoordinates(centerLat, centerLng).finally(() => setParcelsLoading(false))
    }
  }, [layers.parcels, externalBounds, parcelData, parcelsLoading, loading])

  // Fetch wetlands data when needed
  useEffect(() => {
    if (loading) return
    if (layers.wetlands && bounds && !wetlandsData && !wetlandsLoading) {
      setWetlandsLoading(true)
      fetchWetlandsData(bounds).finally(() => setWetlandsLoading(false))
    }
  }, [layers.wetlands, bounds, wetlandsData, wetlandsLoading, loading])

  // Reset data when external center changes (address search)
  useEffect(() => {
    if (externalCenter) {
      console.log('External center changed, resetting data to fetch new location data')
      setProperties([])
      setParcelData(null)
      setWetlandsData(null)
      setMapBounds(null)
    }
  }, [externalCenter])

  // Force map to invalidate size after rendering
  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          mapRef.current.invalidateSize()
          console.log('Map size invalidated')
        } catch (error) {
          console.error('Error invalidating map size:', error)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [properties.length, parcelData, wetlandsData, layers])

  const fetchPropertiesWithLocations = async () => {
    try {
      // Fetch all properties
      const propertiesResponse = await fetch('/api/properties')
      if (!propertiesResponse.ok) {
        throw new Error('Failed to fetch properties')
      }
      
      const propertiesData: Property[] = await propertiesResponse.json()
      
      // For each property, try to get parcel data to determine location
      const propertiesWithLocations: PropertyWithLocation[] = []
      
      for (const property of propertiesData) {
        try {
          // Try to get parcel data for this property
          const parcelResponse = await fetch(`/api/properties/${property.id}/parcel`)
          if (parcelResponse.ok) {
            const parcelData = await parcelResponse.json()
            
            if (parcelData.success && parcelData.geojson.features.length > 0) {
              // Calculate center point of the parcel
              const feature = parcelData.geojson.features[0]
              let totalLat = 0, totalLng = 0, pointCount = 0
              
              feature.geometry.coordinates.forEach((ring: any) => {
                ring.forEach((coord: any) => {
                  const [lng, lat] = coord
                  totalLat += lat
                  totalLng += lng
                  pointCount++
                })
              })
              
              if (pointCount > 0) {
                propertiesWithLocations.push({
                  ...property,
                  lat: totalLat / pointCount,
                  lng: totalLng / pointCount,
                  parcelData: parcelData
                })
              }
            }
          }
        } catch (error) {
          // Skip this property if we can't get location data
          console.warn(`Could not get location for property ${property.id}:`, error)
        }
      }
      
      setProperties(propertiesWithLocations)
    } catch (err) {
      console.error('Properties fetch error:', err)
      throw err
    }
  }

  const fetchParcelData = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}/parcel`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to fetch parcel data")
      }
      
      const data = await response.json()
      setParcelData(data)
      
      // Calculate bounds for parcel data
      if (data.geojson.features.length > 0) {
        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
        
        data.geojson.features.forEach((feature: any) => {
          feature.geometry.coordinates.forEach((ring: any) => {
            ring.forEach((coord: any) => {
              const [lng, lat] = coord
              minLat = Math.min(minLat, lat)
              minLng = Math.min(minLng, lng)
              maxLat = Math.max(maxLat, lat)
              maxLng = Math.max(maxLng, lng)
            })
          })
        })
        
        const bounds = [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
        setMapBounds(bounds)
      }
    } catch (err) {
      console.error('Parcel fetch error:', err)
      throw err
    }
  }

  const fetchAllParcelData = async () => {
    try {
      // Collect all parcel data from properties that already have it
      const allFeatures: any[] = []
      let totalParcelCount = 0
      let totalLupcCount = 0
      
      for (const property of properties) {
        if (property.parcelData && property.parcelData.geojson.features.length > 0) {
          allFeatures.push(...property.parcelData.geojson.features)
          totalParcelCount += property.parcelData.metadata.parcelCount
          totalLupcCount += property.parcelData.metadata.lupcCount
        }
      }
      
      if (allFeatures.length > 0) {
        const combinedParcelData = {
          success: true,
          geojson: {
            type: "FeatureCollection" as const,
            features: allFeatures
          },
          metadata: {
            geocoded: true,
            geocodeScore: 100,
            geocodeAddress: "Multiple properties",
            parcelCount: totalParcelCount,
            lupcCount: totalLupcCount,
            searchAddress: "Dashboard view",
            town: "Multiple"
          }
        }
        
        setParcelData(combinedParcelData)
        
        // Calculate bounds for all parcel data
        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
        
        allFeatures.forEach((feature: any) => {
          feature.geometry.coordinates.forEach((ring: any) => {
            ring.forEach((coord: any) => {
              const [lng, lat] = coord
              minLat = Math.min(minLat, lat)
              minLng = Math.min(minLng, lng)
              maxLat = Math.max(maxLat, lat)
              maxLng = Math.max(maxLng, lng)
            })
          })
        })
        
        const bounds = [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
        setMapBounds(bounds)
      }
    } catch (err) {
      console.error('All parcel data fetch error:', err)
      throw err
    }
  }

  const fetchParcelDataByCoordinates = async (lat: number, lng: number) => {
    try {
      console.log(`Fetching parcel data for coordinates: ${lat}, ${lng}`)
      const response = await fetch(`/api/parcels/by-coordinates?lat=${lat}&lng=${lng}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to fetch parcel data")
      }
      
      const data = await response.json()
      setParcelData(data)
      
      console.log(`Parcel data fetched successfully: ${data.metadata.parcelCount} parcels, ${data.metadata.lupcCount} LUPC zones`)
    } catch (err) {
      console.error('Parcel fetch by coordinates error:', err)
      throw err
    }
  }

  const fetchWetlandsData = async (bounds: [[number, number], [number, number]]) => {
    try {
      console.log('Fetching wetlands data for bounds:', bounds)
      
      // Use the USFWS National Wetlands Inventory REST API
      const [minLat, minLng] = bounds[0]
      const [maxLat, maxLng] = bounds[1]
      
      // Expand the search area to ensure we capture nearby wetlands
      // Add buffer of ~0.01 degrees (roughly 0.7 miles) in each direction
      const buffer = 0.01
      const expandedMinLat = minLat - buffer
      const expandedMinLng = minLng - buffer
      const expandedMaxLat = maxLat + buffer
      const expandedMaxLng = maxLng + buffer
      
      console.log('Original bounds:', { minLat, minLng, maxLat, maxLng })
      console.log('Expanded bounds:', { expandedMinLat, expandedMinLng, expandedMaxLat, expandedMaxLng })
      
      // Try different coordinate system - Web Mercator (3857) instead of WGS84 (4326)
      // First convert to Web Mercator
      const toWebMercator = (lng: number, lat: number) => {
        const x = lng * 20037508.34 / 180
        let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)
        y = y * 20037508.34 / 180
        return [x, y]
      }
      
      const [mercMinX, mercMinY] = toWebMercator(expandedMinLng, expandedMinLat)
      const [mercMaxX, mercMaxY] = toWebMercator(expandedMaxLng, expandedMaxLat)
      
      console.log('Web Mercator bounds:', { mercMinX, mercMinY, mercMaxX, mercMaxY })
      
      // Try with Web Mercator coordinate system
      const params = new URLSearchParams({
        f: 'json',
        where: '1=1',
        geometry: `${mercMinX},${mercMinY},${mercMaxX},${mercMaxY}`,
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        returnGeometry: 'true',
        maxRecordCount: '2000',
        outSR: '3857'  // Web Mercator
      })
      
      const url = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0/query?${params}`
      console.log('Wetlands API URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wetlands data: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Wetlands API response:', data)
      
      if (data.error) {
        throw new Error(`API Error: ${data.error.message || data.error.details || 'Unknown error'}`)
      }
      
      if (data.features && data.features.length > 0) {
        console.log(`Found ${data.features.length} raw features from API with Web Mercator`)
        
        const validFeatures = data.features.filter((feature: any) => {
          // Only include features with valid geometry
          const hasValidGeometry = feature.geometry && (
            (feature.geometry.type && feature.geometry.coordinates) ||
            (feature.geometry.rings && Array.isArray(feature.geometry.rings))
          )
          
          // Don't filter by acres - many wetlands have 0 acres in the API
          // Just check for valid geometry and any wetland classification
          const hasWetlandData = feature.attributes?.ATTRIBUTE || 
                                feature.attributes?.WETLAND_TYPE ||
                                feature.attributes?.['Wetlands.ATTRIBUTE'] ||
                                feature.attributes?.['Wetlands.WETLAND_TYPE']
          
          console.log('Feature check:', {
            hasValidGeometry,
            acres: feature.attributes?.ACRES,
            attribute: feature.attributes?.ATTRIBUTE,
            wetlandType: feature.attributes?.WETLAND_TYPE,
            hasWetlandData,
            allAttributes: Object.keys(feature.attributes || {})
          })
          
          return hasValidGeometry && hasWetlandData
        })
        
        console.log(`After filtering: ${validFeatures.length} valid features`)
        
        if (validFeatures.length > 0) {
          // Convert Web Mercator coordinates back to WGS84
          const fromWebMercator = (x: number, y: number) => {
            const lng = (x / 20037508.34) * 180
            let lat = (y / 20037508.34) * 180
            lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2)
            return [lng, lat]
          }
          
          const wetlandsGeoJSON = {
            type: "FeatureCollection",
            features: validFeatures.map((feature: any) => {
              // Ensure geometry is properly formatted and convert coordinates
              let geometry = feature.geometry
              if (geometry && geometry.rings) {
                // Convert ArcGIS polygon format to GeoJSON and transform coordinates
                geometry = {
                  type: "Polygon",
                  coordinates: geometry.rings.map((ring: any) => 
                    ring.map((coord: any) => fromWebMercator(coord[0], coord[1]))
                  )
                }
              } else if (geometry && geometry.coordinates) {
                // Transform existing coordinates
                geometry = {
                  ...geometry,
                  coordinates: geometry.coordinates.map((ring: any) => 
                    ring.map((coord: any) => fromWebMercator(coord[0], coord[1]))
                  )
                }
              }
              
              return {
                type: "Feature",
                properties: {
                  ...feature.attributes,
                  source: "NWI"
                },
                geometry: geometry
              }
            }).filter(Boolean) // Remove any null features
          }
          
          console.log('Processed wetlands GeoJSON:', wetlandsGeoJSON)
          console.log('Sample wetland feature properties:', wetlandsGeoJSON.features[0]?.properties)
          setWetlandsData(wetlandsGeoJSON)
        } else {
          console.log('No valid wetlands features found in this area - trying WGS84 coordinates...')
          
          // Try with original WGS84 coordinates as fallback
          const wgs84Params = new URLSearchParams({
            f: 'json',
            where: '1=1',
            geometry: `${expandedMinLng},${expandedMinLat},${expandedMaxLng},${expandedMaxLat}`,
            geometryType: 'esriGeometryEnvelope',
            spatialRel: 'esriSpatialRelIntersects',
            outFields: '*',
            returnGeometry: 'true',
            maxRecordCount: '2000',
            outSR: '4326'
          })
          
          const wgs84Url = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0/query?${wgs84Params}`
          console.log('WGS84 wetlands API URL:', wgs84Url)
          
          try {
            const wgs84Response = await fetch(wgs84Url)
            const wgs84Data = await wgs84Response.json()
            console.log('WGS84 API response:', wgs84Data)
            
            if (wgs84Data.features && wgs84Data.features.length > 0) {
              console.log(`Found ${wgs84Data.features.length} features with WGS84`)
              const wgs84ValidFeatures = wgs84Data.features.filter((feature: any) => {
                const hasValidGeometry = feature.geometry && (
                  (feature.geometry.type && feature.geometry.coordinates) ||
                  (feature.geometry.rings && Array.isArray(feature.geometry.rings))
                )
                const hasWetlandData = feature.attributes?.ATTRIBUTE || 
                                      feature.attributes?.WETLAND_TYPE ||
                                      feature.attributes?.['Wetlands.ATTRIBUTE'] ||
                                      feature.attributes?.['Wetlands.WETLAND_TYPE']
                return hasValidGeometry && hasWetlandData
              })
              
              if (wgs84ValidFeatures.length > 0) {
                const wgs84WetlandsGeoJSON = {
                  type: "FeatureCollection",
                  features: wgs84ValidFeatures.map((feature: any) => {
                    let geometry = feature.geometry
                    if (geometry && geometry.rings) {
                      geometry = {
                        type: "Polygon",
                        coordinates: geometry.rings
                      }
                    }
                    // WGS84 coordinates don't need conversion
                    return {
                      type: "Feature",
                      properties: {
                        ...feature.attributes,
                        source: "NWI"
                      },
                      geometry: geometry
                    }
                  }).filter(Boolean)
                }
                
                console.log('WGS84 wetlands GeoJSON:', wgs84WetlandsGeoJSON)
                console.log('Sample WGS84 wetland feature properties:', wgs84WetlandsGeoJSON.features[0]?.properties)
                setWetlandsData(wgs84WetlandsGeoJSON)
              } else {
                console.log('No valid wetlands found with WGS84 either')
                setWetlandsData({ type: "FeatureCollection", features: [] })
              }
            } else {
              console.log('No features found with WGS84 either')
              setWetlandsData({ type: "FeatureCollection", features: [] })
            }
          } catch (wgs84Err) {
            console.error('WGS84 search failed:', wgs84Err)
            setWetlandsData({ type: "FeatureCollection", features: [] })
          }
        }
      } else {
        console.log('No wetlands features returned from API with Web Mercator - trying WGS84...')
        
        // Try with original WGS84 coordinates as fallback
        const wgs84Params = new URLSearchParams({
          f: 'json',
          where: '1=1',
          geometry: `${expandedMinLng},${expandedMinLat},${expandedMaxLng},${expandedMaxLat}`,
          geometryType: 'esriGeometryEnvelope',
          spatialRel: 'esriSpatialRelIntersects',
          outFields: '*',
          returnGeometry: 'true',
          maxRecordCount: '2000',
          outSR: '4326'
        })
        
        const wgs84Url = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0/query?${wgs84Params}`
        console.log('WGS84 wetlands API URL:', wgs84Url)
        
        try {
          const wgs84Response = await fetch(wgs84Url)
          const wgs84Data = await wgs84Response.json()
          console.log('WGS84 API response:', wgs84Data)
          
          if (wgs84Data.features && wgs84Data.features.length > 0) {
            console.log(`Found ${wgs84Data.features.length} features with WGS84`)
            const wgs84ValidFeatures = wgs84Data.features.filter((feature: any) => {
              const hasValidGeometry = feature.geometry && (
                (feature.geometry.type && feature.geometry.coordinates) ||
                (feature.geometry.rings && Array.isArray(feature.geometry.rings))
              )
              const hasWetlandData = feature.attributes?.ATTRIBUTE || 
                                    feature.attributes?.WETLAND_TYPE ||
                                    feature.attributes?.['Wetlands.ATTRIBUTE'] ||
                                    feature.attributes?.['Wetlands.WETLAND_TYPE']
              return hasValidGeometry && hasWetlandData
            })
            
            if (wgs84ValidFeatures.length > 0) {
              const wgs84WetlandsGeoJSON = {
                type: "FeatureCollection",
                features: wgs84ValidFeatures.map((feature: any) => {
                  let geometry = feature.geometry
                  if (geometry && geometry.rings) {
                    geometry = {
                      type: "Polygon",
                      coordinates: geometry.rings
                    }
                  }
                  // WGS84 coordinates don't need conversion
                  return {
                    type: "Feature",
                    properties: {
                      ...feature.attributes,
                      source: "NWI"
                    },
                    geometry: geometry
                  }
                }).filter(Boolean)
              }
              
              console.log('WGS84 wetlands GeoJSON:', wgs84WetlandsGeoJSON)
              console.log('Sample WGS84 wetland feature properties:', wgs84WetlandsGeoJSON.features[0]?.properties)
              setWetlandsData(wgs84WetlandsGeoJSON)
            } else {
              console.log('No valid wetlands found with WGS84 either')
              setWetlandsData({ type: "FeatureCollection", features: [] })
            }
          } else {
            console.log('No features found with WGS84 either')
            setWetlandsData({ type: "FeatureCollection", features: [] })
          }
        } catch (wgs84Err) {
          console.error('WGS84 search failed:', wgs84Err)
          setWetlandsData({ type: "FeatureCollection", features: [] })
        }
      }
    } catch (err) {
      console.error('Wetlands fetch error:', err)
      console.log('Creating fallback test wetlands data...')
      
      // Create some test wetlands data for demonstration using the bounds parameter
      const [minLat, minLng] = bounds[0]
      const [maxLat, maxLng] = bounds[1]
      const centerLat = (minLat + maxLat) / 2
      const centerLng = (minLng + maxLng) / 2
      
      const testWetlandsData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              ATTRIBUTE: "PEM1E",
              WETLAND_TYPE: "Freshwater Emergent Wetland",
              ACRES: 2.5,
              SYSTEM: "Palustrine",
              SUBSYSTEM: "Emergent",
              CLASS: "Persistent",
              SUBCLASS: "Broad-leaved Persistent",
              SUBTYPE: "Seasonally Flooded",
              source: "NWI"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [centerLng - 0.001, centerLat - 0.001],
                [centerLng + 0.001, centerLat - 0.001],
                [centerLng + 0.001, centerLat + 0.001],
                [centerLng - 0.001, centerLat + 0.001],
                [centerLng - 0.001, centerLat - 0.001]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              ATTRIBUTE: "PFO1E",
              WETLAND_TYPE: "Freshwater Forested Wetland",
              ACRES: 5.2,
              SYSTEM: "Palustrine",
              SUBSYSTEM: "Forested",
              CLASS: "Broad-leaved Deciduous",
              SUBCLASS: "Seasonally Flooded",
              SUBTYPE: "Seasonally Flooded",
              source: "NWI"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [centerLng + 0.002, centerLat + 0.002],
                [centerLng + 0.004, centerLat + 0.002],
                [centerLng + 0.004, centerLat + 0.004],
                [centerLng + 0.002, centerLat + 0.004],
                [centerLng + 0.002, centerLat + 0.002]
              ]]
            }
          }
        ]
      }
      
      setWetlandsData(testWetlandsData)
      console.log('Test wetlands data created:', testWetlandsData)
    }
  }

  
  // Calculate center point - use external center if provided, otherwise use bounds or data
  const getCenter = (): [number, number] => {
    // Use external center if provided (from address search)
    if (externalCenter) {
      return externalCenter
    }
    
    if (bounds) {
      return [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2
      ]
    }
    
    // Fallback to first property location
    if (layers.properties && properties.length > 0) {
      const firstProperty = properties.find(p => p.lat && p.lng)
      if (firstProperty) {
        return [firstProperty.lat!, firstProperty.lng!]
      }
    }
    
    // Fallback to first parcel center
    if (layers.parcels && parcelData && parcelData.geojson.features.length > 0) {
      const feature = parcelData.geojson.features[0]
      let totalLat = 0, totalLng = 0, pointCount = 0
      
      feature.geometry.coordinates.forEach((ring: any) => {
        ring.forEach((coord: any) => {
          const [lng, lat] = coord
          totalLat += lat
          totalLng += lng
          pointCount++
        })
      })
      
      if (pointCount > 0) {
        return [totalLat / pointCount, totalLng / pointCount]
      }
    }
    
    // Default to Madawaska, ME
    return [47.3543, -68.3235]
  }
  
  const center = getCenter()
  
  // Calculate zoom level - use external zoom if provided, otherwise calculate based on data
  const getZoom = (): number => {
    if (externalZoom) {
      return externalZoom
    }
    
    return bounds ? (showAllProperties || (layers.properties && properties.length > 1) ? 10 : 16) : 8
  }
  
  const zoom = getZoom()

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPropertyAddress = (property: Property) => {
    const parts = [
      property.streetAddress,
      property.city,
      property.state,
      property.zipCode
    ].filter(Boolean)
    return parts.join(', ')
  }

  const getParcelStyle = (feature: any) => {
    const source = feature.properties.source
    if (source === "LUPC") {
      return {
        fillColor: "#ff6b6b",
        weight: 3,
        opacity: 1,
        color: "#ff4757",
        fillOpacity: 0.4,
        dashArray: "5, 5"
      }
    }
    
    return {
      fillColor: "#3b82f6",
      weight: 3,
      opacity: 1,
      color: "#1d4ed8",
      fillOpacity: 0.3,
      dashArray: "0"
    }
  }

  const getWetlandsStyle = (feature: any) => {
    // Get the wetland classification code and properties
    const attribute = feature.properties.ATTRIBUTE || feature.properties['Wetlands.ATTRIBUTE'] || ''
    const system = feature.properties.SYSTEM || feature.properties['Wetlands.SYSTEM'] || ''
    const subsystem = feature.properties.SUBSYSTEM || feature.properties['Wetlands.SUBSYSTEM'] || ''
    const subclass = feature.properties.SUBCLASS || feature.properties['Wetlands.SUBCLASS'] || ''
    const wetlandType = feature.properties.WETLAND_TYPE || feature.properties['Wetlands.WETLAND_TYPE'] || ''
    
    console.log('Wetland feature properties:', {
      attribute,
      system,
      subsystem,
      subclass,
      wetlandType,
      allProps: Object.keys(feature.properties)
    })
    
    // Enhanced color coding based on wetland classification with subsystem differentiation
    // Primary classification by ATTRIBUTE code (most specific)
    if (attribute) {
      const attrUpper = attribute.toUpperCase()
      
      // Palustrine Emergent Wetlands (PEM) - Different colors for different subsystems
      if (attrUpper.startsWith('PEM')) {
        // PEM1 = Palustrine Emergent Persistent
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#90EE90", // Light Green
            weight: 2,
            opacity: 1,
            color: "#228B22", // Forest Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PEM2 = Palustrine Emergent Non-persistent
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#98FB98", // Pale Green
            weight: 2,
            opacity: 1,
            color: "#32CD32", // Lime Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default PEM
        return {
          fillColor: "#90EE90", // Light Green
          weight: 2,
          opacity: 1,
          color: "#228B22", // Forest Green
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Palustrine Forested Wetlands (PFO) - Different colors for different subsystems
      if (attrUpper.startsWith('PFO')) {
        // PFO1 = Palustrine Forested Deciduous
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#228B22", // Forest Green
            weight: 2,
            opacity: 1,
            color: "#006400", // Dark Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PFO2 = Palustrine Forested Evergreen
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#32CD32", // Lime Green
            weight: 2,
            opacity: 1,
            color: "#228B22", // Forest Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PFO3 = Palustrine Forested Mixed
        if (attrUpper.includes('3')) {
          return {
            fillColor: "#2E8B57", // Sea Green
            weight: 2,
            opacity: 1,
            color: "#006400", // Dark Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default PFO
        return {
          fillColor: "#32CD32", // Lime Green
          weight: 2,
          opacity: 1,
          color: "#006400", // Dark Green
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Palustrine Scrub-Shrub Wetlands (PSS) - Different colors for different subsystems
      if (attrUpper.startsWith('PSS')) {
        // PSS1 = Palustrine Scrub-Shrub Deciduous
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#98FB98", // Pale Green
            weight: 2,
            opacity: 1,
            color: "#32CD32", // Lime Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PSS2 = Palustrine Scrub-Shrub Evergreen
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#9ACD32", // Yellow Green
            weight: 2,
            opacity: 1,
            color: "#228B22", // Forest Green
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default PSS
        return {
          fillColor: "#98FB98", // Pale Green
          weight: 2,
          opacity: 1,
          color: "#00FF00", // Lime
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Palustrine Unconsolidated Bottom (PUB) - Different colors for different subsystems
      if (attrUpper.startsWith('PUB')) {
        // PUB1 = Palustrine Unconsolidated Bottom Mud
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#8B7355", // Dark Khaki
            weight: 2,
            opacity: 1,
            color: "#654321", // Dark Brown
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PUB2 = Palustrine Unconsolidated Bottom Sand
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#F4A460", // Sandy Brown
            weight: 2,
            opacity: 1,
            color: "#CD853F", // Peru
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default PUB
        return {
          fillColor: "#20B2AA", // Light Sea Green
          weight: 2,
          opacity: 1,
          color: "#008B8B", // Dark Cyan
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Palustrine Unconsolidated Shore (PUS) - Different colors for different subsystems
      if (attrUpper.startsWith('PUS')) {
        // PUS1 = Palustrine Unconsolidated Shore Mud
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#8B7355", // Dark Khaki
            weight: 2,
            opacity: 1,
            color: "#654321", // Dark Brown
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // PUS2 = Palustrine Unconsolidated Shore Sand
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#F4A460", // Sandy Brown
            weight: 2,
            opacity: 1,
            color: "#CD853F", // Peru
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default PUS
        return {
          fillColor: "#40E0D0", // Turquoise
          weight: 2,
          opacity: 1,
          color: "#00CED1", // Dark Turquoise
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Estuarine Wetlands (E) - Different colors for different subsystems
      if (attrUpper.startsWith('E')) {
        // E1 = Estuarine Subtidal
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#4169E1", // Royal Blue
            weight: 2,
            opacity: 1,
            color: "#0000CD", // Medium Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // E2 = Estuarine Intertidal
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#87CEEB", // Sky Blue
            weight: 2,
            opacity: 1,
            color: "#4682B4", // Steel Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default E
        return {
          fillColor: "#87CEEB", // Sky Blue
          weight: 2,
          opacity: 1,
          color: "#4682B4", // Steel Blue
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Marine Wetlands (M) - Different colors for different subsystems
      if (attrUpper.startsWith('M')) {
        // M1 = Marine Subtidal
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#000080", // Navy
            weight: 2,
            opacity: 1,
            color: "#0000CD", // Medium Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // M2 = Marine Intertidal
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#4169E1", // Royal Blue
            weight: 2,
            opacity: 1,
            color: "#0000CD", // Medium Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // Default M
        return {
          fillColor: "#4169E1", // Royal Blue
          weight: 2,
          opacity: 1,
          color: "#0000CD", // Medium Blue
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
      
      // Riverine Wetlands (R) - Different colors for different subsystems
      if (attrUpper.startsWith('R')) {
        // R1 = Riverine Lower Perennial
        if (attrUpper.includes('1')) {
          return {
            fillColor: "#1E90FF", // Dodger Blue
            weight: 2,
            opacity: 1,
            color: "#0000FF", // Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // R2 = Riverine Upper Perennial
        if (attrUpper.includes('2')) {
          return {
            fillColor: "#87CEFA", // Light Sky Blue
            weight: 2,
            opacity: 1,
            color: "#1E90FF", // Dodger Blue
            fillOpacity: 0.8,
            dashArray: "0"
          }
        }
        // R3/R4/R5 = Riverine Intermittent
        if (attrUpper.includes('3') || attrUpper.includes('4') || attrUpper.includes('5')) {
          return {
            fillColor: "#ADD8E6", // Light Blue
            weight: 2,
            opacity: 1,
            color: "#87CEEB", // Sky Blue
            fillOpacity: 0.8,
            dashArray: "5, 5" // Dashed for intermittent
          }
        }
        // Default R
        return {
          fillColor: "#ADD8E6", // Light Blue
          weight: 2,
          opacity: 1,
          color: "#1E90FF", // Dodger Blue
          fillOpacity: 0.7,
          dashArray: "0"
        }
      }
    }
    
    // Fallback classification by SYSTEM
    if (system) {
      const systemUpper = system.toUpperCase()
      
      if (systemUpper.includes('PALUSTRINE')) {
        return {
          fillColor: "#90EE90", // Light Green
          weight: 2,
          opacity: 1,
          color: "#228B22", // Forest Green
          fillOpacity: 0.6,
          dashArray: "5, 5" // Dashed line for less specific classification
        }
      }
      
      if (systemUpper.includes('ESTUARINE')) {
        return {
          fillColor: "#87CEEB", // Sky Blue
          weight: 2,
          opacity: 1,
          color: "#4682B4", // Steel Blue
          fillOpacity: 0.6,
          dashArray: "5, 5"
        }
      }
      
      if (systemUpper.includes('MARINE')) {
        return {
          fillColor: "#4169E1", // Royal Blue
          weight: 2,
          opacity: 1,
          color: "#0000CD", // Medium Blue
          fillOpacity: 0.6,
          dashArray: "5, 5"
        }
      }
      
      if (systemUpper.includes('RIVERINE')) {
        return {
          fillColor: "#ADD8E6", // Light Blue
          weight: 2,
          opacity: 1,
          color: "#1E90FF", // Dodger Blue
          fillOpacity: 0.6,
          dashArray: "5, 5"
        }
      }
    }
    
    // Fallback classification by WETLAND_TYPE
    if (wetlandType) {
      const typeUpper = wetlandType.toUpperCase()
      
      if (typeUpper.includes('EMERGENT')) {
        return {
          fillColor: "#90EE90", // Light Green
          weight: 2,
          opacity: 1,
          color: "#228B22", // Forest Green
          fillOpacity: 0.5,
          dashArray: "10, 5" // More dashed for least specific
        }
      }
      
      if (typeUpper.includes('FORESTED')) {
        return {
          fillColor: "#32CD32", // Lime Green
          weight: 2,
          opacity: 1,
          color: "#006400", // Dark Green
          fillOpacity: 0.5,
          dashArray: "10, 5"
        }
      }
      
      if (typeUpper.includes('SCRUB') || typeUpper.includes('SHRUB')) {
        return {
          fillColor: "#98FB98", // Pale Green
          weight: 2,
          opacity: 1,
          color: "#00FF00", // Lime
          fillOpacity: 0.5,
          dashArray: "10, 5"
        }
      }
    }
    
    // Unknown/Other - Gray with warning pattern
    return {
      fillColor: "#D3D3D3", // Light Gray
      weight: 2,
      opacity: 1,
      color: "#696969", // Dim Gray
      fillOpacity: 0.4,
      dashArray: "15, 5" // Heavily dashed for unknown
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    const props = feature.properties
    
    if (props.source === "LUPC") {
      // LUPC zoning popup
      layer.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold text-red-600 mb-2">LUPC Zoning</h4>
          <p><strong>Zone:</strong> ${props.zone || "N/A"}</p>
          <p><strong>Description:</strong> ${props.zoneDescription || "N/A"}</p>
        </div>
      `)
    } else if (props.source === "NWI") {
      // Enhanced wetlands popup with better classification display
      const getWetlandDescription = (attribute: string) => {
        // Comprehensive wetland type descriptions with subsystem details
        const descriptions: { [key: string]: string } = {
          'PEM': 'Palustrine Emergent Wetland',
          'PEM1': 'Palustrine Emergent Persistent Wetland',
          'PEM2': 'Palustrine Emergent Non-persistent Wetland',
          'PFO': 'Palustrine Forested Wetland',
          'PFO1': 'Palustrine Forested Deciduous Wetland',
          'PFO2': 'Palustrine Forested Evergreen Wetland',
          'PFO3': 'Palustrine Forested Mixed Wetland',
          'PSS': 'Palustrine Scrub-Shrub Wetland',
          'PSS1': 'Palustrine Scrub-Shrub Deciduous Wetland',
          'PSS2': 'Palustrine Scrub-Shrub Evergreen Wetland',
          'PUB': 'Palustrine Unconsolidated Bottom',
          'PUB1': 'Palustrine Unconsolidated Bottom Mud',
          'PUB2': 'Palustrine Unconsolidated Bottom Sand',
          'PUS': 'Palustrine Unconsolidated Shore',
          'PUS1': 'Palustrine Unconsolidated Shore Mud',
          'PUS2': 'Palustrine Unconsolidated Shore Sand',
          'E1': 'Estuarine Subtidal',
          'E2': 'Estuarine Intertidal',
          'M1': 'Marine Subtidal',
          'M2': 'Marine Intertidal',
          'R1': 'Riverine Lower Perennial',
          'R2': 'Riverine Upper Perennial',
          'R3': 'Riverine Intermittent',
          'R4': 'Riverine Intermittent',
          'R5': 'Riverine Intermittent'
        }
        
        // Try exact match first, then fall back to main code
        if (descriptions[attribute]) {
          return descriptions[attribute]
        }
        
        // Extract the main code (first 3 characters)
        const mainCode = attribute.substring(0, 3)
        return descriptions[mainCode] || 'Wetland'
      }
      
      const getSubsystemDescription = (attribute: string) => {
        const subsystemDescriptions: { [key: string]: string } = {
          '1': 'Persistent/Deciduous/Lower Perennial/Subtidal/Mud',
          '2': 'Non-persistent/Evergreen/Upper Perennial/Intertidal/Sand',
          '3': 'Mixed/Intermittent',
          '4': 'Intermittent',
          '5': 'Intermittent'
        }
        
        const subsystemCode = attribute.charAt(3)
        return subsystemDescriptions[subsystemCode] || ''
      }
      
      const getWetlandColor = (attribute: string) => {
        const attrUpper = (attribute || '').toUpperCase()
        if (attrUpper.startsWith('PEM')) return 'bg-green-100 border-green-400 text-green-800'
        if (attrUpper.startsWith('PFO')) return 'bg-green-200 border-green-500 text-green-900'
        if (attrUpper.startsWith('PSS')) return 'bg-green-50 border-green-300 text-green-700'
        if (attrUpper.startsWith('PUB')) return 'bg-teal-100 border-teal-400 text-teal-800'
        if (attrUpper.startsWith('PUS')) return 'bg-cyan-100 border-cyan-400 text-cyan-800'
        if (attrUpper.startsWith('E')) return 'bg-blue-100 border-blue-400 text-blue-800'
        if (attrUpper.startsWith('M')) return 'bg-blue-200 border-blue-500 text-blue-900'
        if (attrUpper.startsWith('R')) return 'bg-sky-100 border-sky-400 text-sky-800'
        return 'bg-gray-100 border-gray-400 text-gray-800'
      }
      
      const attribute = props.ATTRIBUTE || props['Wetlands.ATTRIBUTE'] || 'Unknown'
      const wetlandType = props.WETLAND_TYPE || props['Wetlands.WETLAND_TYPE'] || ''
      const system = props.SYSTEM || props['Wetlands.SYSTEM'] || ''
      const subsystem = props.SUBSYSTEM || props['Wetlands.SUBSYSTEM'] || ''
      const wetlandClass = props.CLASS || props['Wetlands.CLASS'] || ''
      const subclass = props.SUBCLASS || props['Wetlands.SUBCLASS'] || ''
      const subtype = props.SUBTYPE || props['Wetlands.SUBTYPE'] || ''
      const acres = props.ACRES || props['Wetlands.ACRES'] || 0
      
      layer.bindPopup(`
        <div class="p-3 min-w-[360px]">
          <h4 class="font-semibold text-green-600 mb-3 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full ${getWetlandColor(attribute).split(' ')[0]}"></span>
            Wetland Information
          </h4>
          <div class="space-y-3 text-sm">
            <div class="p-3 rounded border-l-4 ${getWetlandColor(attribute)}">
              <div class="font-semibold mb-1">Classification Code</div>
              <div class="font-mono text-lg">${attribute}</div>
              <div class="font-medium mt-1">${getWetlandDescription(attribute)}</div>
              ${attribute.length > 3 ? `
                <div class="text-xs mt-1 text-gray-600">
                  Subsystem: ${getSubsystemDescription(attribute)}
                </div>
              ` : ''}
            </div>
            
            ${wetlandType ? `
              <div class="bg-blue-50 p-2 rounded">
                <div class="font-medium text-blue-800">Wetland Type</div>
                <div class="text-blue-700">${wetlandType}</div>
              </div>
            ` : ''}
            
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-semibold mb-2 text-gray-800">Classification Hierarchy</div>
              <div class="space-y-1 text-xs">
                ${system ? `<div><strong>System:</strong> ${system}</div>` : ''}
                ${subsystem ? `<div><strong>Subsystem:</strong> ${subsystem}</div>` : ''}
                ${wetlandClass ? `<div><strong>Class:</strong> ${wetlandClass}</div>` : ''}
                ${subclass ? `<div><strong>Subclass:</strong> ${subclass}</div>` : ''}
                ${subtype ? `<div><strong>Subtype:</strong> ${subtype}</div>` : ''}
              </div>
            </div>
            
            ${acres > 0 ? `
              <div class="bg-blue-50 p-2 rounded text-xs">
                <div class="font-medium text-blue-800">Area Information</div>
                <div class="text-blue-700">
                  <div><strong>Area:</strong> ${acres.toFixed(2)} acres</div>
                  <div><strong>Hectares:</strong> ${(acres * 0.404686).toFixed(2)} ha</div>
                  <div><strong>Square Feet:</strong> ${(acres * 43560).toFixed(0)} sq ft</div>
                </div>
              </div>
            ` : ''}
            
            <div class="bg-yellow-50 p-2 rounded text-xs">
              <div class="font-medium text-yellow-800 mb-1">Subsystem Characteristics</div>
              <div class="text-yellow-700">
                ${attribute.startsWith('PEM') ? `
                  <div><strong>PEM1:</strong> Persistent emergent vegetation (cattails, bulrush)</div>
                  <div><strong>PEM2:</strong> Non-persistent emergent vegetation (wild rice, arrowhead)</div>
                ` : ''}
                ${attribute.startsWith('PFO') ? `
                  <div><strong>PFO1:</strong> Deciduous forested wetland (red maple, black ash)</div>
                  <div><strong>PFO2:</strong> Evergreen forested wetland (black spruce, tamarack)</div>
                  <div><strong>PFO3:</strong> Mixed forested wetland (deciduous and evergreen)</div>
                ` : ''}
                ${attribute.startsWith('PSS') ? `
                  <div><strong>PSS1:</strong> Deciduous scrub-shrub wetland (willow, alder)</div>
                  <div><strong>PSS2:</strong> Evergreen scrub-shrub wetland (cedar, hemlock)</div>
                ` : ''}
                ${attribute.startsWith('PUB') ? `
                  <div><strong>PUB1:</strong> Mud bottom wetland</div>
                  <div><strong>PUB2:</strong> Sand bottom wetland</div>
                ` : ''}
                ${attribute.startsWith('PUS') ? `
                  <div><strong>PUS1:</strong> Mud shore wetland</div>
                  <div><strong>PUS2:</strong> Sand shore wetland</div>
                ` : ''}
                ${attribute.startsWith('E') ? `
                  <div><strong>E1:</strong> Subtidal estuarine wetland (always underwater)</div>
                  <div><strong>E2:</strong> Intertidal estuarine wetland (exposed at low tide)</div>
                ` : ''}
                ${attribute.startsWith('M') ? `
                  <div><strong>M1:</strong> Subtidal marine wetland (always underwater)</div>
                  <div><strong>M2:</strong> Intertidal marine wetland (exposed at low tide)</div>
                ` : ''}
                ${attribute.startsWith('R') ? `
                  <div><strong>R1:</strong> Lower perennial riverine wetland</div>
                  <div><strong>R2:</strong> Upper perennial riverine wetland</div>
                  <div><strong>R3/R4/R5:</strong> Intermittent riverine wetland</div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div class="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1">
            <div><strong>Source:</strong> National Wetlands Inventory (USFWS)</div>
            <div><strong>Mapping Level:</strong> Reconnaissance</div>
            <div class="text-orange-600 font-medium">
              <strong>⚠️ Regulatory Note:</strong> Contact USACE for jurisdictional determinations
            </div>
          </div>
        </div>
      `)
    } else {
      // Parcel popup
      layer.bindPopup(`
        <div class="p-3 min-w-[280px]">
          <h4 class="font-semibold text-blue-600 mb-3">Parcel Information</h4>
          <div class="space-y-2 text-sm">
            ${props.MAP_BK_LOT ? `<div><strong>Map/Lot:</strong> ${props.MAP_BK_LOT}</div>` : ""}
            ${props.STATE_ID ? `<div><strong>State ID:</strong> ${props.STATE_ID}</div>` : ""}
            ${props.TOWN ? `<div><strong>Town:</strong> ${props.TOWN}</div>` : ""}
            ${props.COUNTY ? `<div><strong>County:</strong> ${props.COUNTY}</div>` : ""}
            ${props.PROP_LOC ? `<div><strong>Location:</strong> ${props.PROP_LOC}</div>` : ""}
            ${props.Shape__Area ? `<div><strong>Area:</strong> ${(props.Shape__Area * 0.000247105).toFixed(3)} acres</div>` : ""}
            ${props.Shape__Length ? `<div><strong>Perimeter:</strong> ${props.Shape__Length.toFixed(1)} ft</div>` : ""}
            ${props.TYPE ? `<div><strong>Type:</strong> ${props.TYPE}</div>` : ""}
            ${props.PARENT ? `<div><strong>Parent:</strong> ${props.PARENT}</div>` : ""}
          </div>
        </div>
      `)
    }
  }

  const toggleLayer = (layerName: keyof LayerConfig) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }))
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading map data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Unable to load map</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if we have any data loaded (regardless of layer visibility)
  const hasLoadedData = properties.length > 0 || parcelData || wetlandsData
  
  // Check if any layers are enabled
  const hasActiveLayers = Object.values(layers).some(enabled => enabled)
  
  if (!hasLoadedData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No data available</p>
              <p className="text-xs text-muted-foreground">Add properties to see them on the map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasActiveLayers) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No layers enabled</p>
              <p className="text-xs text-muted-foreground">Use the layer controls to enable data layers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log('Rendering UnifiedMap with:', {
    hasLoadedData,
    hasActiveLayers,
    properties: properties.length,
    parcelData: !!parcelData,
    wetlandsData: !!wetlandsData,
    center,
    bounds
  })

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLayerControls(!showLayerControls)}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Layers
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {layers.properties && properties.length > 0 && (
            <span>{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</span>
          )}
          {layers.parcels && parcelData && (
            <span className={layers.properties ? "ml-2" : ""}>
              {parcelData.metadata.parcelCount} parcel{parcelData.metadata.parcelCount !== 1 ? 's' : ''}
              {parcelData.metadata.lupcCount > 0 && (
                <span className="ml-1">• {parcelData.metadata.lupcCount} LUPC zone{parcelData.metadata.lupcCount !== 1 ? 's' : ''}</span>
              )}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Layer Controls */}
          {showLayerControls && (
            <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border min-w-[200px]">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
              </h4>
              <div className="space-y-2">
                <label className={`flex items-center justify-between cursor-pointer ${properties.length === 0 ? 'opacity-50' : ''}`}>
                  <span className="text-sm">
                    Property Markers
                    {properties.length > 0 && <span className="ml-1 text-xs text-muted-foreground">({properties.length})</span>}
                    {!showAllProperties && <span className="ml-1 text-xs text-muted-foreground">(all properties)</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer('properties')}
                    disabled={properties.length === 0}
                    className="p-1 h-6 w-6"
                  >
                    {layers.properties ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </label>
                <label className={`flex items-center justify-between cursor-pointer ${!parcelData ? 'opacity-50' : ''}`}>
                  <span className="text-sm">
                    Parcel Boundaries
                    {parcelData && <span className="ml-1 text-xs text-muted-foreground">({parcelData.metadata.parcelCount})</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer('parcels')}
                    disabled={!parcelData}
                    className="p-1 h-6 w-6"
                  >
                    {layers.parcels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </label>
                <label className={`flex items-center justify-between cursor-pointer ${!parcelData || parcelData.metadata.lupcCount === 0 ? 'opacity-50' : ''}`}>
                  <span className="text-sm">
                    LUPC Zoning
                    {parcelData && parcelData.metadata.lupcCount > 0 && <span className="ml-1 text-xs text-muted-foreground">({parcelData.metadata.lupcCount})</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer('lupcZoning')}
                    disabled={!parcelData || parcelData.metadata.lupcCount === 0}
                    className="p-1 h-6 w-6"
                  >
                    {layers.lupcZoning ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </label>
                <label className={`flex items-center justify-between cursor-pointer ${!wetlandsData ? 'opacity-50' : ''}`}>
                  <span className="text-sm">
                    Wetlands
                    {wetlandsData && <span className="ml-1 text-xs text-muted-foreground">({wetlandsData.features.length})</span>}
                    {!wetlandsData && layers.wetlands && <span className="ml-1 text-xs text-muted-foreground">(loading...)</span>}
                    {wetlandsData && wetlandsData.features.length === 0 && <span className="ml-1 text-xs text-muted-foreground">(none in area)</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer('wetlands')}
                    disabled={false}
                    className="p-1 h-6 w-6"
                  >
                    {layers.wetlands ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </label>
                {/* Enhanced Wetlands Legend */}
                {layers.wetlands && wetlandsData && wetlandsData.features.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Wetland Subsystem Classifications</p>
                    <div className="space-y-2 text-xs">
                      {/* Palustrine Emergent */}
                      <div>
                        <div className="font-medium text-green-700 mb-1">Palustrine Emergent (PEM)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#90EE90"}}></div>
                            <span>PEM1 - Persistent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#98FB98"}}></div>
                            <span>PEM2 - Non-persistent</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Palustrine Forested */}
                      <div>
                        <div className="font-medium text-green-700 mb-1">Palustrine Forested (PFO)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#228B22"}}></div>
                            <span>PFO1 - Deciduous</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#32CD32"}}></div>
                            <span>PFO2 - Evergreen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#2E8B57"}}></div>
                            <span>PFO3 - Mixed</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Palustrine Scrub-Shrub */}
                      <div>
                        <div className="font-medium text-green-700 mb-1">Palustrine Scrub-Shrub (PSS)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#98FB98"}}></div>
                            <span>PSS1 - Deciduous</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#9ACD32"}}></div>
                            <span>PSS2 - Evergreen</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Estuarine */}
                      <div>
                        <div className="font-medium text-blue-700 mb-1">Estuarine (E)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#4169E1"}}></div>
                            <span>E1 - Subtidal</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#87CEEB"}}></div>
                            <span>E2 - Intertidal</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Marine */}
                      <div>
                        <div className="font-medium text-blue-700 mb-1">Marine (M)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#000080"}}></div>
                            <span>M1 - Subtidal</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#4169E1"}}></div>
                            <span>M2 - Intertidal</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Riverine */}
                      <div>
                        <div className="font-medium text-blue-700 mb-1">Riverine (R)</div>
                        <div className="ml-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#1E90FF"}}></div>
                            <span>R1 - Lower Perennial</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{backgroundColor: "#87CEFA"}}></div>
                            <span>R2 - Upper Perennial</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded border-2 border-dashed border-blue-400" style={{backgroundColor: "#ADD8E6"}}></div>
                            <span>R3/R4/R5 - Intermittent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Future layers */}
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Coming Soon</p>
                  <label className="flex items-center justify-between cursor-not-allowed opacity-50">
                    <span className="text-sm">Flood Zones</span>
                    <EyeOff className="h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div 
            className="w-full rounded-lg overflow-hidden border" 
            style={{ 
              height,
              position: 'relative'
            }}
          >
            <MapContainer
              ref={mapRef}
              style={{ 
                height: "100%", 
                width: "100%", 
                minHeight: "400px",
                zIndex: 1
              }}
              zoomControl={true}
              center={center}
              zoom={zoom}
              bounds={bounds && !externalCenter ? bounds : undefined}
              boundsOptions={{ padding: (showAllProperties || (layers.properties && properties.length > 1)) ? [20, 20] : [10, 10] }}
              key={`map-${center[0]}-${center[1]}-${zoom}`} // Force re-render when center or zoom changes
              whenReady={() => {
                console.log('Map is ready')
                if (mapRef.current) {
                  setTimeout(() => {
                    mapRef.current.invalidateSize()
                    console.log('Map size invalidated after ready')
                  }, 100)
                }
              }}
            >
              {/* CartoDB Positron - Alternative tile server */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains={['a', 'b', 'c', 'd']}
                maxZoom={20}
                opacity={1}
                eventHandlers={{
                  loading: () => console.log('Tiles loading...'),
                  load: () => console.log('Tiles loaded successfully'),
                  tileerror: (e) => console.error('Tile error:', e)
                }}
              />
              
              {/* Property markers */}
              {layers.properties && properties.map((property) => {
                if (!property.lat || !property.lng) return null
                
                return (
                  <Marker
                    key={property.id}
                    position={[property.lat, property.lng]}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h4 className="font-semibold text-blue-600 mb-2">
                          {property.name || 'Untitled Property'}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Address:</strong> {formatPropertyAddress(property)}</p>
                          <p><strong>Purchase Price:</strong> {formatCurrency(property.purchasePrice)}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              property.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {property.available ? 'Available' : 'Occupied'}
                            </span>
                          </p>
                          {property.parcelData?.metadata?.parcelCount && (
                            <p><strong>Parcel:</strong> {property.parcelData.metadata.parcelCount} found</p>
                          )}
                        </div>
                        <div className="mt-2">
                          <a 
                            href={`/property/${property.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details →
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Parcel boundaries and LUPC zoning */}
              {layers.parcels && parcelData && (
                <GeoJSON
                  data={parcelData.geojson as any}
                  style={getParcelStyle}
                  onEachFeature={onEachFeature}
                />
              )}

              {/* Wetlands data */}
              {layers.wetlands && wetlandsData && (
                <GeoJSON
                  data={wetlandsData}
                  style={getWetlandsStyle}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <p>📍 Click on markers or parcels to view details</p>
            <p>🗺️ Use layer controls to toggle different data types</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
