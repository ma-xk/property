"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface ComprehensivePropertyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ComprehensivePropertyForm({ onSuccess, onCancel }: ComprehensivePropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState(0)

  const [formData, setFormData] = useState({
    // Address fields
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
    
    // Legacy fields
    type: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    rent: "",
    deposit: "",
    available: true,
  })

  const sections = [
    { title: "Basic Information", description: "Property address and basic details" },
    { title: "Purchase Details", description: "Purchase price and transaction info" },
    { title: "Financing", description: "Financing type and terms" },
    { title: "Closing Costs", description: "All closing-related expenses" },
    { title: "People & Companies", description: "Agents, sellers, and service providers" },
    { title: "Additional Details", description: "Property features and rental info" }
  ]

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
      // Prepare data for submission, converting strings to appropriate types
      const submitData = {
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        name: formData.name || undefined,
        description: formData.description || undefined,
        acres: formData.acres ? parseFloat(formData.acres) : undefined,
        zoning: formData.zoning || undefined,
        
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        earnestMoney: formData.earnestMoney ? parseFloat(formData.earnestMoney) : undefined,
        closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : undefined,
        
        financingType: formData.financingType || undefined,
        financingTerms: formData.financingTerms || undefined,
        balloonDueDate: formData.balloonDueDate ? new Date(formData.balloonDueDate).toISOString() : undefined,
        
        titleSettlementFee: formData.titleSettlementFee ? parseFloat(formData.titleSettlementFee) : undefined,
        titleExamination: formData.titleExamination ? parseFloat(formData.titleExamination) : undefined,
        ownersPolicyPremium: formData.ownersPolicyPremium ? parseFloat(formData.ownersPolicyPremium) : undefined,
        recordingFeesDeed: formData.recordingFeesDeed ? parseFloat(formData.recordingFeesDeed) : undefined,
        stateTaxStamps: formData.stateTaxStamps ? parseFloat(formData.stateTaxStamps) : undefined,
        eRecordingFee: formData.eRecordingFee ? parseFloat(formData.eRecordingFee) : undefined,
        propertyTaxProration: formData.propertyTaxProration ? parseFloat(formData.propertyTaxProration) : undefined,
        realEstateCommission: formData.realEstateCommission ? parseFloat(formData.realEstateCommission) : undefined,
        
        seller: formData.seller || undefined,
        sellerAgent: formData.sellerAgent || undefined,
        buyerAgent: formData.buyerAgent || undefined,
        titleCompany: formData.titleCompany || undefined,
        
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
        router.refresh()
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City/Town *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Stamford"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select state</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="06901"
                />
              </div>
            </div>

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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="zoning">Zoning</Label>
                <select
                  id="zoning"
                  name="zoning"
                  value={formData.zoning}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select zoning</option>
                  <option value="High Density Residential">High Density Residential</option>
                  <option value="Low Density Residential">Low Density Residential</option>
                  <option value="Rural">Rural</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Agricultural">Agricultural</option>
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
                placeholder="Property features, condition, notes..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        )

      case 1: // Purchase Details
        return (
          <div className="space-y-4">
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
                  placeholder="25000.00"
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
        )

      case 2: // Financing
        return (
          <div className="space-y-4">
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
                <option value="Conventional Loan">Conventional Loan</option>
                <option value="Private Lender">Private Lender</option>
                <option value="Hard Money">Hard Money</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financingTerms">Financing Terms</Label>
              <textarea
                id="financingTerms"
                name="financingTerms"
                value={formData.financingTerms}
                onChange={handleInputChange}
                placeholder="e.g., $10K down, $20K financed at 6% interest, $250/month (P+I), 18-month term"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
        )

      case 3: // Closing Costs
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="ownersPolicyPremium">Owner&apos;s Policy Premium ($)</Label>
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
                <Label htmlFor="recordingFeesDeed">Recording Fees (Deed) ($)</Label>
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
                <Label htmlFor="stateTaxStamps">State Tax/Stamps ($)</Label>
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
        )

      case 4: // People & Companies
        return (
          <div className="space-y-4">
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
                  placeholder="Agent Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerAgent">Buyer Agent</Label>
                <Input
                  id="buyerAgent"
                  name="buyerAgent"
                  value={formData.buyerAgent}
                  onChange={handleInputChange}
                  placeholder="Agent Name"
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
        )

      case 5: // Additional Details
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

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
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Property
            </CardTitle>
            <CardDescription>
              Complete property information for your investment portfolio
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="border-gray-300 text-gray-600 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mt-4">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(index)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Current Section Header */}
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold">{sections[activeSection].title}</h3>
            <p className="text-sm text-gray-600">{sections[activeSection].description}</p>
          </div>

          {/* Current Section Content */}
          {renderSection()}

          {/* Navigation and Submit */}
          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              {activeSection > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveSection(activeSection - 1)}
                  className="border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {activeSection < sections.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setActiveSection(activeSection + 1)}
                  disabled={activeSection === 0 && (!formData.streetAddress.trim() || !formData.city.trim() || !formData.state.trim())}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || !formData.streetAddress.trim() || !formData.city.trim() || !formData.state.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isLoading ? "Creating..." : "Create Property"}
                </Button>
              )}

              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-600 hover:bg-gray-100">
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((activeSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
