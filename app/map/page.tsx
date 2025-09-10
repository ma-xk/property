"use client"

import { useState } from "react"
import { UnifiedMap } from "@/components/unified-map"
import { SimpleMap } from "@/components/simple-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Loader2 } from "lucide-react"

export default function MapPage() {
  const [useSimpleMap, setUseSimpleMap] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      // Use Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        const bounds: [[number, number], [number, number]] | null = result.boundingbox ? [
          [parseFloat(result.boundingbox[0]), parseFloat(result.boundingbox[2])],
          [parseFloat(result.boundingbox[1]), parseFloat(result.boundingbox[3])]
        ] as [[number, number], [number, number]] : null
        
        setSearchResults({
          address: result.display_name,
          lat,
          lng,
          bounds
        })
        
        // Set map center, zoom, and bounds for the searched location
        setMapCenter([lat, lng])
        setMapZoom(16) // Zoom in close for address-level detail
        setMapBounds(bounds)
        
        console.log('Address search successful:', {
          address: result.display_name,
          coordinates: [lat, lng],
          bounds: result.boundingbox
        })
      } else {
        alert('Address not found. Please try a different address.')
      }
    } catch (error) {
      console.error('Address search error:', error)
      alert('Error searching for address. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
        <p className="text-muted-foreground">
          Explore your properties and surrounding areas with our comprehensive mapping interface.
        </p>
        
        {/* Address Search */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Address
          </h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter an address (e.g., 123 Main St, Portland, ME)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddressSearch}
              disabled={isSearching || !searchAddress.trim()}
              className="px-6"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {searchResults && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Found:</strong> {searchResults.address}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {searchResults.lat.toFixed(6)}, {searchResults.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setUseSimpleMap(!useSimpleMap)}
            className="mb-4"
          >
            {useSimpleMap ? "Switch to Full Map" : "Switch to Simple Map"}
          </Button>
        </div>
      </div>
      
      <div className="h-[calc(100vh-300px)] min-h-[600px]">
        {useSimpleMap ? (
          <SimpleMap height="100%" />
        ) : (
          <UnifiedMap 
            showAllProperties={true}
            height="100%"
            title="Property Map"
            layers={{
              properties: true,
              parcels: true,
              lupcZoning: true,
              wetlands: true
            }}
            center={mapCenter}
            zoom={mapZoom}
            bounds={mapBounds}
          />
        )}
      </div>
    </div>
  )
}
