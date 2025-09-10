"use client"

import { useEffect, useState, useRef } from "react"
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
  // Future layers
  wetlands?: boolean
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
    // Recalculate bounds when layers or data change
    const newBounds = calculateBounds()
    if (newBounds) {
      setMapBounds(newBounds)
    }
  }, [layers.properties, layers.parcels, properties, parcelData])

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
      } catch (err) {
        console.error('Additional data fetch error:', err)
        // Don't set error state for additional data - just log it
      }
    }

    fetchAdditionalData()
  }, [layers.properties, layers.parcels])

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
  const hasLoadedData = properties.length > 0 || parcelData
  
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
                {/* Future layers */}
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Coming Soon</p>
                  <label className="flex items-center justify-between cursor-not-allowed opacity-50">
                    <span className="text-sm">Wetlands</span>
                    <EyeOff className="h-4 w-4" />
                  </label>
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
