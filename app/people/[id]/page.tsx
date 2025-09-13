"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Home,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPropertyAddress } from "@/lib/utils"

interface Deal {
  id: string
  name: string
  dealStage: string
  dealStatus: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  purchasePrice?: number
  acres?: number
  createdAt: string
}

interface Person {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  notes?: string
  createdAt: string
  updatedAt: string
  dealsAsSeller: Deal[]
  dealsAsSellerAgent: Deal[]
  dealsAsBuyerAgent: Deal[]
  dealsAsTitleCompany: Deal[]
}

export default function PersonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchPerson()
    }
  }, [params.id])

  const fetchPerson = async () => {
    try {
      const response = await fetch(`/api/people/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch person")
      }
      const data = await response.json()
      setPerson(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
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

  const getAllDeals = () => {
    if (!person) return []
    return [
      ...person.dealsAsSeller.map(d => ({ ...d, role: 'Seller' })),
      ...person.dealsAsSellerAgent.map(d => ({ ...d, role: 'Seller Agent' })),
      ...person.dealsAsBuyerAgent.map(d => ({ ...d, role: 'Buyer Agent' })),
      ...person.dealsAsTitleCompany.map(d => ({ ...d, role: 'Title Company' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getTotalInvestment = () => {
    return getAllDeals().reduce((total, deal) => 
      total + (Number(deal.purchasePrice) || 0), 0
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl">Loading person details...</div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-destructive text-xl mb-4">{error || "Person not found"}</div>
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

  const allDeals = getAllDeals()

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
                {person.name}
              </h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <User className="h-5 w-5 mr-2" />
                <span>{person.role || 'Contact'} • {allDeals.length} deal relationship{allDeals.length !== 1 ? 's' : ''}</span>
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

        {/* Person Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="">
            <CardHeader>
              <CardTitle className="">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {person.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className=" font-medium">{person.email}</div>
                  </div>
                )}
                
                {person.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <div className=" font-medium">{person.phone}</div>
                  </div>
                )}
                
                {person.company && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Building className="h-4 w-4" />
                      Company
                    </div>
                    <div className=" font-medium">{person.company}</div>
                  </div>
                )}
                
                {person.role && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Briefcase className="h-4 w-4" />
                      Role
                    </div>
                    <div className=" font-medium">{person.role}</div>
                  </div>
                )}
              </div>

              {person.notes && (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">Notes</div>
                  <div className=" bg-muted rounded-lg p-4">{person.notes}</div>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(person.createdAt)}
                </div>
                {person.updatedAt !== person.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Updated {formatDate(person.updatedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{allDeals.length}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">As Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{person.dealsAsSeller.length}</div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">As Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                {person.dealsAsSellerAgent.length + person.dealsAsBuyerAgent.length}
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className=" text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{formatCurrency(getTotalInvestment())}</div>
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
              <CardTitle className="">Related Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {allDeals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  This person is not associated with any deals yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {allDeals.map((deal) => (
                    <div
                      key={`${deal.id}-${deal.role}`}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors group cursor-pointer"
                      onClick={() => router.push(`/deal/${deal.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className=" font-semibold">
                            {deal.name || formatPropertyAddress(deal)}
                          </h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {deal.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatPropertyAddress(deal)}
                          </div>
                          {deal.acres && (
                            <div>{Number(deal.acres)} acres</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className=" font-semibold">
                            {formatCurrency(deal.purchasePrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(deal.createdAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-400 text-blue-400 hover:bg-blue-400 hover:"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/deal/${deal.id}`)
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
    </div>
  )
}
