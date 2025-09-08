"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  MapPin,
  Eye,
  Settings,
  Search,
  Flag,
  Globe,
  Building2,
  Home,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Property {
  id: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  name?: string
  purchasePrice?: number
  acres?: number
  type?: string

  available: boolean
  createdAt: string
}

interface Place {
  id: string
  name: string
  kind: "STATE" | "COUNTY" | "TOWN" | "UT" | "CITY"
  state?: string
  country: string
  description?: string
  createdAt: string
  updatedAt: string
  properties: Property[]
  parent?: {
    id: string
    name: string
    kind: string
  }
  county?: {
    id: string
    name: string
    kind: string
  }
  statePlace?: {
    id: string
    name: string
    kind: string
  }
  children: {
    id: string
    name: string
    kind: string
  }[]
  _count: {
    properties: number
    children: number
  }
}

export function PlacesDashboard() {
  const router = useRouter()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPlaces = async () => {
    try {
      const response = await fetch("/api/places")
      if (!response.ok) {
        throw new Error("Failed to fetch places")
      }
      const data = await response.json()
      setPlaces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaces()
  }, [])

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.parent?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.county?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group places by hierarchy level
  const states = filteredPlaces.filter(place => place.kind === "STATE")
  
  // Get towns/cities with properties first
  const townsCities = filteredPlaces.filter(place => 
    ["TOWN", "UT", "CITY"].includes(place.kind) && place._count.properties > 0
  )
  
  // Only show counties that have towns/cities with properties
  const counties = filteredPlaces.filter(place => {
    if (place.kind !== "COUNTY") return false
    
    // Check if any towns/cities with properties belong to this county
    return townsCities.some(town => town.county?.id === place.id)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTotalInvestment = (place: Place) => {
    return place.properties.reduce((total, property) => 
      total + (Number(property.purchasePrice) || 0), 0
    )
  }

  const getTotalAcres = (place: Place) => {
    return place.properties.reduce((total, property) => 
      total + (Number(property.acres) || 0), 0
    )
  }

  const getPlaceTypeLabel = (kind: string) => {
    switch (kind) {
      case "STATE": return "State"
      case "COUNTY": return "County"
      case "TOWN": return "Town"
      case "UT": return "Unorganized Territory"
      case "CITY": return "City"
      default: return kind
    }
  }

  const getPlaceHierarchyPath = (place: Place) => {
    const parts = []
    if (place.statePlace) parts.push(place.statePlace.name)
    if (place.county) parts.push(place.county.name)
    parts.push(place.name)
    return parts.join(" → ")
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground400 h-5 w-5" />
        <Input
          placeholder="Search places by name, state, country, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 border-white/20  placeholder:text-muted-foreground400"
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className=" text-sm font-medium">Total Places</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{places.length}</div>
            <div className="text-xs text-muted-foreground400 mt-1">
              {states.length} states, {counties.length} active counties, {townsCities.length} active towns/cities
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className=" text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {places.reduce((total, place) => total + place._count.properties, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className=" text-sm font-medium">States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{states.length}</div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className=" text-sm font-medium">Active Counties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{counties.length}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Places Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="">Loading places...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <Card className="">
            <CardContent className="text-center py-12">
              <div className=" mb-4">
                {places.length === 0 
                  ? "No places yet. Add your first location to get started!"
                  : "No places match your search."
                }
              </div>
              {places.length === 0 && (
                <Button
                  onClick={() => router.push("/places/new")}
                  className="bg-blue-600 hover:bg-blue-700 "
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Place
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* States */}
            {states.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  States ({states.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {states.map((place, index) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card 
                        className=" hover:bg-white/15 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/places/${place.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className=" text-lg leading-tight mb-2 flex items-center gap-2">
                                <Flag className="h-5 w-5" />
                                {place.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-muted-foreground300 text-sm">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                  {getPlaceTypeLabel(place.kind)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <span>{place.country}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground400">
                              {place._count.children} counties
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {place.description && (
                            <div className="text-sm text-muted-foreground300">
                              {place.description.length > 100 
                                ? `${place.description.substring(0, 100)}...`
                                : place.description
                              }
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground400">
                            <span>Added {formatDate(place.createdAt)}</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover: bg-white/10 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/places/${place.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Counties */}
            {counties.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Counties ({counties.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {counties.map((place, index) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card 
                        className=" hover:bg-white/15 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/places/${place.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className=" text-lg leading-tight mb-2 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {place.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-muted-foreground300 text-sm">
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                  {getPlaceTypeLabel(place.kind)}
                                </span>
                                {place.parent && (
                                  <div className="flex items-center gap-1">
                                    <Flag className="h-3 w-3" />
                                    <span>{place.parent.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground400">
                              {place._count.children} towns/cities
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {place.description && (
                            <div className="text-sm text-muted-foreground300">
                              {place.description.length > 100 
                                ? `${place.description.substring(0, 100)}...`
                                : place.description
                              }
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground400">
                            <span>Added {formatDate(place.createdAt)}</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover: bg-white/10 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/places/${place.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Towns/Cities */}
            {townsCities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Towns & Cities ({townsCities.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {townsCities.map((place, index) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card 
                        className=" hover:bg-white/15 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/places/${place.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className=" text-lg leading-tight mb-2 flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                {place.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-muted-foreground300 text-sm">
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                  {getPlaceTypeLabel(place.kind)}
                                </span>
                                <div className="text-xs">
                                  {getPlaceHierarchyPath(place)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground400">
                              {place._count.properties} properties
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Description */}
                          {place.description && (
                            <div className="text-sm text-muted-foreground300">
                              {place.description.length > 100 
                                ? `${place.description.substring(0, 100)}...`
                                : place.description
                              }
                            </div>
                          )}

                          {/* Stats */}
                          {place.properties.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div className="text-muted-foreground400">Total Investment</div>
                                <div className=" font-semibold">
                                  {formatCurrency(getTotalInvestment(place))}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-muted-foreground400">Total Acres</div>
                                <div className=" font-semibold">
                                  {getTotalAcres(place).toFixed(1)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Property Types */}
                          {place.properties.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-muted-foreground400 text-xs">Property Types</div>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(place.properties.map(p => p.type).filter(Boolean))).map(type => (
                                  <span 
                                    key={type} 
                                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                                  >
                                    {type}
                                  </span>
                                ))}
                                {place.properties.some(p => !p.type) && (
                                  <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                                    Unspecified
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Date */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground400">
                            <span>Added {formatDate(place.createdAt)}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover: bg-white/10 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/places/${place.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-400 text-gray-700 hover:bg-gray-100 bg-white/90 backdrop-blur-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
