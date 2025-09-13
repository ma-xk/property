"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateDealData, DealStage, DealStatus, DEAL_STAGES, DEAL_STATUSES } from "@/types/deal"

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
] as const

const MAINE_COUNTIES = [
  "Androscoggin", "Aroostook", "Cumberland", "Franklin", "Hancock", "Kennebec",
  "Knox", "Lincoln", "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset",
  "Waldo", "Washington", "York"
] as const

interface CreateDealFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCard?: boolean
}

export function CreateDealForm({ onSuccess, onCancel, showCard = true }: CreateDealFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<CreateDealData>({
    // Basic deal info
    name: "",
    description: "",
    dealStage: "LEAD",
    dealStatus: "ACTIVE",
    targetClosingDate: "",
    dealNotes: "",
    
    // Address fields
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    county: "",
    placeType: "TOWN",
    
    // Property information
    acres: undefined,
    zoning: "",
    
    // Deal financials
    askingPrice: undefined,
    offerPrice: undefined,
    earnestMoney: undefined,
    estimatedClosingCosts: undefined,
    
    // Purchase transaction details
    purchasePrice: undefined,
    closingDate: "",
    
    // Financing details
    financingTerms: "",
    financingType: "",
    
    // Closing costs
    titleSettlementFee: undefined,
    titleExamination: undefined,
    ownersPolicyPremium: undefined,
    recordingFeesDeed: undefined,
    stateTaxStamps: undefined,
    eRecordingFee: undefined,
    realEstateCommission: undefined,
    
    // People/Companies
    seller: "",
    sellerAgent: "",
    buyerAgent: "",
    titleCompany: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        // Convert numeric fields
        acres: formData.acres || undefined,
        askingPrice: formData.askingPrice || undefined,
        offerPrice: formData.offerPrice || undefined,
        earnestMoney: formData.earnestMoney || undefined,
        estimatedClosingCosts: formData.estimatedClosingCosts || undefined,
        purchasePrice: formData.purchasePrice || undefined,
        titleSettlementFee: formData.titleSettlementFee || undefined,
        titleExamination: formData.titleExamination || undefined,
        ownersPolicyPremium: formData.ownersPolicyPremium || undefined,
        recordingFeesDeed: formData.recordingFeesDeed || undefined,
        stateTaxStamps: formData.stateTaxStamps || undefined,
        eRecordingFee: formData.eRecordingFee || undefined,
        realEstateCommission: formData.realEstateCommission || undefined,
        // Convert date fields
        targetClosingDate: formData.targetClosingDate || undefined,
        closingDate: formData.closingDate || undefined,
      }

      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create deal")
      }

      const newDeal = await response.json()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/deals/${newDeal.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Deal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Deal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Deal Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St Land Deal"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="dealStage">Deal Stage</Label>
            <select
              id="dealStage"
              name="dealStage"
              value={formData.dealStage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(DEAL_STAGES).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dealStatus">Deal Status</Label>
            <select
              id="dealStatus"
              name="dealStatus"
              value={formData.dealStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(DEAL_STATUSES).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="targetClosingDate">Target Closing Date</Label>
            <Input
              id="targetClosingDate"
              name="targetClosingDate"
              type="date"
              value={formData.targetClosingDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the deal..."
          />
        </div>

        <div>
          <Label htmlFor="dealNotes">Deal Notes</Label>
          <textarea
            id="dealNotes"
            name="dealNotes"
            value={formData.dealNotes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes about this deal..."
          />
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="123 Main Street"
            />
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Portland"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="county">County</Label>
            <select
              id="county"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select County</option>
              {MAINE_COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="placeType">Place Type</Label>
            <select
              id="placeType"
              name="placeType"
              value={formData.placeType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOWN">Town</option>
              <option value="UT">Unorganized Territory</option>
              <option value="CITY">City</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="04101"
            />
          </div>
          
          <div>
            <Label htmlFor="acres">Acres</Label>
            <Input
              id="acres"
              name="acres"
              type="number"
              step="0.01"
              value={formData.acres || ""}
              onChange={handleInputChange}
              placeholder="5.25"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="zoning">Zoning</Label>
          <Input
            id="zoning"
            name="zoning"
            value={formData.zoning}
            onChange={handleInputChange}
            placeholder="R-1, Commercial, etc."
          />
        </div>
      </div>

      {/* Deal Financials */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Deal Financials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="askingPrice">Asking Price</Label>
            <Input
              id="askingPrice"
              name="askingPrice"
              type="number"
              step="0.01"
              value={formData.askingPrice || ""}
              onChange={handleInputChange}
              placeholder="150000"
            />
          </div>
          
          <div>
            <Label htmlFor="offerPrice">Offer Price</Label>
            <Input
              id="offerPrice"
              name="offerPrice"
              type="number"
              step="0.01"
              value={formData.offerPrice || ""}
              onChange={handleInputChange}
              placeholder="140000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="earnestMoney">Earnest Money</Label>
            <Input
              id="earnestMoney"
              name="earnestMoney"
              type="number"
              step="0.01"
              value={formData.earnestMoney || ""}
              onChange={handleInputChange}
              placeholder="5000"
            />
          </div>
          
          <div>
            <Label htmlFor="estimatedClosingCosts">Estimated Closing Costs</Label>
            <Input
              id="estimatedClosingCosts"
              name="estimatedClosingCosts"
              type="number"
              step="0.01"
              value={formData.estimatedClosingCosts || ""}
              onChange={handleInputChange}
              placeholder="3000"
            />
          </div>
        </div>
      </div>

      {/* People & Companies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">People & Companies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="seller">Seller</Label>
            <Input
              id="seller"
              name="seller"
              value={formData.seller}
              onChange={handleInputChange}
              placeholder="John Smith"
            />
          </div>
          
          <div>
            <Label htmlFor="sellerAgent">Seller Agent</Label>
            <Input
              id="sellerAgent"
              name="sellerAgent"
              value={formData.sellerAgent}
              onChange={handleInputChange}
              placeholder="Jane Doe Realty"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyerAgent">Buyer Agent</Label>
            <Input
              id="buyerAgent"
              name="buyerAgent"
              value={formData.buyerAgent}
              onChange={handleInputChange}
              placeholder="Your Agent Name"
            />
          </div>
          
          <div>
            <Label htmlFor="titleCompany">Title Company</Label>
            <Input
              id="titleCompany"
              name="titleCompany"
              value={formData.titleCompany}
              onChange={handleInputChange}
              placeholder="ABC Title Company"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Deal"}
        </Button>
      </div>
    </form>
  )

  if (!showCard) {
    return formContent
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Deal</CardTitle>
        <CardDescription>
          Add a new deal to your pipeline. You can update details later as the deal progresses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
