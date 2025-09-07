"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DollarSign,
  Plus,
  Save,
  X,
  Trash2
} from "lucide-react"

interface MillRateHistory {
  id: string
  year: number
  millRate: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MillRateHistoryProps {
  placeId: string
  millRateHistories: MillRateHistory[]
  onUpdate?: () => void
}

export function MillRateHistory({ placeId, millRateHistories, onUpdate }: MillRateHistoryProps) {
  const [isAddingMillRate, setIsAddingMillRate] = useState(false)
  const [isSavingMillRate, setIsSavingMillRate] = useState(false)
  const [millRateFormData, setMillRateFormData] = useState({
    year: new Date().getFullYear().toString(),
    millRate: "",
    notes: "",
  })

  const handleAddMillRate = () => {
    setIsAddingMillRate(true)
    setMillRateFormData({
      year: new Date().getFullYear().toString(),
      millRate: "",
      notes: "",
    })
  }

  const handleCancelMillRate = () => {
    setIsAddingMillRate(false)
    setMillRateFormData({
      year: new Date().getFullYear().toString(),
      millRate: "",
      notes: "",
    })
  }

  const handleSaveMillRate = async () => {
    try {
      setIsSavingMillRate(true)
      
      const response = await fetch(`/api/places/${placeId}/mill-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: parseInt(millRateFormData.year),
          millRate: parseFloat(millRateFormData.millRate),
          notes: millRateFormData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save mill rate')
      }

      setIsAddingMillRate(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save mill rate")
    } finally {
      setIsSavingMillRate(false)
    }
  }

  const handleDeleteMillRate = async (millRateId: string) => {
    if (!confirm('Are you sure you want to delete this mill rate entry?')) return

    try {
      const response = await fetch(`/api/places/${placeId}/mill-rates/${millRateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete mill rate')
      }

      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      alert("Failed to delete mill rate")
    }
  }

  const handleMillRateFormChange = (field: string, value: string) => {
    setMillRateFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Mill Rate History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Mill Rate Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMillRate}
              disabled={isAddingMillRate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Mill Rate
            </Button>
          </div>

          {/* Add Mill Rate Form */}
          {isAddingMillRate && (
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-medium text-sm mb-3">Add New Mill Rate</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tax Year</Label>
                  <Input
                    type="number"
                    value={millRateFormData.year}
                    onChange={(e) => handleMillRateFormChange('year', e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Mill Rate</Label>
                  <Input
                    type="number"
                    value={millRateFormData.millRate}
                    onChange={(e) => handleMillRateFormChange('millRate', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Input
                    value={millRateFormData.notes}
                    onChange={(e) => handleMillRateFormChange('notes', e.target.value)}
                    placeholder="Mill rate notes..."
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleSaveMillRate}
                  disabled={isSavingMillRate || !millRateFormData.year || !millRateFormData.millRate}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSavingMillRate ? "Saving..." : "Save Mill Rate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelMillRate}
                  disabled={isSavingMillRate}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Mill Rate History Table */}
          {millRateHistories.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Tax Year</th>
                    <th className="text-left p-3 font-medium">Mill Rate</th>
                    <th className="text-left p-3 font-medium">Notes</th>
                    <th className="text-left p-3 font-medium">Added</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {millRateHistories.map((millRate, index) => (
                    <tr key={millRate.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="p-3 font-medium">{millRate.year}</td>
                      <td className="p-3">{millRate.millRate} mills</td>
                      <td className="p-3 text-muted-foreground">
                        {millRate.notes || "-"}
                      </td>
                      <td className="p-3 text-muted-foreground text-sm">
                        {new Date(millRate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMillRate(millRate.id)}
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
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No mill rate history recorded</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start tracking mill rate changes by adding your first mill rate entry above.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
