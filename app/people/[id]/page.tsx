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

interface Property {
  id: string
  address: string
  name?: string
  purchasePrice?: number
  acres?: number
  type?: string
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
  propertiesAsSeller: Property[]
  propertiesAsSellerAgent: Property[]
  propertiesAsBuyerAgent: Property[]
  propertiesAsTitleCompany: Property[]
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

  const getAllProperties = () => {
    if (!person) return []
    return [
      ...person.propertiesAsSeller.map(p => ({ ...p, role: 'Seller' })),
      ...person.propertiesAsSellerAgent.map(p => ({ ...p, role: 'Seller Agent' })),
      ...person.propertiesAsBuyerAgent.map(p => ({ ...p, role: 'Buyer Agent' })),
      ...person.propertiesAsTitleCompany.map(p => ({ ...p, role: 'Title Company' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getTotalInvestment = () => {
    return getAllProperties().reduce((total, property) => 
      total + (Number(property.purchasePrice) || 0), 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-white">Loading person details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </button>
          </nav>
          
          <div className="text-center py-12">
            <div className="text-red-400">Error: {error || "Person not found"}</div>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const allProperties = getAllProperties()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-slate-300 hover:text-white transition-colors hover:bg-white/10 rounded px-2 py-1"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            <span className="text-white font-medium px-2 py-1 bg-white/5 rounded truncate max-w-xs" title={person.name}>
              {person.name}
            </span>
          </nav>

                    {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {person.name}
              </h1>
              <div className="flex items-center text-slate-300 mt-2">
                <User className="h-5 w-5 mr-2" />
                <span>{person.role || 'Contact'} • {allProperties.length} property relationship{allProperties.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white bg-white/10 backdrop-blur-sm">
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {person.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="text-white font-medium">{person.email}</div>
                  </div>
                )}
                
                {person.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <div className="text-white font-medium">{person.phone}</div>
                  </div>
                )}
                
                {person.company && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Building className="h-4 w-4" />
                      Company
                    </div>
                    <div className="text-white font-medium">{person.company}</div>
                  </div>
                )}
                
                {person.role && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Briefcase className="h-4 w-4" />
                      Role
                    </div>
                    <div className="text-white font-medium">{person.role}</div>
                  </div>
                )}
              </div>

              {person.notes && (
                <div className="space-y-2">
                  <div className="text-slate-400 text-sm">Notes</div>
                  <div className="text-white bg-white/5 rounded-lg p-4">{person.notes}</div>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-slate-400">
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{allProperties.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">As Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{person.propertiesAsSeller.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">As Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {person.propertiesAsSellerAgent.length + person.propertiesAsBuyerAgent.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(getTotalInvestment())}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Related Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {allProperties.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  This person is not associated with any properties yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {allProperties.map((property) => (
                    <div
                      key={`${property.id}-${property.role}`}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/property/${property.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">
                            {property.name || property.address}
                          </h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {property.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.address}
                          </div>
                          {property.type && (
                            <div>{property.type}</div>
                          )}
                          {property.acres && (
                            <div>{Number(property.acres)} acres</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-white font-semibold">
                            {formatCurrency(property.purchasePrice)}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(property.createdAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
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
      </div>
    </div>
  )
}
