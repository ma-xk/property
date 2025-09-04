"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  MapPin,
  Flag,
  Globe,
  Calendar,
  Square,
  Edit,
  Trash2,
  Eye,
  Landmark,
  DollarSign,
  Home,
  ChevronRight,
  Receipt,
  Phone,
  Clock,
  Percent,
  FileText,
  ExternalLink,
  Save,
  X,
  Building,
  Shield,
  Wrench,
  Mail
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Property {
  id: string
  address: string
  name?: string
  purchasePrice?: number
  acres?: number
  type?: string

  available: boolean
  createdAt: string
}

interface Place {
  id: string
  name: string
  state?: string
  country: string
  description?: string
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
  
  // Zoning Information Fields
  zoningOfficeAddress?: string
  zoningOfficePhone?: string
  zoningOfficeWebsiteUrl?: string
  
  // Code Enforcement Officer (CEO) Information
  ceoName?: string
  ceoEmail?: string
  ceoPhone?: string
  
  // Plumbing Inspector Information
  plumbingInspectorName?: string
  plumbingInspectorEmail?: string
  plumbingInspectorPhone?: string
  
  createdAt: string
  updatedAt: string
  properties: Property[]
  _count: {
    properties: number
  }
}

export default function PlaceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditingTax, setIsEditingTax] = useState(false)
  const [taxFormData, setTaxFormData] = useState({
    taxPaymentAddress: "",
    taxPaymentWebsite: "",
    taxOfficePhone: "",
    taxDueMonth: "",
    taxDueDay: "",
    lateInterestRate: "",
    assessmentMonth: "",
    assessmentDay: "",
    millRate: "",
    taxNotes: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  
  const [isEditingZoning, setIsEditingZoning] = useState(false)
  const [zoningFormData, setZoningFormData] = useState({
    zoningOfficeAddress: "",
    zoningOfficePhone: "",
    zoningOfficeWebsiteUrl: "",
    ceoName: "",
    ceoEmail: "",
    ceoPhone: "",
    plumbingInspectorName: "",
    plumbingInspectorEmail: "",
    plumbingInspectorPhone: "",
  })
  const [isSavingZoning, setIsSavingZoning] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPlace()
    }
  }, [params.id])

  const fetchPlace = async () => {
    try {
      const response = await fetch(`/api/places/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch place")
      }
      const data = await response.json()
      setPlace(data)
      // Initialize form data when place is loaded
      initializeTaxFormData(data)
      initializeZoningFormData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const initializeTaxFormData = (placeData: Place) => {
    setTaxFormData({
      taxPaymentAddress: placeData.taxPaymentAddress || "",
      taxPaymentWebsite: placeData.taxPaymentWebsite || "",
      taxOfficePhone: placeData.taxOfficePhone || "",
      taxDueMonth: placeData.taxDueMonth?.toString() || "",
      taxDueDay: placeData.taxDueDay?.toString() || "",
      lateInterestRate: placeData.lateInterestRate?.toString() || "",
      assessmentMonth: placeData.assessmentMonth?.toString() || "",
      assessmentDay: placeData.assessmentDay?.toString() || "",
      millRate: placeData.millRate?.toString() || "",
      taxNotes: placeData.taxNotes || "",
    })
  }

  const initializeZoningFormData = (placeData: Place) => {
    setZoningFormData({
      zoningOfficeAddress: placeData.zoningOfficeAddress || "",
      zoningOfficePhone: placeData.zoningOfficePhone || "",
      zoningOfficeWebsiteUrl: placeData.zoningOfficeWebsiteUrl || "",
      ceoName: placeData.ceoName || "",
      ceoEmail: placeData.ceoEmail || "",
      ceoPhone: placeData.ceoPhone || "",
      plumbingInspectorName: placeData.plumbingInspectorName || "",
      plumbingInspectorEmail: placeData.plumbingInspectorEmail || "",
      plumbingInspectorPhone: placeData.plumbingInspectorPhone || "",
    })
  }

  const handleEditTax = () => {
    setIsEditingTax(true)
    if (place) {
      initializeTaxFormData(place)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingTax(false)
    if (place) {
      initializeTaxFormData(place)
    }
  }

  const handleSaveTax = async () => {
    if (!place) return

    try {
      setIsSaving(true)
      
      // Convert string values to appropriate types
      const updateData = {
        ...place,
        taxPaymentAddress: taxFormData.taxPaymentAddress || undefined,
        taxPaymentWebsite: taxFormData.taxPaymentWebsite || undefined,
        taxOfficePhone: taxFormData.taxOfficePhone || undefined,
        taxDueMonth: taxFormData.taxDueMonth ? parseInt(taxFormData.taxDueMonth) : undefined,
        taxDueDay: taxFormData.taxDueDay ? parseInt(taxFormData.taxDueDay) : undefined,
        lateInterestRate: taxFormData.lateInterestRate ? parseFloat(taxFormData.lateInterestRate) : undefined,
        assessmentMonth: taxFormData.assessmentMonth ? parseInt(taxFormData.assessmentMonth) : undefined,
        assessmentDay: taxFormData.assessmentDay ? parseInt(taxFormData.assessmentDay) : undefined,
        millRate: taxFormData.millRate ? parseFloat(taxFormData.millRate) : undefined,
        taxNotes: taxFormData.taxNotes || undefined,
      }

      const response = await fetch(`/api/places/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update tax information')
      }

      const updatedPlace = await response.json()
      setPlace(updatedPlace)
      setIsEditingTax(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tax information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTaxFormChange = (field: string, value: string) => {
    setTaxFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEditZoning = () => {
    setIsEditingZoning(true)
    if (place) {
      initializeZoningFormData(place)
    }
  }

  const handleCancelZoningEdit = () => {
    setIsEditingZoning(false)
    if (place) {
      initializeZoningFormData(place)
    }
  }

  const handleSaveZoning = async () => {
    if (!place) return

    try {
      setIsSavingZoning(true)
      
      // Helper function to clean undefined values
      const cleanValue = (value: any) => {
        if (value === undefined || value === null || value === '') {
          return undefined
        }
        return value
      }

      const updateData: any = {
        name: place.name,
        state: place.state,
        country: place.country,
        description: place.description,
        // Tax fields (preserve existing values)
        taxPaymentAddress: place.taxPaymentAddress,
        taxPaymentWebsite: place.taxPaymentWebsite,
        taxOfficePhone: place.taxOfficePhone,
        taxDueMonth: place.taxDueMonth,
        taxDueDay: place.taxDueDay,
        lateInterestRate: place.lateInterestRate,
        assessmentMonth: place.assessmentMonth,
        assessmentDay: place.assessmentDay,
        taxNotes: place.taxNotes,
      }

      // Add zoning fields only if they have values
      const zoningOfficeAddress = cleanValue(zoningFormData.zoningOfficeAddress)
      const zoningOfficePhone = cleanValue(zoningFormData.zoningOfficePhone)
      const zoningOfficeWebsiteUrl = cleanValue(zoningFormData.zoningOfficeWebsiteUrl)
      const ceoName = cleanValue(zoningFormData.ceoName)
      const ceoEmail = cleanValue(zoningFormData.ceoEmail)
      const ceoPhone = cleanValue(zoningFormData.ceoPhone)
      const plumbingInspectorName = cleanValue(zoningFormData.plumbingInspectorName)
      const plumbingInspectorEmail = cleanValue(zoningFormData.plumbingInspectorEmail)
      const plumbingInspectorPhone = cleanValue(zoningFormData.plumbingInspectorPhone)

      if (zoningOfficeAddress !== undefined) updateData.zoningOfficeAddress = zoningOfficeAddress
      if (zoningOfficePhone !== undefined) updateData.zoningOfficePhone = zoningOfficePhone
      if (zoningOfficeWebsiteUrl !== undefined) updateData.zoningOfficeWebsiteUrl = zoningOfficeWebsiteUrl
      if (ceoName !== undefined) updateData.ceoName = ceoName
      if (ceoEmail !== undefined) updateData.ceoEmail = ceoEmail
      if (ceoPhone !== undefined) updateData.ceoPhone = ceoPhone
      if (plumbingInspectorName !== undefined) updateData.plumbingInspectorName = plumbingInspectorName
      if (plumbingInspectorEmail !== undefined) updateData.plumbingInspectorEmail = plumbingInspectorEmail
      if (plumbingInspectorPhone !== undefined) updateData.plumbingInspectorPhone = plumbingInspectorPhone

      const response = await fetch(`/api/places/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update zoning information')
      }

      const updatedPlace = await response.json()
      setPlace(updatedPlace)
      setIsEditingZoning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save zoning information")
    } finally {
      setIsSavingZoning(false)
    }
  }

  const handleZoningFormChange = (field: string, value: string) => {
    setZoningFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A"
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

  const formatTaxDate = (month?: number, day?: number) => {
    if (!month) return null
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return `${monthNames[month - 1]} ${day || 1}`
  }

  const formatPercentage = (rate?: number) => {
    if (!rate) return null
    return `${rate}%`
  }

  const getTotalInvestment = () => {
    if (!place) return 0
    return place.properties.reduce((total, property) => 
      total + (Number(property.purchasePrice) || 0), 0
    )
  }

  const getTotalAcres = () => {
    if (!place) return 0
    return place.properties.reduce((total, property) => 
      total + (Number(property.acres) || 0), 0
    )
  }



  const getAvailableProperties = () => {
    if (!place) return 0
    return place.properties.filter(p => p.available).length
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="">Loading place details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="space-y-8">
        
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-destructive text-xl mb-4">{error || "Place not found"}</div>
            <button 
              onClick={() => router.push("/")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
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
              <h1 className="text-4xl font-bold ">
                {place.name}
              </h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {place.state && `${place.state}, `}{place.country} • {place.properties.length} property{place.properties.length !== 1 ? 'ies' : 'y'}
                </span>
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

        {/* Place Info Card */}
        {place.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="">
              <CardHeader>
                <CardTitle className="">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed">{place.description}</div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Added {formatDate(place.createdAt)}
                  </div>
                  {place.updatedAt !== place.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Updated {formatDate(place.updatedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{place.properties.length}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{getAvailableProperties()}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{formatCurrency(getTotalInvestment())}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Acres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{getTotalAcres().toFixed(1)}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Property Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold ">
                {new Set(place.properties.map(p => p.type).filter(Boolean)).size || 'Mixed'}
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Avg. Price/Acre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold ">
                {getTotalAcres() > 0 ? formatCurrency(getTotalInvestment() / getTotalAcres()) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Tax Information
                </div>
                <div className="flex items-center gap-2">
                  {isEditingTax ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveTax}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditTax}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Payment Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Payment Address</Label>
                        {isEditingTax ? (
                          <textarea
                            value={taxFormData.taxPaymentAddress}
                            onChange={(e) => handleTaxFormChange('taxPaymentAddress', e.target.value)}
                            placeholder="Enter payment address..."
                            className="mt-1 w-full min-h-[60px] p-2 text-sm border rounded-md resize-none"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground break-words mt-1">
                            {place.taxPaymentAddress || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Payment Website</Label>
                        {isEditingTax ? (
                          <Input
                            type="url"
                            value={taxFormData.taxPaymentWebsite}
                            onChange={(e) => handleTaxFormChange('taxPaymentWebsite', e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.taxPaymentWebsite ? (
                              <a 
                                href={place.taxPaymentWebsite} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 break-all"
                              >
                                {place.taxPaymentWebsite.replace(/^https?:\/\//, '')}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Office Phone</Label>
                        {isEditingTax ? (
                          <Input
                            type="tel"
                            value={taxFormData.taxOfficePhone}
                            onChange={(e) => handleTaxFormChange('taxOfficePhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.taxOfficePhone ? (
                              <a href={`tel:${place.taxOfficePhone}`} className="text-blue-600 hover:text-blue-800">
                                {place.taxOfficePhone}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Dates */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Important Dates</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Tax Due Date</Label>
                        {isEditingTax ? (
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              value={taxFormData.taxDueMonth}
                              onChange={(e) => handleTaxFormChange('taxDueMonth', e.target.value)}
                              placeholder="Month (1-12)"
                              min="1"
                              max="12"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={taxFormData.taxDueDay}
                              onChange={(e) => handleTaxFormChange('taxDueDay', e.target.value)}
                              placeholder="Day (1-31)"
                              min="1"
                              max="31"
                              className="flex-1"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatTaxDate(place.taxDueMonth, place.taxDueDay) || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Assessment Date</Label>
                        {isEditingTax ? (
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              value={taxFormData.assessmentMonth}
                              onChange={(e) => handleTaxFormChange('assessmentMonth', e.target.value)}
                              placeholder="Month (1-12)"
                              min="1"
                              max="12"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={taxFormData.assessmentDay}
                              onChange={(e) => handleTaxFormChange('assessmentDay', e.target.value)}
                              placeholder="Day (1-31)"
                              min="1"
                              max="31"
                              className="flex-1"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatTaxDate(place.assessmentMonth, place.assessmentDay) || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Percent className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Late Interest Rate</Label>
                        {isEditingTax ? (
                          <Input
                            type="number"
                            value={taxFormData.lateInterestRate}
                            onChange={(e) => handleTaxFormChange('lateInterestRate', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            max="100"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(Number(place.lateInterestRate)) || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Mill Rate</Label>
                        {isEditingTax ? (
                          <Input
                            type="number"
                            value={taxFormData.millRate}
                            onChange={(e) => handleTaxFormChange('millRate', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.millRate ? `${place.millRate} mills` : "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4 md:col-span-2 lg:col-span-1">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Additional Notes</h4>
                  
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium">Tax Notes</Label>
                      {isEditingTax ? (
                        <textarea
                          value={taxFormData.taxNotes}
                          onChange={(e) => handleTaxFormChange('taxNotes', e.target.value)}
                          placeholder="Enter additional tax information, special requirements, or notes..."
                          className="mt-1 w-full min-h-[80px] p-2 text-sm border rounded-md resize-none"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words mt-1">
                          {place.taxNotes || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary message if no tax info and not editing */}
              {!isEditingTax &&
               !place.taxPaymentAddress && 
               !place.taxPaymentWebsite && 
               !place.taxOfficePhone && 
               !place.taxDueMonth && 
               !place.assessmentMonth && 
               !place.lateInterestRate && 
               !place.millRate && 
               !place.taxNotes && (
                <div className="text-center py-8 border-t mt-6">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No tax information available</h3>
                  <p className="text-muted-foreground text-sm">
                    Tax information for {place.name} has not been added yet. Click "Edit" to add information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Zoning Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Zoning Information
                </div>
                <div className="flex items-center gap-2">
                  {isEditingZoning ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelZoningEdit}
                        disabled={isSavingZoning}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveZoning}
                        disabled={isSavingZoning}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSavingZoning ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditZoning}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Zoning Office Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Zoning Office</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Office Address</Label>
                        {isEditingZoning ? (
                          <textarea
                            value={zoningFormData.zoningOfficeAddress}
                            onChange={(e) => handleZoningFormChange('zoningOfficeAddress', e.target.value)}
                            placeholder="Enter zoning office address..."
                            className="mt-1 w-full min-h-[60px] p-2 text-sm border rounded-md resize-none"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground break-words mt-1">
                            {place.zoningOfficeAddress || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Office Phone</Label>
                        {isEditingZoning ? (
                          <Input
                            type="tel"
                            value={zoningFormData.zoningOfficePhone}
                            onChange={(e) => handleZoningFormChange('zoningOfficePhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.zoningOfficePhone ? (
                              <a href={`tel:${place.zoningOfficePhone}`} className="text-blue-600 hover:text-blue-800">
                                {place.zoningOfficePhone}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Office Website</Label>
                        {isEditingZoning ? (
                          <Input
                            type="url"
                            value={zoningFormData.zoningOfficeWebsiteUrl}
                            onChange={(e) => handleZoningFormChange('zoningOfficeWebsiteUrl', e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.zoningOfficeWebsiteUrl ? (
                              <a 
                                href={place.zoningOfficeWebsiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 break-all"
                              >
                                {place.zoningOfficeWebsiteUrl.replace(/^https?:\/\//, '')}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code Enforcement Officer */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Code Enforcement Officer</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Name</Label>
                        {isEditingZoning ? (
                          <Input
                            value={zoningFormData.ceoName}
                            onChange={(e) => handleZoningFormChange('ceoName', e.target.value)}
                            placeholder="Enter CEO name..."
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.ceoName || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Email</Label>
                        {isEditingZoning ? (
                          <Input
                            type="email"
                            value={zoningFormData.ceoEmail}
                            onChange={(e) => handleZoningFormChange('ceoEmail', e.target.value)}
                            placeholder="ceo@example.com"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.ceoEmail ? (
                              <a href={`mailto:${place.ceoEmail}`} className="text-blue-600 hover:text-blue-800">
                                {place.ceoEmail}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Phone</Label>
                        {isEditingZoning ? (
                          <Input
                            type="tel"
                            value={zoningFormData.ceoPhone}
                            onChange={(e) => handleZoningFormChange('ceoPhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.ceoPhone ? (
                              <a href={`tel:${place.ceoPhone}`} className="text-blue-600 hover:text-blue-800">
                                {place.ceoPhone}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plumbing Inspector */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Plumbing Inspector</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Name</Label>
                        {isEditingZoning ? (
                          <Input
                            value={zoningFormData.plumbingInspectorName}
                            onChange={(e) => handleZoningFormChange('plumbingInspectorName', e.target.value)}
                            placeholder="Enter inspector name..."
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.plumbingInspectorName || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Email</Label>
                        {isEditingZoning ? (
                          <Input
                            type="email"
                            value={zoningFormData.plumbingInspectorEmail}
                            onChange={(e) => handleZoningFormChange('plumbingInspectorEmail', e.target.value)}
                            placeholder="inspector@example.com"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.plumbingInspectorEmail ? (
                              <a href={`mailto:${place.plumbingInspectorEmail}`} className="text-blue-600 hover:text-blue-800">
                                {place.plumbingInspectorEmail}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">Phone</Label>
                        {isEditingZoning ? (
                          <Input
                            type="tel"
                            value={zoningFormData.plumbingInspectorPhone}
                            onChange={(e) => handleZoningFormChange('plumbingInspectorPhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {place.plumbingInspectorPhone ? (
                              <a href={`tel:${place.plumbingInspectorPhone}`} className="text-blue-600 hover:text-blue-800">
                                {place.plumbingInspectorPhone}
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary message if no zoning info and not editing */}
              {!isEditingZoning &&
               !place.zoningOfficeAddress && 
               !place.zoningOfficePhone && 
               !place.zoningOfficeWebsiteUrl && 
               !place.ceoName && 
               !place.ceoEmail && 
               !place.ceoPhone && 
               !place.plumbingInspectorName && 
               !place.plumbingInspectorEmail && 
               !place.plumbingInspectorPhone && (
                <div className="text-center py-8 border-t mt-6">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No zoning information available</h3>
                  <p className="text-muted-foreground text-sm">
                    Zoning information for {place.name} has not been added yet. Click "Edit" to add information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="">
            <CardHeader>
              <CardTitle className="">Properties in {place.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {place.properties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No properties in this location yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {place.properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors group cursor-pointer"
                      onClick={() => router.push(`/property/${property.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className=" font-semibold">
                            {property.name || property.address}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.available 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {property.available ? 'Available' : 'Occupied'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.address}
                          </div>
                          {property.type && (
                            <div className="flex items-center gap-1">
                              <Landmark className="h-3 w-3" />
                              {property.type}
                            </div>
                          )}
                          {property.acres && (
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              {Number(property.acres)} acres
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="space-y-1">
                          <div className=" font-semibold">
                            {formatCurrency(property.purchasePrice)}
                          </div>
                          {property.estimatedTaxes && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(property.estimatedTaxes)} taxes/year
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(property.createdAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-400 text-blue-400 hover:bg-blue-400 hover:"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/property/${property.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Property Types Breakdown */}
        {place.properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="">
              <CardHeader>
                <CardTitle className="">Property Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(place.properties.map(p => p.type).filter(Boolean))).map(type => {
                    const count = place.properties.filter(p => p.type === type).length
                    return (
                      <span 
                        key={type} 
                        className="px-3 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full flex items-center gap-2"
                      >
                        {type}
                        <span className="bg-blue-500/30 px-2 py-0.5 rounded-full text-xs">
                          {count}
                        </span>
                      </span>
                    )
                  })}
                  {place.properties.some(p => !p.type) && (
                    <span className="px-3 py-2 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
                      Unspecified
                      <span className="bg-gray-500/30 px-2 py-0.5 rounded-full text-xs">
                        {place.properties.filter(p => !p.type).length}
                      </span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  )
}
