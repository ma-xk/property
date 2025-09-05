"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPropertyAddress } from "@/lib/utils"
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Building2, 
  MapPin,
  Calendar,
  Receipt,
  Calculator
} from "lucide-react"

interface TaxData {
  summary: {
    totalProperties: number
    propertiesWithTaxData: number
    totalEstimatedAnnualTaxes: number
    totalStateTaxStamps: number
    totalPropertyTaxProration: number
    averageEstimatedTaxes: number
  }
  propertiesByState: Record<string, {
    count: number
    totalEstimatedTaxes: number
    totalStateTaxStamps: number
    totalPropertyTaxProration: number
    places: Record<string, {
      count: number
      totalEstimatedTaxes: number
      totalStateTaxStamps: number
      totalPropertyTaxProration: number
      millRate?: number
      properties: any[]
    }>
  }>
  properties: Array<{
    id: string
    streetAddress?: string
    city?: string
    state?: string
    zipCode?: string
    name?: string
    purchasePrice?: number
    closingDate?: string
    assessedValue?: number
    marketValue?: number
    lastAssessmentDate?: string
    estimatedAnnualTaxes?: number
    stateTaxStamps?: number
    propertyTaxProration?: number
    place?: {
      id: string
      name: string
      state: string
      millRate?: number
    }
    createdAt: string
    updatedAt: string
  }>
}

export function TaxesDashboard() {
  const router = useRouter()
  const [taxData, setTaxData] = useState<TaxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTaxData()
  }, [])

  const fetchTaxData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/taxes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tax data')
      }
      
      const data = await response.json()
      setTaxData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading tax data</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchTaxData} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!taxData) {
    return null
  }

  const { summary, propertiesByState, properties } = taxData

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {summary.propertiesWithTaxData} with tax data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Tax Estimate</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalEstimatedAnnualTaxes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(summary.averageEstimatedTaxes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State Tax Stamps</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalStateTaxStamps)}
            </div>
            <p className="text-xs text-muted-foreground">
              Closing costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Proration</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalPropertyTaxProration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Closing adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tax Summary by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(propertiesByState).map(([state, data]) => (
                <div key={state} className="border-b pb-4 last:border-b-0">
                  {/* State Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{state}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.count} {data.count === 1 ? 'property' : 'properties'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(data.totalEstimatedTaxes)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Annual est.
                      </div>
                    </div>
                  </div>
                  
                  {/* Places within State */}
                  <div className="space-y-2 ml-4">
                    {Object.entries(data.places).map(([placeName, placeData]) => {
                      // Find the first property to get the place ID
                      const firstProperty = placeData.properties[0]
                      const placeId = firstProperty?.place?.id
                      
                      return (
                        <div key={placeName} className="border-l-2 border-muted pl-3 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              {placeId ? (
                                <Link 
                                  href={`/places/${placeId}`}
                                  className="text-sm font-medium hover:text-primary transition-colors cursor-pointer underline decoration-dotted"
                                >
                                  {placeName}
                                </Link>
                              ) : (
                                <h5 className="text-sm font-medium">{placeName}</h5>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {placeData.count} {placeData.count === 1 ? 'property' : 'properties'}
                                {placeData.millRate && ` • ${placeData.millRate} mill rate`}
                              </p>
                            </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(placeData.totalEstimatedTaxes)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Annual est.
                            </div>
                          </div>
                        </div>
                        {(placeData.totalStateTaxStamps > 0 || placeData.totalPropertyTaxProration > 0) && (
                          <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                            <div>
                              <span className="text-muted-foreground">State stamps: </span>
                              <span className="font-medium">
                                {formatCurrency(placeData.totalStateTaxStamps)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Proration: </span>
                              <span className="font-medium">
                                {formatCurrency(placeData.totalPropertyTaxProration)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                    })}
                  </div>
                  
                  {/* State-level closing costs */}
                  {(data.totalStateTaxStamps > 0 || data.totalPropertyTaxProration > 0) && (
                    <div className="grid grid-cols-2 gap-4 text-xs mt-3 pt-2 border-t border-muted">
                      <div>
                        <span className="text-muted-foreground">State stamps: </span>
                        <span className="font-medium">
                          {formatCurrency(data.totalStateTaxStamps)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proration: </span>
                        <span className="font-medium">
                          {formatCurrency(data.totalPropertyTaxProration)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Property Tax Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {properties
                .filter(p => p.estimatedAnnualTaxes || p.stateTaxStamps || p.propertyTaxProration)
                .map((property) => (
                <div key={property.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Link 
                        href={`/property/${property.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors cursor-pointer block underline decoration-dotted"
                      >
                        {property.name || formatPropertyAddress(property)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {property.city && property.state 
                          ? `${property.city}, ${property.state}`
                          : property.place 
                            ? (property.place.id ? (
                                <Link 
                                  href={`/places/${property.place.id}`}
                                  className="hover:text-primary transition-colors cursor-pointer underline decoration-dotted"
                                >
                                  {property.place.name}, {property.place.state}
                                </Link>
                              ) : (
                                `${property.place.name}, ${property.place.state}`
                              ))
                            : formatPropertyAddress(property)
                        }
                      </p>
                      {property.closingDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Closed: {formatDate(property.closingDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {property.estimatedAnnualTaxes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual taxes:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(property.estimatedAnnualTaxes))}
                        </span>
                      </div>
                    )}
                    {property.stateTaxStamps && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State stamps:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(property.stateTaxStamps))}
                        </span>
                      </div>
                    )}
                    {property.propertyTaxProration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax proration:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(property.propertyTaxProration))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {properties.filter(p => p.estimatedAnnualTaxes || p.stateTaxStamps || p.propertyTaxProration).length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tax data available</h3>
                  <p className="text-muted-foreground text-sm">
                    Add estimated taxes and closing cost details to your properties to see tax information here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
