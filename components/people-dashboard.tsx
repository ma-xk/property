"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  User,
  Eye,
  Settings,
  Search,
  Mail,
  Phone,
  Building,
  Briefcase
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

export function PeopleDashboard() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPeople = async () => {
    try {
      const response = await fetch("/api/people")
      if (!response.ok) {
        throw new Error("Failed to fetch people")
      }
      const data = await response.json()
      setPeople(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [])

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTotalPropertiesCount = (person: Person) => {
    return person.propertiesAsSeller.length + 
           person.propertiesAsSellerAgent.length + 
           person.propertiesAsBuyerAgent.length + 
           person.propertiesAsTitleCompany.length
  }

  const getPrimaryRole = (person: Person) => {
    if (person.role) return person.role
    
    // Infer role from property relationships
    if (person.propertiesAsSeller.length > 0) return "Seller"
    if (person.propertiesAsSellerAgent.length > 0) return "Seller Agent"
    if (person.propertiesAsBuyerAgent.length > 0) return "Buyer Agent"
    if (person.propertiesAsTitleCompany.length > 0) return "Title Company"
    
    return "Contact"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            People
          </h2>
          <p className="text-slate-300">
            Manage contacts, agents, and business relationships
          </p>
        </div>
        <Button
          onClick={() => router.push("/people/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Person
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          placeholder="Search people by name, company, role, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
        />
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
            <CardTitle className="text-white text-sm font-medium">Total People</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{people.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {people.filter(p => p.role?.toLowerCase().includes('agent') || 
                p.propertiesAsSellerAgent.length > 0 || 
                p.propertiesAsBuyerAgent.length > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {people.filter(p => p.propertiesAsSeller.length > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {people.filter(p => p.company).length}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* People Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading people...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="text-white mb-4">
                {people.length === 0 
                  ? "No people yet. Add your first contact to get started!"
                  : "No people match your search."
                }
              </div>
              {people.length === 0 && (
                <Button
                  onClick={() => router.push("/people/new")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/people/${person.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg leading-tight mb-2 flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {person.name}
                        </CardTitle>
                        <div className="text-blue-300 text-sm font-medium">
                          {getPrimaryRole(person)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {getTotalPropertiesCount(person)} properties
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {person.email && (
                        <div className="flex items-center text-slate-300">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{person.email}</span>
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center text-slate-300">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      {person.company && (
                        <div className="flex items-center text-slate-300">
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{person.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Property Involvement Summary */}
                    <div className="space-y-1 text-xs">
                      {person.propertiesAsSeller.length > 0 && (
                        <div className="text-slate-400">
                          Seller in {person.propertiesAsSeller.length} transaction{person.propertiesAsSeller.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {person.propertiesAsSellerAgent.length > 0 && (
                        <div className="text-slate-400">
                          Seller agent for {person.propertiesAsSellerAgent.length} property{person.propertiesAsSellerAgent.length !== 1 ? 'ies' : 'y'}
                        </div>
                      )}
                      {person.propertiesAsBuyerAgent.length > 0 && (
                        <div className="text-slate-400">
                          Buyer agent for {person.propertiesAsBuyerAgent.length} property{person.propertiesAsBuyerAgent.length !== 1 ? 'ies' : 'y'}
                        </div>
                      )}
                      {person.propertiesAsTitleCompany.length > 0 && (
                        <div className="text-slate-400">
                          Title company for {person.propertiesAsTitleCompany.length} property{person.propertiesAsTitleCompany.length !== 1 ? 'ies' : 'y'}
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Added {formatDate(person.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white bg-white/10 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/people/${person.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-400 text-gray-700 hover:bg-gray-100 bg-white/90 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
