"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Deal } from "@/types/deal"

interface DealPromotionDialogProps {
  deal: Deal
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPromoting: boolean
}

export function DealPromotionDialog({ 
  deal, 
  open, 
  onOpenChange, 
  onConfirm, 
  isPromoting 
}: DealPromotionDialogProps) {
  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "Not set"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPropertyAddress = (deal: Deal) => {
    const parts = [deal.streetAddress, deal.city, deal.state, deal.zipCode].filter(Boolean)
    return parts.join(", ") || "No address"
  }

  const calculateTotalClosingCosts = () => {
    const costs = [
      deal.titleSettlementFee,
      deal.titleExamination,
      deal.ownersPolicyPremium,
      deal.recordingFeesDeed,
      deal.stateTaxStamps,
      deal.eRecordingFee,
      deal.realEstateCommission
    ].filter(cost => cost !== null && cost !== undefined)
    
    return costs.reduce((sum, cost) => sum + (cost || 0), 0)
  }

  const totalClosingCosts = calculateTotalClosingCosts()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promote Deal to Property</DialogTitle>
          <DialogDescription>
            This will create a new property from your deal and mark it as promoted. 
            The deal will remain in your pipeline for reference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deal Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Deal Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Deal Name:</span>
                <div className="font-medium">{deal.name}</div>
              </div>
              <div>
                <span className="text-gray-500">Address:</span>
                <div className="font-medium">{formatPropertyAddress(deal)}</div>
              </div>
              <div>
                <span className="text-gray-500">Purchase Price:</span>
                <div className="font-medium">{formatCurrency(deal.purchasePrice)}</div>
              </div>
              <div>
                <span className="text-gray-500">Closing Date:</span>
                <div className="font-medium">
                  {deal.closingDate ? new Date(deal.closingDate).toLocaleDateString() : "Not set"}
                </div>
              </div>
            </div>
          </div>

          {/* What Will Be Created */}
          <div>
            <h3 className="font-semibold mb-3">New Property Will Include:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Property address and location information</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Purchase price and closing date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Financing terms and balloon payment date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All closing costs ({formatCurrency(totalClosingCosts)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Seller, agents, and title company information</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Property characteristics (acres, zoning)</span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The deal will be marked as "WON" and linked to the new property</li>
              <li>• You can still view the original deal for reference</li>
              <li>• The new property will be ready for ongoing management (taxes, valuations)</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          {/* Missing Data Warning */}
          {(!deal.purchasePrice || !deal.closingDate) && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Missing Information:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {!deal.purchasePrice && <li>• Purchase price is not set</li>}
                {!deal.closingDate && <li>• Closing date is not set</li>}
                <li>• You can still promote the deal, but you may want to add this information later</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPromoting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isPromoting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPromoting ? "Promoting..." : "Promote to Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
