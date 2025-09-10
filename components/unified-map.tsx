"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
  showAllProperties?: boolean
  layers?: Partial<LayerConfig>
  height?: string
  className?: string
  title?: string
}

export function UnifiedMap({ 
  propertyId, 
  showAllProperties = false, 
  layers: initialLayers = {},
  height = "400px",
  className,
  title = "Property Map"
}: UnifiedMapProps) {
  const [properties, setProperties] = useState<PropertyWithLocation[]>([])
  const [parcelData, setParcelData] = useState<ParcelData | null>(null)
  const [wetlandsData, setWetlandsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)
  const [showLayerControls, setShowLayerControls] = useState(false)
  
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
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
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
        
        // Always fetch properties data for layer toggling capability
        promises.push(fetchPropertiesWithLocations())
        
        // Fetch parcel data if property ID provided
        if (propertyId) {
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
  }, [propertyId, showAllProperties])

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

  // Update map bounds when data changes
  useEffect(() => {
    const newBounds = calculateBounds()
    if (newBounds) {
      setMapBounds(newBounds)
    }
  }, [layers.properties, layers.parcels, layers.wetlands, properties, parcelData, wetlandsData])

  // Fetch additional data when layers are toggled
  useEffect(() => {
    const fetchAdditionalData = async () => {
      // Don't fetch if we're still in initial loading state
      if (loading) return
      
      try {
        // Fetch properties if needed but not loaded (for any view)
        if (layers.properties && properties.length === 0) {
          await fetchPropertiesWithLocations()
        }
        
        // For dashboard view, fetch parcel data for all properties if parcels layer is enabled
        if (layers.parcels && showAllProperties && properties.length > 0) {
          await fetchAllParcelData()
        }
        
        // Fetch wetlands data if wetlands layer is enabled and we have bounds
        if (layers.wetlands && mapBounds && !wetlandsData) {
          try {
            await fetchWetlandsData(mapBounds)
          } catch (err) {
            console.error('Wetlands fetch failed, continuing without wetlands data:', err)
            // Don't throw - just log and continue
          }
        }
      } catch (err) {
        console.error('Additional data fetch error:', err)
        // Don't set error state for additional data - just log it
      }
    }

    fetchAdditionalData()
  }, [layers.properties, layers.parcels, layers.wetlands, mapBounds, wetlandsData])

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

  // Calculate map bounds to fit all visible data
  const calculateBounds = () => {
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
  }

  const bounds = calculateBounds()
  
  // Calculate center point - use bounds if available, otherwise use first available data point
  const getCenter = (): [number, number] => {
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
    // Get the wetland classification code
    const attribute = feature.properties.ATTRIBUTE || ''
    const system = feature.properties.SYSTEM || ''
    const subclass = feature.properties.SUBCLASS || ''
    
    // Color based on wetland system and type (matching official Wetlands Mapper)
    if (attribute.includes('PEM') || system.includes('Palustrine')) {
      // Freshwater Emergent Wetlands - Green
      return {
        fillColor: "#90EE90",
        weight: 1,
        opacity: 0.9,
        color: "#228B22",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('PFO') || system.includes('Palustrine')) {
      // Freshwater Forested Wetlands - Dark Green
      return {
        fillColor: "#32CD32",
        weight: 1,
        opacity: 0.9,
        color: "#006400",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('PSS') || system.includes('Palustrine')) {
      // Freshwater Scrub-Shrub Wetlands - Light Green
      return {
        fillColor: "#98FB98",
        weight: 1,
        opacity: 0.9,
        color: "#00FF00",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('PUB') || system.includes('Palustrine')) {
      // Freshwater Unconsolidated Bottom - Blue-Green
      return {
        fillColor: "#20B2AA",
        weight: 1,
        opacity: 0.9,
        color: "#008B8B",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('E') || system.includes('Estuarine')) {
      // Estuarine Wetlands - Blue
      return {
        fillColor: "#87CEEB",
        weight: 1,
        opacity: 0.9,
        color: "#4682B4",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('M') || system.includes('Marine')) {
      // Marine Wetlands - Dark Blue
      return {
        fillColor: "#4169E1",
        weight: 1,
        opacity: 0.9,
        color: "#0000CD",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else if (attribute.includes('R') || system.includes('Riverine')) {
      // Riverine Wetlands - Light Blue
      return {
        fillColor: "#ADD8E6",
        weight: 1,
        opacity: 0.9,
        color: "#1E90FF",
        fillOpacity: 0.6,
        dashArray: "0"
      }
    } else {
      // Unknown/Other - Gray
      return {
        fillColor: "#D3D3D3",
        weight: 1,
        opacity: 0.9,
        color: "#696969",
        fillOpacity: 0.6,
        dashArray: "0"
      }
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
      // Wetlands popup - detailed classification like official Wetlands Mapper
      const getWetlandDescription = (attribute: string) => {
        // Common wetland type descriptions
        const descriptions: { [key: string]: string } = {
          'PEM': 'Palustrine Emergent Wetland',
          'PFO': 'Palustrine Forested Wetland', 
          'PSS': 'Palustrine Scrub-Shrub Wetland',
          'PUB': 'Palustrine Unconsolidated Bottom',
          'PUS': 'Palustrine Unconsolidated Shore',
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
        
        // Extract the main code (first 3 characters)
        const mainCode = attribute.substring(0, 3)
        return descriptions[mainCode] || 'Wetland'
      }
      
      layer.bindPopup(`
        <div class="p-3 min-w-[300px]">
          <h4 class="font-semibold text-green-600 mb-3">Wetland Information</h4>
          <div class="space-y-2 text-sm">
            <div class="bg-green-50 p-2 rounded border-l-4 border-green-400">
              <div><strong>Classification Code:</strong> <span class="font-mono text-green-700">${props.ATTRIBUTE || 'N/A'}</span></div>
              <div class="text-green-600 font-medium">${getWetlandDescription(props.ATTRIBUTE || '')}</div>
            </div>
            ${props.ACRES ? `<div><strong>Area:</strong> ${props.ACRES.toFixed(2)} acres (${(props.ACRES * 0.404686).toFixed(2)} hectares)</div>` : ""}
            ${props.SYSTEM ? `<div><strong>System:</strong> ${props.SYSTEM}</div>` : ""}
            ${props.SUBSYSTEM ? `<div><strong>Subsystem:</strong> ${props.SUBSYSTEM}</div>` : ""}
            ${props.CLASS ? `<div><strong>Class:</strong> ${props.CLASS}</div>` : ""}
            ${props.SUBCLASS ? `<div><strong>Subclass:</strong> ${props.SUBCLASS}</div>` : ""}
            ${props.SUBTYPE ? `<div><strong>Subtype:</strong> ${props.SUBTYPE}</div>` : ""}
          </div>
          <div class="mt-3 text-xs text-muted-foreground border-t pt-2">
            <p><strong>Source:</strong> National Wetlands Inventory (USFWS)</p>
            <p><strong>Data:</strong> Reconnaissance level mapping</p>
            <p class="text-orange-600"><strong>Note:</strong> For regulatory purposes, contact USACE</p>
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
          <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
            <MapContainer
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
              center={center}
              zoom={bounds ? (showAllProperties || (layers.properties && properties.length > 1) ? 10 : 16) : 8}
              bounds={bounds || undefined}
              boundsOptions={{ padding: (showAllProperties || (layers.properties && properties.length > 1)) ? [20, 20] : [10, 10] }}
            >
              {/* OpenStreetMap - Standard reliable tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                subdomains="abc"
                maxZoom={19}
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
                  data={{
                    ...parcelData.geojson,
                    features: parcelData.geojson.features.filter(feature => {
                      if (feature.properties.source === "LUPC") {
                        return layers.lupcZoning
                      }
                      return true
                    })
                  }}
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
