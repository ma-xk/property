"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  TrendingUp,
  Plus,
  Save,
  X,
  Trash2,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react"

interface PropertyValuationHistory {
  id: string
  year: number
  assessedValue?: number
  marketValue?: number
  assessmentDate?: string
  assessmentNotes?: string
  createdAt: string
  updatedAt: string
}

interface PropertyValuationHistoryProps {
  propertyId: string
  valuationHistories: PropertyValuationHistory[]
  onUpdate?: () => void
}

export function PropertyValuationHistory({ propertyId, valuationHistories, onUpdate }: PropertyValuationHistoryProps) {
  const [isAddingValuation, setIsAddingValuation] = useState(false)
  const [isSavingValuation, setIsSavingValuation] = useState(false)
  const [valuationFormData, setValuationFormData] = useState({
    year: new Date().getFullYear().toString(),
    assessedValue: "",
    marketValue: "",
    assessmentDate: "",
    assessmentNotes: "",
  })

  const handleAddValuation = () => {
    setIsAddingValuation(true)
    setValuationFormData({
      year: new Date().getFullYear().toString(),
      assessedValue: "",
      marketValue: "",
      assessmentDate: "",
      assessmentNotes: "",
    })
  }

  const handleCancelValuation = () => {
    setIsAddingValuation(false)
    setValuationFormData({
      year: new Date().getFullYear().toString(),
      assessedValue: "",
      marketValue: "",
      assessmentDate: "",
      assessmentNotes: "",
    })
  }

  const handleSaveValuation = async () => {
    try {
      setIsSavingValuation(true)
      
      const response = await fetch(`/api/properties/${propertyId}/valuations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: parseInt(valuationFormData.year),
          assessedValue: valuationFormData.assessedValue ? parseFloat(valuationFormData.assessedValue) : undefined,
          marketValue: valuationFormData.marketValue ? parseFloat(valuationFormData.marketValue) : undefined,
          assessmentDate: valuationFormData.assessmentDate || undefined,
          assessmentNotes: valuationFormData.assessmentNotes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save valuation')
      }

      setIsAddingValuation(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save valuation")
    } finally {
      setIsSavingValuation(false)
    }
  }

  const handleDeleteValuation = async (valuationId: string) => {
    if (!confirm('Are you sure you want to delete this valuation entry?')) return

    try {
      const response = await fetch(`/api/properties/${propertyId}/valuations/${valuationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete valuation')
      }

      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      alert("Failed to delete valuation")
    }
  }

  const handleValuationFormChange = (field: string, value: string) => {
    setValuationFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Property Valuation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Valuation Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddValuation}
              disabled={isAddingValuation}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Valuation
            </Button>
          </div>

          {/* Add Valuation Form */}
          {isAddingValuation && (
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-medium text-sm mb-3">Add New Valuation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Assessment Year</Label>
                  <Input
                    type="number"
                    value={valuationFormData.year}
                    onChange={(e) => handleValuationFormChange('year', e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Assessment Date</Label>
                  <Input
                    type="date"
                    value={valuationFormData.assessmentDate}
                    onChange={(e) => handleValuationFormChange('assessmentDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Assessed Value</Label>
                  <Input
                    type="number"
                    value={valuationFormData.assessedValue}
                    onChange={(e) => handleValuationFormChange('assessedValue', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Market Value</Label>
                  <Input
                    type="number"
                    value={valuationFormData.marketValue}
                    onChange={(e) => handleValuationFormChange('marketValue', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">Assessment Notes</Label>
                <Input
                  value={valuationFormData.assessmentNotes}
                  onChange={(e) => handleValuationFormChange('assessmentNotes', e.target.value)}
                  placeholder="Assessment notes..."
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleSaveValuation}
                  disabled={isSavingValuation || !valuationFormData.year}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSavingValuation ? "Saving..." : "Save Valuation"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelValuation}
                  disabled={isSavingValuation}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Valuation History Table */}
          {valuationHistories.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Year</th>
                    <th className="text-left p-3 font-medium">Assessed Value</th>
                    <th className="text-left p-3 font-medium">Market Value</th>
                    <th className="text-left p-3 font-medium">Assessment Date</th>
                    <th className="text-left p-3 font-medium">Notes</th>
                    <th className="text-left p-3 font-medium">Added</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {valuationHistories.map((valuation, index) => (
                    <tr key={valuation.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="p-3 font-medium">{valuation.year}</td>
                      <td className="p-3">
                        {valuation.assessedValue ? `$${valuation.assessedValue.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3">
                        {valuation.marketValue ? `$${valuation.marketValue.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {valuation.assessmentDate ? new Date(valuation.assessmentDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {valuation.assessmentNotes || "-"}
                      </td>
                      <td className="p-3 text-muted-foreground text-sm">
                        {new Date(valuation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteValuation(valuation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No valuation history recorded</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start tracking property valuations by adding your first valuation entry above.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
