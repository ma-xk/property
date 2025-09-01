"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  MapPin,
  Square,
  Eye,
  Settings,
  Search,
  Landmark,
  User,
  Building2,
  Home,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ComprehensivePropertyForm } from "@/components/comprehensive-property-form"

interface Person {
  id: string
  name: string
  role?: string
}

interface Place {
  id: string
  name: string
  state?: string
  country: string
}

interface Property {
  id: string
  address: string // Legacy full address
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  name?: string
  description?: string
  acres?: number
  zoning?: string
  
  // Purchase Information
  purchasePrice?: number
  earnestMoney?: number
  closingDate?: string
  estimatedTaxes?: number
  
  // Financing Details
  financingType?: string
  financingTerms?: string
  balloonDueDate?: string
  
  // Closing Costs
  titleSettlementFee?: number
  titleExamination?: number
  ownersPolicyPremium?: number
  recordingFeesDeed?: number
  stateTaxStamps?: number
  eRecordingFee?: number
  propertyTaxProration?: number
  realEstateCommission?: number
  
  // People/Companies (legacy string fields)
  seller?: string
  sellerAgent?: string
  buyerAgent?: string
  titleCompany?: string
  
  // Relationship fields
  sellerPerson?: Person
  sellerAgentPerson?: Person
  buyerAgentPerson?: Person
  titleCompanyPerson?: Person
  place?: Place
  
  // Legacy fields
  type?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rent?: number
  deposit?: number
  available: boolean
  createdAt: string
  updatedAt: string
}

export function PropertiesDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")


  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }
      const data = await response.json()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handlePropertyCreated = () => {
    setShowCreateForm(false)
    fetchProperties() // Refresh the list
  }

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "Not set"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (showCreateForm) {
    return (
      <ComprehensivePropertyForm
        onSuccess={handlePropertyCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

    return (
    <div className="space-y-8">
      {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search properties by address, name, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{properties.length}</div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {properties.filter(p => p.available).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(properties.reduce((total, p) => total + (Number(p.purchasePrice) || 0), 0))}
                  </div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Acres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {properties.reduce((total, p) => total + (Number(p.acres) || 0), 0).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Properties Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading properties...</div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-destructive">Error: {error}</div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <Card className="">
                  <CardContent className="text-center py-12">
                    <div className="mb-4">
                      {properties.length === 0 
                        ? "No properties yet. Create your first property to get started!"
                        : "No properties match your search."
                      }
                    </div>
                    {properties.length === 0 && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Property
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card 
                        className=" hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => router.push(`/property/${property.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className=" text-lg leading-tight mb-2">
                                {property.name || "Untitled Property"}
                              </CardTitle>
                              <div className="space-y-1">
                            <div className="flex items-start text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="leading-tight">
                                {property.streetAddress ? 
                                  `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipCode}`.replace(/,\s*$/, '') :
                                  property.address
                                }
                              </span>
                            </div>
                            {property.place && (
                              <div className="text-blue-600 text-xs flex items-center gap-1 cursor-pointer hover:text-blue-800"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     router.push(`/places/${property.place!.id}`)
                                   }}>
                                <span>📍 {property.place.name}{property.place.state ? `, ${property.place.state}` : ''}</span>
                              </div>
                            )}
                          </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.available 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {property.available ? 'Available' : 'Occupied'}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Property Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Square className="h-4 w-4 mr-1" />
                              <span>{property.acres ? `${Number(property.acres)} acres` : 'Size N/A'}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Landmark className="h-4 w-4 mr-1" />
                              <span>{property.zoning || 'Zoning N/A'}</span>
                            </div>
                          </div>

                          {/* Financial Info */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-sm">Purchase Price</span>
                              <span className=" font-semibold">
                                {formatCurrency(property.purchasePrice)}
                              </span>
                            </div>
                            {property.financingType && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Financing</span>
                                <span className="text-muted-foreground text-sm">
                                  {property.financingType}
                                </span>
                              </div>
                            )}
                            {property.estimatedTaxes && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Annual Taxes</span>
                                <span className="text-muted-foreground text-sm">
                                  {formatCurrency(property.estimatedTaxes)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Connected People */}
                          {(property.sellerPerson || property.sellerAgentPerson || property.buyerAgentPerson || property.titleCompanyPerson) && (
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Connected People</div>
                              <div className="flex flex-wrap gap-1">
                                {property.sellerPerson && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    Seller: {property.sellerPerson.name}
                                  </span>
                                )}
                                {property.sellerAgentPerson && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    S.Agent: {property.sellerAgentPerson.name}
                                  </span>
                                )}
                                {property.buyerAgentPerson && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    B.Agent: {property.buyerAgentPerson.name}
                                  </span>
                                )}
                                {property.titleCompanyPerson && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                    Title: {property.titleCompanyPerson.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Type and Date */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Property'}</span>
                            <span>Added {formatDate(property.createdAt)}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/property/${property.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-300 text-muted-foreground hover:bg-gray-50 bg-white"
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
              )}
            </motion.div>

    </div>
  )
}
