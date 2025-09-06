"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import L from "leaflet"

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

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

// Fix for Leaflet default icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

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

export function DashboardMap() {
  const [properties, setProperties] = useState<PropertyWithLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ensure Leaflet icons are properly configured
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  useEffect(() => {
    const fetchPropertiesWithLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        
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
        console.error('Dashboard map error:', err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPropertiesWithLocations()
  }, [])

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading property locations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Unable to load property map</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No properties with location data found</p>
              <p className="text-xs text-muted-foreground">Add properties to see them on the map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate map bounds to fit all properties
  const calculateBounds = () => {
    if (properties.length === 0) return null
    
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
    
    properties.forEach(property => {
      if (property.lat && property.lng) {
        minLat = Math.min(minLat, property.lat)
        minLng = Math.min(minLng, property.lng)
        maxLat = Math.max(maxLat, property.lat)
        maxLng = Math.max(maxLng, property.lng)
      }
    })
    
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
  }

  const bounds = calculateBounds()
  const center = bounds ? [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ] as [number, number] : [47.3543, -68.3235] // Default to Madawaska, ME

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Property Map
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} with location data
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            center={center}
            zoom={bounds ? 10 : 8}
            bounds={bounds || undefined}
            boundsOptions={{ padding: [20, 20] }}
          >
            {/* OpenStreetMap - Standard reliable tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains="abc"
              maxZoom={19}
            />
            
            {/* Property markers */}
            {properties.map((property) => {
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
          </MapContainer>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <p>📍 Click on markers to view property details</p>
          <p>🗺️ Map shows properties with available location data</p>
        </div>
      </CardContent>
    </Card>
  )
}
