"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  ChevronRight,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Square,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  Edit,
  Home,
  Users,
  FileText,
  Landmark,
  CreditCard
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function PropertyDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProperty = useCallback(async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Property not found")
        } else if (response.status === 401) {
          router.push("/auth/signin")
          return
        } else {
          throw new Error("Failed to fetch property")
        }
        return
      }

      const data = await response.json()
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [propertyId, router])

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProperty()
  }, [session, status, propertyId, fetchProperty, router])

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "Not set"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const calculateTotal = (values: (number | null | undefined)[]): number => {
    return values.reduce<number>((sum, val) => sum + (val || 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading property details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">Property Details</span>
          </nav>
          
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">{error}</div>
              <button 
                onClick={() => router.push("/")}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">Property Details</span>
          </nav>
          
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="text-white text-xl mb-4">Property not found</div>
              <button 
                onClick={() => router.push("/")}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-slate-300 hover:text-white transition-colors hover:bg-white/10 rounded px-2 py-1"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            <span className="text-white font-medium px-2 py-1">Property Details</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            <span className="text-slate-300 truncate max-w-xs px-2 py-1 bg-white/5 rounded" title={property.name || property.address}>
              {property.name || property.address}
            </span>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {property.name || "Property Details"}
              </h1>
              <div className="flex items-center text-slate-300 mt-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.address}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white bg-white/10 backdrop-blur-sm">
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

        {/* Property Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Property Information */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.description && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-slate-300">{property.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Square className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-white font-semibold">
                      {property.acres ? `${Number(property.acres)} acres` : "N/A"}
                    </div>
                    <div className="text-slate-400 text-sm">Size</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Landmark className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-white font-semibold">
                      {property.zoning || "N/A"}
                    </div>
                    <div className="text-slate-400 text-sm">Zoning</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Home className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-white font-semibold">
                      {property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : "Land"}
                    </div>
                    <div className="text-slate-400 text-sm">Type</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-white font-semibold">
                      {property.financingType || "N/A"}
                    </div>
                    <div className="text-slate-400 text-sm">Financing</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase & Financial Information */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Purchase Price</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(property.purchasePrice)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Earnest Money</div>
                    <div className="text-xl font-semibold text-white">
                      {formatCurrency(property.earnestMoney)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Closing Date</div>
                    <div className="text-lg font-semibold text-slate-200">
                      {formatShortDate(property.closingDate)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Annual Taxes</div>
                    <div className="text-lg font-semibold text-slate-200">
                      {formatCurrency(property.estimatedTaxes)}
                    </div>
                  </div>
                </div>
                
                {property.financingTerms && (
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Financing Terms</div>
                    <div className="text-slate-200 bg-slate-800/50 p-3 rounded-lg">
                      {property.financingTerms}
                    </div>
                  </div>
                )}
                
                {property.balloonDueDate && (
                  <div>
                    <div className="text-slate-300 text-sm mb-1">Balloon Payment Due</div>
                    <div className="text-lg font-semibold text-orange-300">
                      {formatShortDate(property.balloonDueDate)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Closing Costs */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Closing Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Title Settlement", value: property.titleSettlementFee },
                    { label: "Title Examination", value: property.titleExamination },
                    { label: "Owner's Policy", value: property.ownersPolicyPremium },
                    { label: "Recording Fees", value: property.recordingFeesDeed },
                    { label: "State Tax/Stamps", value: property.stateTaxStamps },
                    { label: "E-Recording", value: property.eRecordingFee },
                    { label: "Tax Proration", value: property.propertyTaxProration },
                    { label: "RE Commission", value: property.realEstateCommission },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total Closing Costs</span>
                    <span className="text-white font-bold text-lg">
                      {formatCurrency(calculateTotal([
                        property.titleSettlementFee,
                        property.titleExamination,
                        property.ownersPolicyPremium,
                        property.recordingFeesDeed,
                        property.stateTaxStamps,
                        property.eRecordingFee,
                        property.propertyTaxProration,
                        property.realEstateCommission
                      ]))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People & Companies */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  People & Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Seller", value: property.seller },
                    { label: "Seller Agent", value: property.sellerAgent },
                    { label: "Buyer Agent", value: property.buyerAgent },
                    { label: "Title Company", value: property.titleCompany },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-slate-300 text-sm">{item.label}</div>
                      <div className="text-white">{item.value || "Not specified"}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Status */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  property.available 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {property.available ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {property.available ? 'Available for Rent' : 'Currently Occupied'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Property Timeline */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-slate-300 text-sm">Added to portfolio</div>
                  <div className="text-white font-medium">
                    {formatDate(property.createdAt)}
                  </div>
                </div>
                
                <div>
                  <div className="text-slate-300 text-sm">Last updated</div>
                  <div className="text-white font-medium">
                    {formatDate(property.updatedAt)}
                  </div>
                </div>
                
                {property.closingDate && (
                  <div>
                    <div className="text-slate-300 text-sm">Closing date</div>
                    <div className="text-white font-medium">
                      {formatDate(property.closingDate)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Purchase Price</span>
                    <span className="text-white font-medium">{formatCurrency(property.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Closing Costs</span>
                    <span className="text-white font-medium">
                      {formatCurrency(calculateTotal([
                        property.titleSettlementFee,
                        property.titleExamination,
                        property.ownersPolicyPremium,
                        property.recordingFeesDeed,
                        property.stateTaxStamps,
                        property.eRecordingFee,
                        property.propertyTaxProration,
                        property.realEstateCommission
                      ]))}
                    </span>
                  </div>
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Total Investment</span>
                      <span className="text-white font-bold">
                        {formatCurrency((property.purchasePrice || 0) + calculateTotal([
                          property.titleSettlementFee,
                          property.titleExamination,
                          property.ownersPolicyPremium,
                          property.recordingFeesDeed,
                          property.stateTaxStamps,
                          property.eRecordingFee,
                          property.propertyTaxProration,
                          property.realEstateCommission
                        ]))}
                      </span>
                    </div>
                  </div>
                  
                  {property.acres && property.purchasePrice && (
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Price per Acre</span>
                      <span className="text-white font-medium">
                        {formatCurrency(Number(property.purchasePrice) / Number(property.acres))}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log("Edit property")
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 bg-white/90 backdrop-blur-sm"
                  onClick={() => {
                    // TODO: Toggle availability
                    console.log("Toggle availability")
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {property.available ? 'Mark as Occupied' : 'Mark as Available'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}