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
  Landmark
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ComprehensivePropertyForm } from "@/components/comprehensive-property-form"

interface Property {
  id: string
  address: string
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
  
  // People/Companies
  seller?: string
  sellerAgent?: string
  buyerAgent?: string
  titleCompany?: string
  
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <ComprehensivePropertyForm
            onSuccess={handlePropertyCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Property Dashboard
            </h1>
            <p className="text-slate-300">
              Manage your properties and track performance
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Search properties by address, name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{properties.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Available Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {properties.filter(p => p.available).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(properties.reduce((total, p) => total + (Number(p.purchasePrice) || 0), 0))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Acres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {properties.reduce((total, p) => total + (Number(p.acres) || 0), 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white">Loading properties...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400">Error: {error}</div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="text-white mb-4">
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
                    className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/property/${property.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg leading-tight mb-2">
                            {property.name || "Untitled Property"}
                          </CardTitle>
                          <div className="flex items-start text-slate-300 text-sm">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="leading-tight">{property.address}</span>
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
                        <div className="flex items-center text-slate-300">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.acres ? `${Number(property.acres)} acres` : 'Size N/A'}</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <Landmark className="h-4 w-4 mr-1" />
                          <span>{property.zoning || 'Zoning N/A'}</span>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">Purchase Price</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(property.purchasePrice)}
                          </span>
                        </div>
                        {property.financingType && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Financing</span>
                            <span className="text-slate-300 text-sm">
                              {property.financingType}
                            </span>
                          </div>
                        )}
                        {property.estimatedTaxes && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Annual Taxes</span>
                            <span className="text-slate-300 text-sm">
                              {formatCurrency(property.estimatedTaxes)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Type and Date */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Property'}</span>
                        <span>Added {formatDate(property.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white bg-white/10 backdrop-blur-sm"
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
          )}
        </motion.div>
      </div>
    </div>
  )
}
