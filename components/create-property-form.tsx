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
}

export function CreatePropertyForm({ onSuccess, onCancel }: CreatePropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    address: "",
    name: "",
    description: "",
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
        address: formData.address,
        name: formData.name || undefined,
        description: formData.description || undefined,
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
        address: "",
        name: "",
        description: "",
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Required Field */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main St, City, State, ZIP"
              required
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Apartment"
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
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
                <option value="other">Other</option>
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

            <div className="space-y-2 md:col-span-2">
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
        </form>
      </CardContent>
    </Card>
  )
}
