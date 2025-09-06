"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Building2, 
  Users, 
  MapPin, 
  Plus,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalSearch } from "@/components/global-search"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { CreatePropertyForm } from "@/components/create-property-form"
import { CreatePersonForm } from "@/components/create-person-form"
import { CreatePlaceForm } from "@/components/create-place-form"
import { DashboardMap } from "@/components/dashboard-map"

interface Property {
  id: string
  name: string | null
  purchasePrice: number | null
  available: boolean
  createdAt: string
}

interface Person {
  id: string
  name: string
  createdAt: string
}

interface Place {
  id: string
  name: string
  createdAt: string
}

export function OverviewDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)
  const [personModalOpen, setPersonModalOpen] = useState(false)
  const [placeModalOpen, setPlaceModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, peopleRes, placesRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/people'),
          fetch('/api/places')
        ])

        const [propertiesData, peopleData, placesData] = await Promise.all([
          propertiesRes.json(),
          peopleRes.json(),
          placesRes.json()
        ])

        // Ensure we set arrays even if API returns error objects
        setProperties(Array.isArray(propertiesData) ? propertiesData : [])
        setPeople(Array.isArray(peopleData) ? peopleData : [])
        setPlaces(Array.isArray(placesData) ? placesData : [])
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handlePropertyCreated = () => {
    setPropertyModalOpen(false)
    // Refresh the properties data
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => setProperties(Array.isArray(data) ? data : []))
      .catch(error => {
        // Handle error silently
      })
  }

  const handlePersonCreated = () => {
    setPersonModalOpen(false)
    // Refresh the people data
    fetch('/api/people')
      .then(res => res.json())
      .then(data => setPeople(Array.isArray(data) ? data : []))
      .catch(error => {
        // Handle error silently
      })
  }

  const handlePlaceCreated = () => {
    setPlaceModalOpen(false)
    // Refresh the places data
    fetch('/api/places')
      .then(res => res.json())
      .then(data => setPlaces(Array.isArray(data) ? data : []))
      .catch(error => {
        // Handle error silently
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Ensure data is arrays and calculate derived values
  const propertiesArray = Array.isArray(properties) ? properties : []
  const peopleArray = Array.isArray(people) ? people : []
  const placesArray = Array.isArray(places) ? places : []
  
  const totalInvestment = propertiesArray.reduce((total, p) => total + (Number(p.purchasePrice) || 0), 0)
  const availableProperties = propertiesArray.filter(p => p.available).length
  const recentProperties = propertiesArray.slice(0, 3)
  const recentPeople = peopleArray.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Global Search */}
      <div className="flex justify-center">
        <GlobalSearch />
      </div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertiesArray.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableProperties} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
            <p className="text-xs text-muted-foreground">
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peopleArray.length}</div>
            <p className="text-xs text-muted-foreground">
              Contacts & agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Places</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placesArray.length}</div>
            <p className="text-xs text-muted-foreground">
              Locations tracked
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Property Map */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <DashboardMap />
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={propertyModalOpen} onOpenChange={setPropertyModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <CreatePropertyForm 
                  onSuccess={handlePropertyCreated}
                  onCancel={() => setPropertyModalOpen(false)}
                  showCard={false}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={personModalOpen} onOpenChange={setPersonModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Person</DialogTitle>
                </DialogHeader>
                <CreatePersonForm 
                  onSuccess={handlePersonCreated}
                  onCancel={() => setPersonModalOpen(false)}
                  showCard={false}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={placeModalOpen} onOpenChange={setPlaceModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add Place
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Place</DialogTitle>
                </DialogHeader>
                <CreatePlaceForm 
                  onSuccess={handlePlaceCreated}
                  onCancel={() => setPlaceModalOpen(false)}
                  showCard={false}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Properties
              </span>
              <Link href="/properties">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <div className="space-y-3">
                {recentProperties.map((property) => (
                  <Link key={property.id} href={`/property/${property.id}`} className="block">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{property.name || 'Untitled Property'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(property.purchasePrice)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        property.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.available ? 'Available' : 'Occupied'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No properties yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent People
              </span>
              <Link href="/people">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPeople.length > 0 ? (
              <div className="space-y-3">
                {recentPeople.map((person) => (
                  <Link key={person.id} href={`/people/${person.id}`} className="block">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(person.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No people yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
