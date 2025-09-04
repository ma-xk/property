"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

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
    address: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    
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
    
    // Legacy fields (keeping for backward compatibility)
    type: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    rent: "",
    deposit: "",
    available: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Prepare data for submission, converting strings to numbers where needed
      const submitData = {
        // Address fields
        address: formData.address,
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        
        // Basic Property Info
        name: formData.name || undefined,
        description: formData.description || undefined,
        acres: formData.acres ? parseFloat(formData.acres) : undefined,
        zoning: formData.zoning || undefined,
        
        // Purchase Information
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        earnestMoney: formData.earnestMoney ? parseFloat(formData.earnestMoney) : undefined,
        closingDate: formData.closingDate || undefined,
        
        // Financing Details
        financingType: formData.financingType || undefined,
        financingTerms: formData.financingTerms || undefined,
        balloonDueDate: formData.balloonDueDate || undefined,
        
        // Closing Costs
        titleSettlementFee: formData.titleSettlementFee ? parseFloat(formData.titleSettlementFee) : undefined,
        titleExamination: formData.titleExamination ? parseFloat(formData.titleExamination) : undefined,
        ownersPolicyPremium: formData.ownersPolicyPremium ? parseFloat(formData.ownersPolicyPremium) : undefined,
        recordingFeesDeed: formData.recordingFeesDeed ? parseFloat(formData.recordingFeesDeed) : undefined,
        stateTaxStamps: formData.stateTaxStamps ? parseFloat(formData.stateTaxStamps) : undefined,
        eRecordingFee: formData.eRecordingFee ? parseFloat(formData.eRecordingFee) : undefined,
        propertyTaxProration: formData.propertyTaxProration ? parseFloat(formData.propertyTaxProration) : undefined,
        realEstateCommission: formData.realEstateCommission ? parseFloat(formData.realEstateCommission) : undefined,
        
        // People/Companies
        seller: formData.seller || undefined,
        sellerAgent: formData.sellerAgent || undefined,
        buyerAgent: formData.buyerAgent || undefined,
        titleCompany: formData.titleCompany || undefined,
        
        // Legacy fields (keeping for backward compatibility)
        type: formData.type || undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
        squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
        rent: formData.rent ? parseFloat(formData.rent) : undefined,
        deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
        available: formData.available,
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

      // Success!
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh() // Refresh the page to show the new property
      }
      
      // Reset form
      setFormData({
        // Address fields
        address: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        
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
        
        // Legacy fields (keeping for backward compatibility)
        type: "",
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        rent: "",
        deposit: "",
        available: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State, ZIP"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Madawaska"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="ME"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="04756"
                />
              </div>
            </div>
          </div>

          {/* Basic Property Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Winter Street Lot"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="acres">Acres</Label>
                <Input
                  id="acres"
                  name="acres"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.acres}
                  onChange={handleInputChange}
                  placeholder="0.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoning">Zoning</Label>
                <Input
                  id="zoning"
                  name="zoning"
                  value={formData.zoning}
                  onChange={handleInputChange}
                  placeholder="High Density Residential"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select type</option>
                  <option value="land">Land</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description of the property..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Purchase Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Purchase Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="30000.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="earnestMoney">Earnest Money ($)</Label>
                <Input
                  id="earnestMoney"
                  name="earnestMoney"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.earnestMoney}
                  onChange={handleInputChange}
                  placeholder="1000.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input
                  id="closingDate"
                  name="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={handleInputChange}
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
                <select
                  id="financingType"
                  name="financingType"
                  value={formData.financingType}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select financing type</option>
                  <option value="Cash">Cash</option>
                  <option value="Seller Financing">Seller Financing</option>
                  <option value="Bank Loan">Bank Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balloonDueDate">Balloon Due Date</Label>
                <Input
                  id="balloonDueDate"
                  name="balloonDueDate"
                  type="date"
                  value={formData.balloonDueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="financingTerms">Financing Terms</Label>
              <textarea
                id="financingTerms"
                name="financingTerms"
                value={formData.financingTerms}
                onChange={handleInputChange}
                placeholder="e.g., $10K down, $20K financed at 6% interest, $250/month (P+I), 18-month term"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
                  name="seller"
                  value={formData.seller}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellerAgent">Seller Agent</Label>
                <Input
                  id="sellerAgent"
                  name="sellerAgent"
                  value={formData.sellerAgent}
                  onChange={handleInputChange}
                  placeholder="Jane Smith"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buyerAgent">Buyer Agent</Label>
                <Input
                  id="buyerAgent"
                  name="buyerAgent"
                  value={formData.buyerAgent}
                  onChange={handleInputChange}
                  placeholder="Bob Johnson"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titleCompany">Title Company</Label>
                <Input
                  id="titleCompany"
                  name="titleCompany"
                  value={formData.titleCompany}
                  onChange={handleInputChange}
                  placeholder="Gateway Title of Maine"
                />
              </div>
            </div>
          </div>

          {/* Closing Costs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Closing Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleSettlementFee">Title Settlement Fee ($)</Label>
                <Input
                  id="titleSettlementFee"
                  name="titleSettlementFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.titleSettlementFee}
                  onChange={handleInputChange}
                  placeholder="325.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titleExamination">Title Examination ($)</Label>
                <Input
                  id="titleExamination"
                  name="titleExamination"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.titleExamination}
                  onChange={handleInputChange}
                  placeholder="275.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownersPolicyPremium">Owner's Policy Premium ($)</Label>
                <Input
                  id="ownersPolicyPremium"
                  name="ownersPolicyPremium"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.ownersPolicyPremium}
                  onChange={handleInputChange}
                  placeholder="100.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recordingFeesDeed">Recording Fees - Deed ($)</Label>
                <Input
                  id="recordingFeesDeed"
                  name="recordingFeesDeed"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.recordingFeesDeed}
                  onChange={handleInputChange}
                  placeholder="24.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stateTaxStamps">State Tax Stamps ($)</Label>
                <Input
                  id="stateTaxStamps"
                  name="stateTaxStamps"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stateTaxStamps}
                  onChange={handleInputChange}
                  placeholder="11.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eRecordingFee">E-Recording Fee ($)</Label>
                <Input
                  id="eRecordingFee"
                  name="eRecordingFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.eRecordingFee}
                  onChange={handleInputChange}
                  placeholder="2.50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyTaxProration">Property Tax Proration ($)</Label>
                <Input
                  id="propertyTaxProration"
                  name="propertyTaxProration"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.propertyTaxProration}
                  onChange={handleInputChange}
                  placeholder="32.03"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="realEstateCommission">Real Estate Commission ($)</Label>
                <Input
                  id="realEstateCommission"
                  name="realEstateCommission"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.realEstateCommission}
                  onChange={handleInputChange}
                  placeholder="900.00"
                />
              </div>
            </div>
          </div>

          {/* Legacy Fields (for rental properties) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rental Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="1.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input
                  id="squareFeet"
                  name="squareFeet"
                  type="number"
                  min="0"
                  value={formData.squareFeet}
                  onChange={handleInputChange}
                  placeholder="1200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent ($)</Label>
                <Input
                  id="rent"
                  name="rent"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rent}
                  onChange={handleInputChange}
                  placeholder="1500.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Security Deposit ($)</Label>
                <Input
                  id="deposit"
                  name="deposit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  placeholder="1500.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="available">Property is available for rent</Label>
            </div>
          </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || !formData.address.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
          {isLoading ? "Creating..." : "Create Property"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-600 hover:bg-gray-100">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )

  if (!showCard) {
    return (
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Property
            </CardTitle>
            <CardDescription>
              Only address is required. All other fields are optional.
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="border-gray-300 text-gray-600 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {formContent}
        </form>
      </CardContent>
    </Card>
  )
}
