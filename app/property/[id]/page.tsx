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
import { PropertyTaxInfo } from "@/components/property-tax-info"
import { PropertyValuationHistory } from "@/components/property-valuation-history"
import { TaxPayments } from "@/components/tax-payments"
import { UnifiedMap } from "@/components/unified-map"
import { formatPropertyAddress } from "@/lib/utils"

interface TaxPayment {
  id: string
  year: number
  amount: number
  paymentDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PropertyValuationHistory {
  id: string
  year: number
  assessedValue?: number
  marketValue?: number
  assessmentDate?: string
  assessmentNotes?: string
  createdAt: string
  updatedAt: string
}

interface MillRateHistory {
  id: string
  year: number
  millRate: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Property {
  id: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  name?: string
  description?: string
  acres?: number
  zoning?: string
  
  // Valuation Information
  assessedValue?: number
  marketValue?: number
  lastAssessmentDate?: string
  assessmentNotes?: string
  
  // Ongoing financial management
  balloonDueDate?: string
  propertyTaxProration?: number
  
  // Property characteristics
  type?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rent?: number
  deposit?: number
  available?: boolean
  
  // Relationships
  user?: {
    id: string
    name?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
  
  // Relationships
  place?: {
    id: string
    name: string
    state?: string
    country: string
    taxPaymentAddress?: string
    taxPaymentWebsite?: string
    taxOfficePhone?: string
    taxDueMonth?: number
    taxDueDay?: number
    lateInterestRate?: number
    assessmentMonth?: number
    assessmentDay?: number
    millRate?: number
    taxNotes?: string
    millRateHistories?: MillRateHistory[]
  } | null
  taxPayments?: TaxPayment[]
  valuationHistories?: PropertyValuationHistory[]
  originalDeal?: {
    id: string
    name: string
    dealStage: string
    dealStatus: string
    createdAt: string
    promotedAt?: string
  } | null
}

export default function PropertyDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = useCallback(async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch property")
      }
      const data = await response.json()
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    if (status === "authenticated") {
      fetchProperty()
    } else if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, fetchProperty, router])

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The property you're looking for doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Return to Dashboard
          </button>
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
              <h1 className="text-4xl font-bold">
                {property.name || "Property Details"}
              </h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{formatPropertyAddress(property)}</span>
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

        {/* Original Deal Information */}
        {property.originalDeal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Original Deal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-green-700 mb-1">Deal Name</div>
                    <div className="font-medium text-green-800">{property.originalDeal.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700 mb-1">Deal Stage</div>
                    <div className="font-medium text-green-800">{property.originalDeal.dealStage}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700 mb-1">Promoted Date</div>
                    <div className="font-medium text-green-800">
                      {property.originalDeal.promotedAt ? 
                        new Date(property.originalDeal.promotedAt).toLocaleDateString() : 
                        new Date(property.originalDeal.createdAt).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => property.originalDeal && router.push(`/deals/${property.originalDeal.id}`)}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                    disabled={!property.originalDeal}
                  >
                    View Original Deal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Property Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Property Type</div>
                    <div className="font-medium">{property.type || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Zoning</div>
                    <div className="font-medium">{property.zoning || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bathrooms</div>
                    <div className="font-medium">{property.bathrooms || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Square Feet</div>
                    <div className="font-medium">
                      {property.squareFeet ? property.squareFeet.toLocaleString() : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Acres</div>
                    <div className="font-medium">{property.acres || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        property.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {property.description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{property.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Balloon Payment Due</div>
                    <div className="font-medium">{formatDate(property.balloonDueDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Property Tax Proration</div>
                    <div className="font-medium">{formatCurrency(property.propertyTaxProration)}</div>
                  </div>
                </div>

                {/* Rental Information */}
                {(property.rent || property.deposit) && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Rental Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Monthly Rent</div>
                        <div className="font-medium">{formatCurrency(property.rent)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Security Deposit</div>
                        <div className="font-medium">{formatCurrency(property.deposit)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Valuation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Valuation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Assessed Value</div>
                    <div className="font-medium text-lg">{formatCurrency(property.assessedValue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Market Value</div>
                    <div className="font-medium text-lg">{formatCurrency(property.marketValue)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Assessment Date</div>
                  <div className="font-medium">{formatDate(property.lastAssessmentDate)}</div>
                </div>

                {property.assessmentNotes && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Assessment Notes</div>
                    <div className="text-sm">{property.assessmentNotes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">{property.streetAddress}</div>
                    <div className="text-muted-foreground">
                      {property.city}, {property.state} {property.zipCode}
                    </div>
                  </div>
                  
                  {property.place && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Municipality</div>
                      <div className="font-medium">{property.place.name}</div>
                      {property.place.state && (
                        <div className="text-sm text-muted-foreground">
                          {property.place.state}, {property.place.country}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{formatShortDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{formatShortDate(property.updatedAt)}</span>
                </div>
                {property.acres && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="text-sm font-medium">{property.acres} acres</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tax Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PropertyTaxInfo 
            effectivePlace={property.place} 
            property={property} 
            propertyName={property.name}
            onPropertyUpdate={async (updatedProperty) => {
              try {
                const response = await fetch(`/api/properties/${propertyId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedProperty),
                })
                if (response.ok) {
                  await fetchProperty() // Refresh the property data
                }
              } catch (error) {
                console.error('Failed to update property:', error)
              }
            }}
          />
        </motion.div>

        {/* Tax Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TaxPayments 
            propertyId={propertyId} 
            taxPayments={property.taxPayments || []}
            onUpdate={fetchProperty}
          />
        </motion.div>

        {/* Valuation History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PropertyValuationHistory 
            propertyId={propertyId}
            valuationHistories={property.valuationHistories || []}
            onUpdate={fetchProperty}
          />
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedMap 
                propertyId={propertyId}
                properties={[{
                  id: property.id,
                  name: property.name || null,
                  streetAddress: property.streetAddress || null,
                  city: property.city || null,
                  state: property.state || null,
                  zipCode: property.zipCode || null,
                  purchasePrice: null,
                  available: property.available ?? true,
                  place: property.place ? { name: property.place.name } : undefined
                }]}
                center={property.streetAddress ? undefined : [44.0, -70.0]}
                zoom={property.streetAddress ? 15 : 8}
                height="400px"
                layers={{ properties: true, parcels: true }}
              />
            </CardContent>
          </Card>
        </motion.div>
    </div>
  )
}
