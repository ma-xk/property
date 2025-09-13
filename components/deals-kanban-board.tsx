"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  rectIntersection,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreateDealForm } from "@/components/create-deal-form"
import { Deal, DealStage, DealStatus, DEAL_STAGES, DEAL_STATUSES } from "@/types/deal"
import { Calendar, DollarSign, MapPin, User, Building } from "lucide-react"

interface KanbanColumn {
  id: DealStage
  title: string
  deals: Deal[]
}

interface DealCardProps {
  deal: Deal
  isOverlay?: boolean
  isDragging?: boolean
}

function DealCard({ deal, isOverlay = false, isDragging: externalIsDragging = false }: DealCardProps) {
  const router = useRouter()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 ${
        isOverlay ? 'rotate-3 shadow-2xl' : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
      onClick={() => !isOverlay && !isDragging && router.push(`/deals/${deal.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight mb-2">
              {deal.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{formatPropertyAddress(deal)}</span>
            </CardDescription>
            <div className="flex gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${DEAL_STATUSES[deal.dealStatus].color}`}>
                {DEAL_STATUSES[deal.dealStatus].label}
              </span>
              {deal.promotedToPropertyId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Promoted
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Financial Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">Asking:</span>
              <span className="font-medium">{formatCurrency(deal.askingPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">Offer:</span>
              <span className="font-medium">{formatCurrency(deal.offerPrice)}</span>
            </div>
          </div>

          {/* Property Details */}
          {deal.acres && (
            <div className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{deal.acres} acres</span>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-1">
            <div className="text-sm flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Created: {formatDate(deal.createdAt)}</span>
            </div>
            {deal.targetClosingDate && (
              <div className="text-sm flex items-center gap-2 text-gray-500">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Target: {formatDate(deal.targetClosingDate)}</span>
              </div>
            )}
          </div>

          {/* Seller Info */}
          {deal.seller && (
            <div className="text-sm flex items-center gap-2 text-gray-500">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{deal.seller.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({ column, draggedDealId }: { column: KanbanColumn; draggedDealId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col h-full transition-colors duration-200 ${
        isOver ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DEAL_STAGES[column.id].color}`}>
            {column.title}
          </span>
          <span className="text-sm text-gray-500 font-medium">({column.deals.length})</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <SortableContext items={column.deals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 h-full overflow-y-auto pr-2 min-h-[200px]">
            {column.deals.map((deal) => (
              <div key={deal.id} className="relative">
                <DealCard 
                  deal={deal} 
                  isDragging={draggedDealId === deal.id}
                />
              </div>
            ))}
            {column.deals.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Drop deals here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export function DealsKanbanBoard() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<DealStatus | "ALL">("ALL")
  const [selectedStage, setSelectedStage] = useState<DealStage | "ALL">("ALL")
  const [selectedTown, setSelectedTown] = useState<string>("ALL")
  const [selectedCounty, setSelectedCounty] = useState<string>("ALL")
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [bulkPromoting, setBulkPromoting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
    fetchDeals()
  }

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id)
    setActiveDeal(deal || null)
    setDraggedDealId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDeal(null)
    setDraggedDealId(null)

    if (!over) return

    const activeDeal = deals.find(d => d.id === active.id)
    let targetStage: DealStage | null = null

    // Check if we're dropping directly on a column
    const validStages: DealStage[] = ['LEAD', 'UNDER_CONTRACT', 'DUE_DILIGENCE', 'CLOSING', 'WON', 'LOST']
    if (validStages.includes(over.id as DealStage)) {
      targetStage = over.id as DealStage
    } else {
      // If we're dropping on a deal card, find which column it belongs to
      const targetDeal = deals.find(d => d.id === over.id)
      if (targetDeal) {
        targetStage = targetDeal.dealStage
      }
    }

    console.log('Drag end:', { 
      activeId: active.id, 
      overId: over.id, 
      targetStage, 
      activeDeal: activeDeal?.name 
    })

    if (!activeDeal || !targetStage || activeDeal.dealStage === targetStage) return

    // Optimistically update the UI
    const updatedDeals = deals.map(deal =>
      deal.id === activeDeal.id ? { ...deal, dealStage: targetStage! } : deal
    )
    setDeals(updatedDeals)

    // Update the deal on the server
    try {
      const response = await fetch(`/api/deals/${activeDeal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealStage: targetStage }),
      })

      if (!response.ok) {
        throw new Error('Failed to update deal stage')
      }
    } catch (err) {
      // Revert the optimistic update on error
      setDeals(deals)
      setError("Failed to update deal stage")
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.streetAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "ALL" || deal.dealStatus === selectedStatus
    const matchesTown = selectedTown === "ALL" || deal.city?.toLowerCase() === selectedTown.toLowerCase()
    const matchesCounty = selectedCounty === "ALL" || deal.place?.name?.toLowerCase() === selectedCounty.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesTown && matchesCounty
  })

  const columns: KanbanColumn[] = Object.entries(DEAL_STAGES).map(([stage, config]) => ({
    id: stage as DealStage,
    title: config.label,
    deals: filteredDeals.filter(deal => deal.dealStage === stage)
  }))

  const getDealStageStats = (): Record<DealStage, number> => {
    const stats: Record<DealStage, number> = {
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

  // Get unique towns and counties for filter options
  const getUniqueTowns = (): string[] => {
    const towns = deals
      .map(deal => deal.city)
      .filter((city): city is string => Boolean(city))
      .filter((city, index, arr) => arr.indexOf(city) === index)
      .sort()
    return towns
  }

  const getUniqueCounties = (): string[] => {
    const counties = deals
      .map(deal => deal.place?.name)
      .filter((name): name is string => Boolean(name))
      .filter((name, index, arr) => arr.indexOf(name) === index)
      .sort()
    return counties
  }

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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-gray-600 mt-1">Drag and drop deals between stages</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <Button onClick={() => setShowCreateForm(true)}>
            Add New Deal
          </Button>
        </div>
      </div>


      {/* Streamlined Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        

        {/* Town Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2 text-gray-700">Town</label>
          <select
            value={selectedTown}
            onChange={(e) => setSelectedTown(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Towns</option>
            {getUniqueTowns().map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
          </select>
        </div>

        {/* County Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2 text-gray-700">County</label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Counties</option>
            {getUniqueCounties().map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DealStatus | "ALL")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(DEAL_STATUSES).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="min-w-[100px]">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedTown("ALL")
              setSelectedCounty("ALL")
              setSelectedStatus("ALL")
            }}
            className="w-full"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 min-h-[600px]">
            {columns.map((column) => (
              <Card key={column.id} className="flex flex-col">
                <CardContent className="flex-1 p-4">
                  <KanbanColumn column={column} draggedDealId={draggedDealId} />
                </CardContent>
              </Card>
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? (
              <div className="transform rotate-3">
                <DealCard deal={activeDeal} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && deals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">
                No deals match your filters
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {deals.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">
                No deals yet
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Deal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
