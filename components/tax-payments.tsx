"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Receipt,
  Plus,
  Save,
  X,
  DollarSign
} from "lucide-react"

interface TaxPayment {
  id: string
  year: number
  amount: number
  paymentDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface TaxPaymentsProps {
  propertyId: string
  taxPayments: TaxPayment[]
  onUpdate?: () => void
}

export function TaxPayments({ propertyId, taxPayments, onUpdate }: TaxPaymentsProps) {
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    year: new Date().getFullYear().toString(),
    amount: "",
    paymentDate: "",
    notes: "",
  })

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
    try {
      setIsSavingPayment(true)
      
      const paymentData = {
        year: parseInt(paymentFormData.year),
        amount: parseFloat(paymentFormData.amount),
        paymentDate: new Date(paymentFormData.paymentDate).toISOString(),
        notes: paymentFormData.notes || undefined,
      }

      const response = await fetch(`/api/properties/${propertyId}/tax-payments`, {
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

      setIsAddingPayment(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tax payment")
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this tax payment?')) return

    try {
      const response = await fetch(`/api/properties/${propertyId}/tax-payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete tax payment')
      }

      if (onUpdate) {
        onUpdate()
      }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Historical Taxes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tax Calculation Note */}
          <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
            <strong>Note:</strong> Mill rate calculation: (Value × Mill Rate) ÷ 1000 = Annual Tax
          </div>

          {/* Add Payment Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
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
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-medium text-sm mb-3">Add New Tax Payment</h4>
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
      </CardContent>
    </Card>
  )
}
