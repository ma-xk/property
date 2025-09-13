"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DealPromotionDialog } from "@/components/deal-promotion-dialog"
import { Deal, DEAL_STAGES, DEAL_STATUSES } from "@/types/deal"

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [promoting, setPromoting] = useState(false)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/deals/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch deal")
        }
        const data = await response.json()
        setDeal(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDeal()
  }, [params])

  const handlePromoteToProperty = async () => {
    if (!deal) return
    
    setPromoting(true)
    setShowPromotionDialog(false)
    
    try {
      const response = await fetch(`/api/deals/${deal.id}/promote`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to promote deal")
      }

      const result = await response.json()
      
      // Show success message and redirect to the new property page
      router.push(`/property/${result.property.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setPromoting(false)
    }
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "Not set"
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

  const formatPropertyAddress = (deal: Deal) => {
    const parts = [deal.streetAddress, deal.city, deal.state, deal.zipCode].filter(Boolean)
    return parts.join(", ") || "No address"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading deal...</div>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            {error || "Deal not found"}
          </div>
          <Button onClick={() => router.push("/deals")}>
            Back to Deals
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{deal.name}</h1>
          <p className="text-gray-600 mt-1">{formatPropertyAddress(deal)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/deals")}>
            Back to Deals
          </Button>
          {deal.dealStage === "WON" && !deal.promotedToPropertyId && (
            <Button onClick={() => setShowPromotionDialog(true)} disabled={promoting}>
              {promoting ? "Promoting..." : "Promote to Property"}
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Deal Stage</div>
                <div className="text-lg font-semibold">{DEAL_STAGES[deal.dealStage].label}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DEAL_STAGES[deal.dealStage].color}`}>
                {DEAL_STAGES[deal.dealStage].label}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-semibold">{DEAL_STATUSES[deal.dealStatus].label}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DEAL_STATUSES[deal.dealStatus].color}`}>
                {DEAL_STATUSES[deal.dealStatus].label}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotion Status */}
      {deal.promotedToPropertyId && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-green-600">✓</div>
              <div>
                <div className="font-semibold text-green-800">Deal Promoted to Property</div>
                <div className="text-sm text-green-700">
                  This deal was successfully promoted to a property on {deal.promotedAt && formatDate(deal.promotedAt)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push(`/property/${deal.promotedToPropertyId}`)}
                >
                  View Property
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.description && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Description</div>
                <div>{deal.description}</div>
              </div>
            )}

            {deal.dealNotes && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Notes</div>
                <div>{deal.dealNotes}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {deal.targetClosingDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Target Closing Date</div>
                  <div className="font-medium">{formatDate(deal.targetClosingDate)}</div>
                </div>
              )}
              
              {deal.closingDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Actual Closing Date</div>
                  <div className="font-medium">{formatDate(deal.closingDate)}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div>{formatDate(deal.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {deal.acres && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Acres</div>
                  <div className="font-medium">{deal.acres}</div>
                </div>
              )}
              
              {deal.zoning && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Zoning</div>
                  <div className="font-medium">{deal.zoning}</div>
                </div>
              )}
            </div>

            {deal.place && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="font-medium">{deal.place.name}, {deal.place.state}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Asking Price</div>
                <div className="font-medium">{formatCurrency(deal.askingPrice)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Offer Price</div>
                <div className="font-medium">{formatCurrency(deal.offerPrice)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Purchase Price</div>
                <div className="font-medium">{formatCurrency(deal.purchasePrice)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Earnest Money</div>
                <div className="font-medium">{formatCurrency(deal.earnestMoney)}</div>
              </div>
            </div>

            {deal.estimatedClosingCosts && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Estimated Closing Costs</div>
                <div className="font-medium">{formatCurrency(deal.estimatedClosingCosts)}</div>
              </div>
            )}

            {/* Financing */}
            {(deal.financingType || deal.financingTerms) && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Financing</div>
                {deal.financingType && (
                  <div className="text-sm text-gray-500 mb-1">Type: {deal.financingType}</div>
                )}
                {deal.financingTerms && (
                  <div className="text-sm text-gray-500">Terms: {deal.financingTerms}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* People & Companies */}
        <Card>
          <CardHeader>
            <CardTitle>People & Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.seller && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Seller</div>
                <div className="font-medium">{deal.seller.name}</div>
                {deal.seller.email && (
                  <div className="text-sm text-gray-500">{deal.seller.email}</div>
                )}
                {deal.seller.phone && (
                  <div className="text-sm text-gray-500">{deal.seller.phone}</div>
                )}
              </div>
            )}

            {deal.sellerAgent && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Seller Agent</div>
                <div className="font-medium">{deal.sellerAgent.name}</div>
                {deal.sellerAgent.email && (
                  <div className="text-sm text-gray-500">{deal.sellerAgent.email}</div>
                )}
                {deal.sellerAgent.phone && (
                  <div className="text-sm text-gray-500">{deal.sellerAgent.phone}</div>
                )}
              </div>
            )}

            {deal.buyerAgent && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Buyer Agent</div>
                <div className="font-medium">{deal.buyerAgent.name}</div>
                {deal.buyerAgent.email && (
                  <div className="text-sm text-gray-500">{deal.buyerAgent.email}</div>
                )}
                {deal.buyerAgent.phone && (
                  <div className="text-sm text-gray-500">{deal.buyerAgent.phone}</div>
                )}
              </div>
            )}

            {deal.titleCompany && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Title Company</div>
                <div className="font-medium">{deal.titleCompany.name}</div>
                {deal.titleCompany.email && (
                  <div className="text-sm text-gray-500">{deal.titleCompany.email}</div>
                )}
                {deal.titleCompany.phone && (
                  <div className="text-sm text-gray-500">{deal.titleCompany.phone}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Closing Costs */}
      {(deal.titleSettlementFee || deal.titleExamination || deal.ownersPolicyPremium || 
        deal.recordingFeesDeed || deal.stateTaxStamps || deal.eRecordingFee || 
        deal.realEstateCommission) && (
        <Card>
          <CardHeader>
            <CardTitle>Closing Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deal.titleSettlementFee && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Title Settlement Fee</div>
                  <div className="font-medium">{formatCurrency(deal.titleSettlementFee)}</div>
                </div>
              )}
              
              {deal.titleExamination && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Title Examination</div>
                  <div className="font-medium">{formatCurrency(deal.titleExamination)}</div>
                </div>
              )}
              
              {deal.ownersPolicyPremium && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Owner's Policy Premium</div>
                  <div className="font-medium">{formatCurrency(deal.ownersPolicyPremium)}</div>
                </div>
              )}
              
              {deal.recordingFeesDeed && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Recording Fees</div>
                  <div className="font-medium">{formatCurrency(deal.recordingFeesDeed)}</div>
                </div>
              )}
              
              {deal.stateTaxStamps && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">State Tax Stamps</div>
                  <div className="font-medium">{formatCurrency(deal.stateTaxStamps)}</div>
                </div>
              )}
              
              {deal.eRecordingFee && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">E-Recording Fee</div>
                  <div className="font-medium">{formatCurrency(deal.eRecordingFee)}</div>
                </div>
              )}
              
              {deal.realEstateCommission && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Real Estate Commission</div>
                  <div className="font-medium">{formatCurrency(deal.realEstateCommission)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotion Dialog */}
      {deal && (
        <DealPromotionDialog
          deal={deal}
          open={showPromotionDialog}
          onOpenChange={setShowPromotionDialog}
          onConfirm={handlePromoteToProperty}
          isPromoting={promoting}
        />
      )}
    </div>
  )
}
