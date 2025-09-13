"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreateDealForm } from "@/components/create-deal-form"
import { Deal, DealStage, DealStatus, DEAL_STAGES, DEAL_STATUSES } from "@/types/deal"

export function DealsDashboard() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStage, setSelectedStage] = useState<DealStage | "ALL">("ALL")
  const [selectedStatus, setSelectedStatus] = useState<DealStatus | "ALL">("ALL")
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [bulkPromoting, setBulkPromoting] = useState(false)

  const fetchDeals = async () => {
    try {
      const response = await fetch("/api/deals")
      if (!response.ok) {
        throw new Error("Failed to fetch deals")
      }
      const data = await response.json()
      setDeals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const handleDealCreated = () => {
    setShowCreateForm(false)
    fetchDeals() // Refresh the list
  }

  const handleDealSelect = (dealId: string, selected: boolean) => {
    if (selected) {
      setSelectedDeals(prev => [...prev, dealId])
    } else {
      setSelectedDeals(prev => prev.filter(id => id !== dealId))
    }
  }

  const handleSelectAll = () => {
    const promotableDeals = filteredDeals.filter(deal => 
      deal.dealStage === "WON" && !deal.promotedToPropertyId
    )
    setSelectedDeals(promotableDeals.map(deal => deal.id))
  }

  const handleDeselectAll = () => {
    setSelectedDeals([])
  }

  const handleBulkPromote = async () => {
    if (selectedDeals.length === 0) return
    
    setBulkPromoting(true)
    setError("")
    
    try {
      const results = await Promise.allSettled(
        selectedDeals.map(dealId => 
          fetch(`/api/deals/${dealId}/promote`, { method: "POST" })
        )
      )
      
      const successful = results.filter(result => result.status === "fulfilled").length
      const failed = results.filter(result => result.status === "rejected").length
      
      if (successful > 0) {
        setSelectedDeals([])
        fetchDeals() // Refresh the list
      }
      
      if (failed > 0) {
        setError(`Successfully promoted ${successful} deals, ${failed} failed`)
      }
    } catch (err) {
      setError("Failed to promote deals")
    } finally {
      setBulkPromoting(false)
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.streetAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = selectedStage === "ALL" || deal.dealStage === selectedStage
    const matchesStatus = selectedStatus === "ALL" || deal.dealStatus === selectedStatus
    
    return matchesSearch && matchesStage && matchesStatus
  })

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "Not set"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPropertyAddress = (deal: Deal) => {
    const parts = [deal.streetAddress, deal.city, deal.state].filter(Boolean)
    return parts.join(", ") || "No address"
  }

  const getDealStageStats = () => {
    const stats = {
      LEAD: 0,
      UNDER_CONTRACT: 0,
      DUE_DILIGENCE: 0,
      CLOSING: 0,
      WON: 0,
      LOST: 0
    }
    
    deals.forEach(deal => {
      stats[deal.dealStage]++
    })
    
    return stats
  }

  const stageStats = getDealStageStats()

  if (showCreateForm) {
    return (
      <CreateDealForm
        onSuccess={handleDealCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading deals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-gray-600 mt-1">Track your real estate deals from lead to closing</p>
        </div>
        <div className="flex gap-2">
          {selectedDeals.length > 0 && (
            <Button 
              onClick={handleBulkPromote} 
              disabled={bulkPromoting}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkPromoting ? "Promoting..." : `Promote ${selectedDeals.length} Deal${selectedDeals.length > 1 ? 's' : ''}`}
            </Button>
          )}
          <Button onClick={() => setShowCreateForm(true)}>
            Add New Deal
          </Button>
        </div>
      </div>

      {/* Stage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stageStats).map(([stage, count]) => (
          <Card key={stage} className="text-center">
            <CardContent className="pt-6">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEAL_STAGES[stage as DealStage].color} mb-2`}>
                {DEAL_STAGES[stage as DealStage].label}
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filters</CardTitle>
            {filteredDeals.some(deal => deal.dealStage === "WON" && !deal.promotedToPropertyId) && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={selectedDeals.length === filteredDeals.filter(deal => deal.dealStage === "WON" && !deal.promotedToPropertyId).length}
                >
                  Select All Promotable
                </Button>
                {selectedDeals.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as DealStage | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Stages</option>
                {Object.entries(DEAL_STAGES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as DealStatus | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(DEAL_STATUSES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedDeals.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>{selectedDeals.length}</strong> deal{selectedDeals.length > 1 ? 's' : ''} selected for promotion
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deals List */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {filteredDeals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">
                {deals.length === 0 ? "No deals yet" : "No deals match your filters"}
              </div>
              {deals.length === 0 && (
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Your First Deal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card 
                className={`hover:shadow-md transition-shadow group ${
                  selectedDeals.includes(deal.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {deal.dealStage === "WON" && !deal.promotedToPropertyId && (
                        <input
                          type="checkbox"
                          checked={selectedDeals.includes(deal.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleDealSelect(deal.id, e.target.checked)
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle 
                          className="text-lg leading-tight mb-2 cursor-pointer"
                          onClick={() => router.push(`/deals/${deal.id}`)}
                        >
                          {deal.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {formatPropertyAddress(deal)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEAL_STAGES[deal.dealStage].color}`}>
                        {DEAL_STAGES[deal.dealStage].label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEAL_STATUSES[deal.dealStatus].color}`}>
                        {DEAL_STATUSES[deal.dealStatus].label}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Financial Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Asking:</span>
                        <div className="font-medium">{formatCurrency(deal.askingPrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Offer:</span>
                        <div className="font-medium">{formatCurrency(deal.offerPrice)}</div>
                      </div>
                    </div>

                    {/* Property Details */}
                    {deal.acres && (
                      <div className="text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1 font-medium">{deal.acres} acres</span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="text-sm text-gray-500">
                      <div>Created: {formatDate(deal.createdAt)}</div>
                      {deal.targetClosingDate && (
                        <div>Target Close: {formatDate(deal.targetClosingDate)}</div>
                      )}
                    </div>

                    {/* Promotion Status */}
                    {deal.promotedToPropertyId && (
                      <div className="text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Promoted to Property
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
