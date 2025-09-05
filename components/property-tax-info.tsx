"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Receipt,
  MapPin,
  Globe,
  Phone,
  Calendar,
  Clock,
  Percent,
  FileText,
  ExternalLink,
  Building2,
  Edit,
  Save,
  X,
  DollarSign,
  TrendingUp
} from "lucide-react"

interface Place {
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
}

interface TaxPayment {
  id: string
  year: number
  amount: number
  paymentDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Property {
  id: string
  assessedValue?: number
  marketValue?: number
  lastAssessmentDate?: string
  assessmentNotes?: string
  taxPayments?: TaxPayment[]
}

interface PropertyTaxInfoProps {
  place?: Place | null
  property?: Property | null
  propertyName?: string
  onPropertyUpdate?: (updatedProperty: Partial<Property>) => Promise<void>
}

export function PropertyTaxInfo({ place, property, propertyName, onPropertyUpdate }: PropertyTaxInfoProps) {
  const [isEditingValuation, setIsEditingValuation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [valuationFormData, setValuationFormData] = useState({
    assessedValue: "",
    marketValue: "",
    lastAssessmentDate: "",
    assessmentNotes: "",
  })

  // Tax payment state
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [taxPayments, setTaxPayments] = useState<TaxPayment[]>(property?.taxPayments || [])
  const [paymentFormData, setPaymentFormData] = useState({
    year: new Date().getFullYear().toString(),
    amount: "",
    paymentDate: "",
    notes: "",
  })

  const initializeValuationFormData = () => {
    setValuationFormData({
      assessedValue: property?.assessedValue?.toString() || "",
      marketValue: property?.marketValue?.toString() || "",
      lastAssessmentDate: property?.lastAssessmentDate ? property.lastAssessmentDate.split('T')[0] : "",
      assessmentNotes: property?.assessmentNotes || "",
    })
  }

  const handleEditValuation = () => {
    setIsEditingValuation(true)
    initializeValuationFormData()
  }

  const handleCancelValuationEdit = () => {
    setIsEditingValuation(false)
    initializeValuationFormData()
  }

  const handleSaveValuation = async () => {
    if (!property || !onPropertyUpdate) return

    try {
      setIsSaving(true)
      
      // Convert date string to ISO DateTime format
      let lastAssessmentDate = undefined
      if (valuationFormData.lastAssessmentDate) {
        // Create a Date object and convert to ISO string
        const date = new Date(valuationFormData.lastAssessmentDate)
        lastAssessmentDate = date.toISOString()
      }
      
      const updateData = {
        assessedValue: valuationFormData.assessedValue ? parseFloat(valuationFormData.assessedValue) : undefined,
        marketValue: valuationFormData.marketValue ? parseFloat(valuationFormData.marketValue) : undefined,
        lastAssessmentDate: lastAssessmentDate,
        assessmentNotes: valuationFormData.assessmentNotes || undefined,
      }

      await onPropertyUpdate(updateData)
      setIsEditingValuation(false)
    } catch (err) {
      // Handle error silently or show user-friendly message
    } finally {
      setIsSaving(false)
    }
  }

  const handleValuationFormChange = (field: string, value: string) => {
    setValuationFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update tax payments when property changes
  useEffect(() => {
    setTaxPayments(property?.taxPayments || [])
  }, [property?.taxPayments])

  // Tax payment handlers
  const handleAddPayment = () => {
    setIsAddingPayment(true)
    setPaymentFormData({
      year: new Date().getFullYear().toString(),
      amount: "",
      paymentDate: "",
      notes: "",
    })
  }

  const handleCancelPayment = () => {
    setIsAddingPayment(false)
    setPaymentFormData({
      year: new Date().getFullYear().toString(),
      amount: "",
      paymentDate: "",
      notes: "",
    })
  }

  const handleSavePayment = async () => {
    if (!property) return

    try {
      setIsSavingPayment(true)
      
      const paymentData = {
        year: parseInt(paymentFormData.year),
        amount: parseFloat(paymentFormData.amount),
        paymentDate: new Date(paymentFormData.paymentDate).toISOString(),
        notes: paymentFormData.notes || undefined,
      }

      const response = await fetch(`/api/properties/${property.id}/tax-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save tax payment')
      }

      const newPayment = await response.json()
      setTaxPayments(prev => [newPayment, ...prev].sort((a, b) => b.year - a.year))
      setIsAddingPayment(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tax payment")
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!property || !confirm('Are you sure you want to delete this tax payment?')) return

    try {
      const response = await fetch(`/api/properties/${property.id}/tax-payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete tax payment')
      }

      setTaxPayments(prev => prev.filter(p => p.id !== paymentId))
    } catch (err) {
      alert("Failed to delete tax payment")
    }
  }

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  if (!place) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Municipal Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No location assigned</h3>
            <p className="text-muted-foreground text-sm">
              {propertyName ? `${propertyName} is` : "This property is"} not associated with a place. 
              Assign a place to view municipal tax information.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasTaxInfo = place.taxPaymentAddress || 
                     place.taxPaymentWebsite || 
                     place.taxOfficePhone || 
                     place.taxDueMonth || 
                     place.assessmentMonth || 
                     place.lateInterestRate || 
                     place.millRate || 
                     place.taxNotes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Municipal Tax Information
          <span className="text-sm font-normal text-muted-foreground">
            • {place.name}{place.state && `, ${place.state}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasTaxInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Payment Information */}
            {(place.taxPaymentAddress || place.taxPaymentWebsite || place.taxOfficePhone) && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Details</h4>
                
                <div className="space-y-3">
                  {place.taxPaymentAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Payment Address</div>
                        <div className="text-sm text-muted-foreground break-words">
                          {place.taxPaymentAddress}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.taxPaymentWebsite && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Payment Website</div>
                        <div className="text-sm text-muted-foreground">
                          <a 
                            href={place.taxPaymentWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 break-all"
                          >
                            {place.taxPaymentWebsite.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {place.taxOfficePhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Office Phone</div>
                        <div className="text-sm text-muted-foreground">
                          <a href={`tel:${place.taxOfficePhone}`} className="text-blue-600 hover:text-blue-800">
                            {place.taxOfficePhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Important Dates */}
            {(place.taxDueMonth || place.assessmentMonth || place.lateInterestRate) && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Important Dates</h4>
                
                <div className="space-y-3">
                  {place.taxDueMonth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Tax Due Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTaxDate(place.taxDueMonth, place.taxDueDay)}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.assessmentMonth && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Assessment Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTaxDate(place.assessmentMonth, place.assessmentDay)}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.lateInterestRate && (
                    <div className="flex items-center gap-3">
                      <Percent className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Late Interest Rate</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(Number(place.lateInterestRate))}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.millRate && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Mill Rate</div>
                        <div className="text-sm text-muted-foreground">
                          {place.millRate} mills
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {place.taxNotes && (
              <div className="space-y-4 md:col-span-2 lg:col-span-1">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Additional Notes</h4>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Tax Notes</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {place.taxNotes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No tax information available</h3>
            <p className="text-muted-foreground text-sm">
              Tax information for {place.name} has not been added yet.
            </p>
          </div>
        )}

        {/* Property Valuation Information */}
        {property && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Property Valuation
              </h3>
              <div className="flex items-center gap-2">
                {isEditingValuation ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelValuationEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveValuation}
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
                    onClick={handleEditValuation}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valuation Amounts */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Valuation Amounts</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium">Assessed Value</Label>
                      {isEditingValuation ? (
                        <Input
                          type="number"
                          value={valuationFormData.assessedValue}
                          onChange={(e) => handleValuationFormChange('assessedValue', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1">
                          {property.assessedValue ? `$${property.assessedValue.toLocaleString()}` : "-"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium">Market Value</Label>
                      {isEditingValuation ? (
                        <Input
                          type="number"
                          value={valuationFormData.marketValue}
                          onChange={(e) => handleValuationFormChange('marketValue', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1">
                          {property.marketValue ? `$${property.marketValue.toLocaleString()}` : "-"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Assessment Details</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium">Last Assessment Date</Label>
                      {isEditingValuation ? (
                        <Input
                          type="date"
                          value={valuationFormData.lastAssessmentDate}
                          onChange={(e) => handleValuationFormChange('lastAssessmentDate', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1">
                          {property.lastAssessmentDate ? new Date(property.lastAssessmentDate).toLocaleDateString() : "-"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium">Assessment Notes</Label>
                      {isEditingValuation ? (
                        <textarea
                          value={valuationFormData.assessmentNotes}
                          onChange={(e) => handleValuationFormChange('assessmentNotes', e.target.value)}
                          placeholder="Enter assessment notes..."
                          className="mt-1 w-full min-h-[80px] p-2 text-sm border rounded-md resize-none"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words mt-1">
                          {property.assessmentNotes || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Calculation Section */}
            {property && place && (property.assessedValue || property.marketValue) && place.millRate && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Tax Calculation</h4>
                
                <div className="space-y-3">
                  {property.assessedValue && place.millRate && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Estimated Taxes (Assessed Value)</div>
                          <div className="text-xs text-muted-foreground">
                            ${property.assessedValue.toLocaleString()} × {place.millRate} mills
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${((property.assessedValue * place.millRate) / 1000).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">per year</div>
                      </div>
                    </div>
                  )}

                  {property.marketValue && place.millRate && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Estimated Taxes (Market Value)</div>
                          <div className="text-xs text-muted-foreground">
                            ${property.marketValue.toLocaleString()} × {place.millRate} mills
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${((property.marketValue * place.millRate) / 1000).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">per year</div>
                      </div>
                    </div>
                  )}

                  {/* Tax Rate Explanation */}
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <strong>Note:</strong> Mill rate calculation: (Value × Mill Rate) ÷ 1000 = Annual Tax
                  </div>
                </div>
              </div>
            )}

            {/* Summary message if no valuation info and not editing */}
            {!isEditingValuation &&
             !property.assessedValue && 
             !property.marketValue && 
             !property.lastAssessmentDate && 
             !property.assessmentNotes && (
              <div className="text-center py-8 border-t mt-6">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No valuation information available</h3>
                <p className="text-muted-foreground text-sm">
                  Valuation information for this property has not been added yet. Click "Edit" to add information.
                </p>
              </div>
            )}

            {/* Historical Taxes Section */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Historical Taxes
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddPayment}
                  disabled={isAddingPayment}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </div>

              {/* Add Payment Form */}
              {isAddingPayment && (
                <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-4">Add Tax Payment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tax Year</Label>
                      <Input
                        type="number"
                        value={paymentFormData.year}
                        onChange={(e) => handlePaymentFormChange('year', e.target.value)}
                        placeholder="2024"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Amount</Label>
                      <Input
                        type="number"
                        value={paymentFormData.amount}
                        onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentFormData.paymentDate}
                        onChange={(e) => handlePaymentFormChange('paymentDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Notes (Optional)</Label>
                      <Input
                        value={paymentFormData.notes}
                        onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                        placeholder="Payment notes..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={handleSavePayment}
                      disabled={isSavingPayment || !paymentFormData.year || !paymentFormData.amount || !paymentFormData.paymentDate}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSavingPayment ? "Saving..." : "Save Payment"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelPayment}
                      disabled={isSavingPayment}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Tax Payments Table */}
              {taxPayments.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Tax Year</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Payment Date</th>
                        <th className="text-left p-3 font-medium">Notes</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxPayments.map((payment, index) => (
                        <tr key={payment.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="p-3 font-medium">{payment.year}</td>
                          <td className="p-3">${payment.amount.toLocaleString()}</td>
                          <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="p-3 text-muted-foreground">
                            {payment.notes || "-"}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No tax payments recorded</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start tracking your actual tax payments by adding your first payment above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
