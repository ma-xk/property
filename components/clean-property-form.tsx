"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface CleanPropertyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCard?: boolean
}

export function CleanPropertyForm({ onSuccess, onCancel, showCard = true }: CleanPropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Address fields
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    county: "",
    placeType: "TOWN",
    
    // Basic Property Info
    name: "",
    description: "",
    acres: "",
    zoning: "",
    
    // Ongoing financial management
    balloonDueDate: "",
    propertyTaxProration: "",
    
    // Valuation information
    assessedValue: "",
    assessmentNotes: "",
    lastAssessmentDate: "",
    marketValue: "",
    
    // Property characteristics
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
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        county: formData.county || undefined,
        placeType: formData.placeType || undefined,
        name: formData.name || undefined,
        description: formData.description || undefined,
        acres: formData.acres ? parseFloat(formData.acres) : undefined,
        zoning: formData.zoning || undefined,
        
        // Ongoing financial management
        balloonDueDate: formData.balloonDueDate || undefined,
        propertyTaxProration: formData.propertyTaxProration ? parseFloat(formData.propertyTaxProration) : undefined,
        
        // Valuation information
        assessedValue: formData.assessedValue ? parseFloat(formData.assessedValue) : undefined,
        assessmentNotes: formData.assessmentNotes || undefined,
        lastAssessmentDate: formData.lastAssessmentDate || undefined,
        marketValue: formData.marketValue ? parseFloat(formData.marketValue) : undefined,
        
        // Property characteristics
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

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St Property"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Property Type</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
              <option value="Industrial">Industrial</option>
            </select>
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
            placeholder="Brief description of the property..."
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Portland"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              value={formData.acres}
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

      {/* Property Characteristics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Characteristics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleInputChange}
              placeholder="3"
            />
          </div>
          
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              step="0.5"
              value={formData.bathrooms}
              onChange={handleInputChange}
              placeholder="2.5"
            />
          </div>
          
          <div>
            <Label htmlFor="squareFeet">Square Feet</Label>
            <Input
              id="squareFeet"
              name="squareFeet"
              type="number"
              value={formData.squareFeet}
              onChange={handleInputChange}
              placeholder="2000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rent">Monthly Rent</Label>
            <Input
              id="rent"
              name="rent"
              type="number"
              step="0.01"
              value={formData.rent}
              onChange={handleInputChange}
              placeholder="1500"
            />
          </div>
          
          <div>
            <Label htmlFor="deposit">Security Deposit</Label>
            <Input
              id="deposit"
              name="deposit"
              type="number"
              step="0.01"
              value={formData.deposit}
              onChange={handleInputChange}
              placeholder="1500"
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
          <Label htmlFor="available">Property is available</Label>
        </div>
      </div>

      {/* Financial Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Financial Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="balloonDueDate">Balloon Payment Due Date</Label>
            <Input
              id="balloonDueDate"
              name="balloonDueDate"
              type="date"
              value={formData.balloonDueDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="propertyTaxProration">Property Tax Proration</Label>
            <Input
              id="propertyTaxProration"
              name="propertyTaxProration"
              type="number"
              step="0.01"
              value={formData.propertyTaxProration}
              onChange={handleInputChange}
              placeholder="500"
            />
          </div>
        </div>
      </div>

      {/* Valuation Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Valuation Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assessedValue">Assessed Value</Label>
            <Input
              id="assessedValue"
              name="assessedValue"
              type="number"
              step="0.01"
              value={formData.assessedValue}
              onChange={handleInputChange}
              placeholder="150000"
            />
          </div>
          
          <div>
            <Label htmlFor="marketValue">Market Value</Label>
            <Input
              id="marketValue"
              name="marketValue"
              type="number"
              step="0.01"
              value={formData.marketValue}
              onChange={handleInputChange}
              placeholder="175000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="lastAssessmentDate">Last Assessment Date</Label>
          <Input
            id="lastAssessmentDate"
            name="lastAssessmentDate"
            type="date"
            value={formData.lastAssessmentDate}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="assessmentNotes">Assessment Notes</Label>
          <textarea
            id="assessmentNotes"
            name="assessmentNotes"
            value={formData.assessmentNotes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notes about the property assessment..."
          />
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
          {isLoading ? "Creating..." : "Create Property"}
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
        <CardTitle>Create New Property</CardTitle>
        <CardDescription>
          Add a new property for ongoing management. For transaction details, create a deal first and then promote it to a property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
