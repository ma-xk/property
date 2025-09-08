"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
const STATES = [
  { value: "ME", label: "Maine" },
  { value: "NH", label: "New Hampshire" },
  { value: "VT", label: "Vermont" },
  { value: "MA", label: "Massachusetts" },
  { value: "CT", label: "Connecticut" },
  { value: "RI", label: "Rhode Island" },
] as const

const MAINE_COUNTIES = [
  "Aroostook",
  "Franklin", 
  "Hancock",
  "Kennebec",
  "Knox",
  "Lincoln",
  "Oxford",
  "Penobscot",
  "Piscataquis",
  "Somerset",
  "Waldo",
  "Washington"
] as const

const PLACE_TYPES = [
  { value: "TOWN", label: "Town" },
  { value: "UT", label: "Unorganized Territory (UT)" },
  { value: "CITY", label: "City" }
] as const

interface CreatePropertyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCard?: boolean
}

export function CreatePropertyForm({ onSuccess, onCancel, showCard = true }: CreatePropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Address fields
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Place hierarchy fields
    county: "",
    placeType: "",
    
    // Basic Property Info
    name: "",
    description: "",
    acres: "",
    zoning: "",
    
    // Purchase Information
    purchasePrice: "",
    earnestMoney: "",
    closingDate: "",
    
    // Financing Details
    financingType: "",
    financingTerms: "",
    balloonDueDate: "",
    
    // Closing Costs
    titleSettlementFee: "",
    titleExamination: "",
    ownersPolicyPremium: "",
    recordingFeesDeed: "",
    stateTaxStamps: "",
    eRecordingFee: "",
    propertyTaxProration: "",
    realEstateCommission: "",
    
    // People/Companies
    seller: "",
    sellerAgent: "",
    buyerAgent: "",
    titleCompany: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        // Convert numeric fields
        acres: formData.acres ? parseFloat(formData.acres) : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        earnestMoney: formData.earnestMoney ? parseFloat(formData.earnestMoney) : undefined,
        titleSettlementFee: formData.titleSettlementFee ? parseFloat(formData.titleSettlementFee) : undefined,
        titleExamination: formData.titleExamination ? parseFloat(formData.titleExamination) : undefined,
        ownersPolicyPremium: formData.ownersPolicyPremium ? parseFloat(formData.ownersPolicyPremium) : undefined,
        recordingFeesDeed: formData.recordingFeesDeed ? parseFloat(formData.recordingFeesDeed) : undefined,
        stateTaxStamps: formData.stateTaxStamps ? parseFloat(formData.stateTaxStamps) : undefined,
        eRecordingFee: formData.eRecordingFee ? parseFloat(formData.eRecordingFee) : undefined,
        propertyTaxProration: formData.propertyTaxProration ? parseFloat(formData.propertyTaxProration) : undefined,
        realEstateCommission: formData.realEstateCommission ? parseFloat(formData.realEstateCommission) : undefined,
        // Convert date fields
        closingDate: formData.closingDate || undefined,
        balloonDueDate: formData.balloonDueDate || undefined,
      }

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create property")
      }

      const newProperty = await response.json()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/property/${newProperty.id}`)
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

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Portland"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select State</option>
              {STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              placeholder="04101"
            />
          </div>
        </div>
      </div>

      {/* Place Hierarchy Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <select
              id="county"
              value={formData.county}
              onChange={(e) => handleInputChange("county", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select County</option>
              {MAINE_COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="placeType">Place Type</Label>
            <select
              id="placeType"
              value={formData.placeType}
              onChange={(e) => handleInputChange("placeType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {PLACE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Basic Property Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="My Property"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="acres">Acres</Label>
            <Input
              id="acres"
              type="number"
              step="0.01"
              value={formData.acres}
              onChange={(e) => handleInputChange("acres", e.target.value)}
              placeholder="1.5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zoning">Zoning</Label>
            <Input
              id="zoning"
              value={formData.zoning}
              onChange={(e) => handleInputChange("zoning", e.target.value)}
              placeholder="Residential"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Property description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>

      {/* Purchase Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Purchase Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
              placeholder="250000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="earnestMoney">Earnest Money</Label>
            <Input
              id="earnestMoney"
              type="number"
              step="0.01"
              value={formData.earnestMoney}
              onChange={(e) => handleInputChange("earnestMoney", e.target.value)}
              placeholder="5000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="closingDate">Closing Date</Label>
            <Input
              id="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={(e) => handleInputChange("closingDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Financing Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Financing Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="financingType">Financing Type</Label>
            <Input
              id="financingType"
              value={formData.financingType}
              onChange={(e) => handleInputChange("financingType", e.target.value)}
              placeholder="Conventional"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="financingTerms">Financing Terms</Label>
            <Input
              id="financingTerms"
              value={formData.financingTerms}
              onChange={(e) => handleInputChange("financingTerms", e.target.value)}
              placeholder="30 year fixed"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="balloonDueDate">Balloon Due Date</Label>
            <Input
              id="balloonDueDate"
              type="date"
              value={formData.balloonDueDate}
              onChange={(e) => handleInputChange("balloonDueDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Closing Costs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Closing Costs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titleSettlementFee">Title Settlement Fee</Label>
            <Input
              id="titleSettlementFee"
              type="number"
              step="0.01"
              value={formData.titleSettlementFee}
              onChange={(e) => handleInputChange("titleSettlementFee", e.target.value)}
              placeholder="500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleExamination">Title Examination</Label>
            <Input
              id="titleExamination"
              type="number"
              step="0.01"
              value={formData.titleExamination}
              onChange={(e) => handleInputChange("titleExamination", e.target.value)}
              placeholder="200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ownersPolicyPremium">Owner's Policy Premium</Label>
            <Input
              id="ownersPolicyPremium"
              type="number"
              step="0.01"
              value={formData.ownersPolicyPremium}
              onChange={(e) => handleInputChange("ownersPolicyPremium", e.target.value)}
              placeholder="1000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recordingFeesDeed">Recording Fees (Deed)</Label>
            <Input
              id="recordingFeesDeed"
              type="number"
              step="0.01"
              value={formData.recordingFeesDeed}
              onChange={(e) => handleInputChange("recordingFeesDeed", e.target.value)}
              placeholder="50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stateTaxStamps">State Tax Stamps</Label>
            <Input
              id="stateTaxStamps"
              type="number"
              step="0.01"
              value={formData.stateTaxStamps}
              onChange={(e) => handleInputChange("stateTaxStamps", e.target.value)}
              placeholder="250"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="eRecordingFee">E-Recording Fee</Label>
            <Input
              id="eRecordingFee"
              type="number"
              step="0.01"
              value={formData.eRecordingFee}
              onChange={(e) => handleInputChange("eRecordingFee", e.target.value)}
              placeholder="25"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyTaxProration">Property Tax Proration</Label>
            <Input
              id="propertyTaxProration"
              type="number"
              step="0.01"
              value={formData.propertyTaxProration}
              onChange={(e) => handleInputChange("propertyTaxProration", e.target.value)}
              placeholder="500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="realEstateCommission">Real Estate Commission</Label>
            <Input
              id="realEstateCommission"
              type="number"
              step="0.01"
              value={formData.realEstateCommission}
              onChange={(e) => handleInputChange("realEstateCommission", e.target.value)}
              placeholder="7500"
            />
          </div>
        </div>
      </div>

      {/* People/Companies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">People & Companies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seller">Seller</Label>
            <Input
              id="seller"
              value={formData.seller}
              onChange={(e) => handleInputChange("seller", e.target.value)}
              placeholder="John Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sellerAgent">Seller Agent</Label>
            <Input
              id="sellerAgent"
              value={formData.sellerAgent}
              onChange={(e) => handleInputChange("sellerAgent", e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buyerAgent">Buyer Agent</Label>
            <Input
              id="buyerAgent"
              value={formData.buyerAgent}
              onChange={(e) => handleInputChange("buyerAgent", e.target.value)}
              placeholder="Bob Johnson"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleCompany">Title Company</Label>
            <Input
              id="titleCompany"
              value={formData.titleCompany}
              onChange={(e) => handleInputChange("titleCompany", e.target.value)}
              placeholder="ABC Title Co."
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Create Property"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Property</CardTitle>
          <CardDescription>
            Add a new property to your portfolio with detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    )
  }

  return formContent
}