"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertCircle, Loader2 } from "lucide-react"

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64">Loading map...</div>
  }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
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

interface ParcelMapProps {
  propertyId: string
  className?: string
}

export function ParcelMap({ propertyId, className }: ParcelMapProps) {
  const [parcelData, setParcelData] = useState<ParcelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)

  useEffect(() => {
    const fetchParcelData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/properties/${propertyId}/parcel`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.details || errorData.error || "Failed to fetch parcel data")
        }
        
        const data = await response.json()
        setParcelData(data)
      } catch (err) {
        console.error('Parcel fetch error:', err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchParcelData()
  }, [propertyId])

  // Calculate bounds when parcel data changes
  useEffect(() => {
    if (parcelData && parcelData.geojson.features.length > 0) {
      let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
      
      parcelData.geojson.features.forEach(feature => {
        feature.geometry.coordinates.forEach(ring => {
          ring.forEach(coord => {
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
  }, [parcelData])

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

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Parcel Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading parcel data...</span>
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
            Parcel Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Unable to load parcel map</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!parcelData || parcelData.geojson.features.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Parcel Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No parcel data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate center point from parcel data
  const getParcelCenter = () => {
    if (!parcelData || !parcelData.geojson.features.length) {
      return [47.3543, -68.3235] // Default to Madawaska, ME
    }
    
    let totalLat = 0, totalLng = 0, pointCount = 0
    
    parcelData.geojson.features.forEach(feature => {
      feature.geometry.coordinates.forEach(ring => {
        ring.forEach(coord => {
          const [lng, lat] = coord
          totalLat += lat
          totalLng += lng
          pointCount++
        })
      })
    })
    
    return [totalLat / pointCount, totalLng / pointCount] as [number, number]
  }

  const parcelCenter = getParcelCenter()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Parcel Map
        </CardTitle>
        {parcelData.metadata && (
          <div className="text-sm text-muted-foreground">
            {parcelData.metadata.parcelCount} parcel{parcelData.metadata.parcelCount !== 1 ? 's' : ''} found
            {parcelData.metadata.lupcCount > 0 && (
              <span className="ml-2">• {parcelData.metadata.lupcCount} LUPC zone{parcelData.metadata.lupcCount !== 1 ? 's' : ''}</span>
            )}
            {parcelData.geojson.features.length > 0 && parcelData.geojson.features[0].properties.MAP_BK_LOT && (
              <span className="ml-2">• Map/Lot: {parcelData.geojson.features[0].properties.MAP_BK_LOT}</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full rounded-lg overflow-hidden border">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            center={parcelCenter}
            zoom={18}
            bounds={mapBounds || undefined}
            boundsOptions={{ padding: [20, 20] }}
          >
            {/* OpenStreetMap - Standard reliable tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains="abc"
              maxZoom={19}
            />
            <GeoJSON
              data={parcelData.geojson}
              style={getParcelStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        </div>
        
        {parcelData.metadata && (
          <div className="mt-3 text-xs text-muted-foreground">
            {parcelData.metadata.geocoded && (
              <p>📍 Geocoded: {parcelData.metadata.geocodeAddress} (Score: {parcelData.metadata.geocodeScore})</p>
            )}
            <p>🔍 Search: {parcelData.metadata.searchAddress}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
