"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  MapPin,
  Flag,
  Globe,
  Calendar,
  Square,
  Edit,
  Trash2,
  Eye,
  Landmark,
  DollarSign,
  Home,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Property {
  id: string
  address: string
  name?: string
  purchasePrice?: number
  acres?: number
  type?: string
  estimatedTaxes?: number
  available: boolean
  createdAt: string
}

interface Place {
  id: string
  name: string
  state?: string
  country: string
  description?: string
  createdAt: string
  updatedAt: string
  properties: Property[]
  _count: {
    properties: number
  }
}

export default function PlaceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchPlace()
    }
  }, [params.id])

  const fetchPlace = async () => {
    try {
      const response = await fetch(`/api/places/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch place")
      }
      const data = await response.json()
      setPlace(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTotalInvestment = () => {
    if (!place) return 0
    return place.properties.reduce((total, property) => 
      total + (Number(property.purchasePrice) || 0), 0
    )
  }

  const getTotalAcres = () => {
    if (!place) return 0
    return place.properties.reduce((total, property) => 
      total + (Number(property.acres) || 0), 0
    )
  }

  const getTotalTaxes = () => {
    if (!place) return 0
    return place.properties.reduce((total, property) => 
      total + (Number(property.estimatedTaxes) || 0), 0
    )
  }

  const getAvailableProperties = () => {
    if (!place) return 0
    return place.properties.filter(p => p.available).length
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="">Loading place details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="space-y-8">
        
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-destructive text-xl mb-4">{error || "Place not found"}</div>
            <button 
              onClick={() => router.push("/")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold ">
                {place.name}
              </h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {place.state && `${place.state}, `}{place.country} • {place.properties.length} property{place.properties.length !== 1 ? 'ies' : 'y'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Place Info Card */}
        {place.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="">
              <CardHeader>
                <CardTitle className="">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed">{place.description}</div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Added {formatDate(place.createdAt)}
                  </div>
                  {place.updatedAt !== place.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Updated {formatDate(place.updatedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{place.properties.length}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{getAvailableProperties()}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{formatCurrency(getTotalInvestment())}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Acres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{getTotalAcres().toFixed(1)}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        {getTotalTaxes() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="">
              <CardHeader className="pb-2">
                <CardTitle className=" text-sm font-medium">Annual Taxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold ">{formatCurrency(getTotalTaxes())}</div>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="pb-2">
                <CardTitle className=" text-sm font-medium">Property Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold ">
                  {new Set(place.properties.map(p => p.type).filter(Boolean)).size || 'Mixed'}
                </div>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="pb-2">
                <CardTitle className=" text-sm font-medium">Avg. Price/Acre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold ">
                  {getTotalAcres() > 0 ? formatCurrency(getTotalInvestment() / getTotalAcres()) : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="">
            <CardHeader>
              <CardTitle className="">Properties in {place.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {place.properties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No properties in this location yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {place.properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors group cursor-pointer"
                      onClick={() => router.push(`/property/${property.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className=" font-semibold">
                            {property.name || property.address}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.available 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {property.available ? 'Available' : 'Occupied'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.address}
                          </div>
                          {property.type && (
                            <div className="flex items-center gap-1">
                              <Landmark className="h-3 w-3" />
                              {property.type}
                            </div>
                          )}
                          {property.acres && (
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              {Number(property.acres)} acres
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="space-y-1">
                          <div className=" font-semibold">
                            {formatCurrency(property.purchasePrice)}
                          </div>
                          {property.estimatedTaxes && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(property.estimatedTaxes)} taxes/year
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(property.createdAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-400 text-blue-400 hover:bg-blue-400 hover:"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/property/${property.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Property Types Breakdown */}
        {place.properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="">
              <CardHeader>
                <CardTitle className="">Property Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(place.properties.map(p => p.type).filter(Boolean))).map(type => {
                    const count = place.properties.filter(p => p.type === type).length
                    return (
                      <span 
                        key={type} 
                        className="px-3 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full flex items-center gap-2"
                      >
                        {type}
                        <span className="bg-blue-500/30 px-2 py-0.5 rounded-full text-xs">
                          {count}
                        </span>
                      </span>
                    )
                  })}
                  {place.properties.some(p => !p.type) && (
                    <span className="px-3 py-2 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
                      Unspecified
                      <span className="bg-gray-500/30 px-2 py-0.5 rounded-full text-xs">
                        {place.properties.filter(p => !p.type).length}
                      </span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  )
}
