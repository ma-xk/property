"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Building2, Users, MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchResult {
  id: string
  type: 'property' | 'person' | 'place'
  title: string
  subtitle: string
  icon: React.ReactNode
}

interface Property {
  id: string
  name?: string
  address: string
  type?: string
}

interface Person {
  id: string
  name: string
  company?: string
  role?: string
}

interface Place {
  id: string
  name: string
  state?: string
  country: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

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

        setProperties(propertiesData)
        setPeople(peopleData)
        setPlaces(placesData)
      } catch (error) {
        // Handle error silently
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const search = async () => {
      setIsSearching(true)
      
      // Simulate search delay for better UX
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const searchLower = searchTerm.toLowerCase()
      const newResults: SearchResult[] = []

      // Search properties
      properties.forEach(property => {
        if (
          (property.name && property.name.toLowerCase().includes(searchLower)) ||
          property.address.toLowerCase().includes(searchLower) ||
          (property.type && property.type.toLowerCase().includes(searchLower))
        ) {
          newResults.push({
            id: property.id,
            type: 'property',
            title: property.name || 'Untitled Property',
            subtitle: property.address,
            icon: <Building2 className="h-4 w-4 text-blue-600" />
          })
        }
      })

      // Search people
      people.forEach(person => {
        if (
          person.name.toLowerCase().includes(searchLower) ||
          (person.company && person.company.toLowerCase().includes(searchLower)) ||
          (person.role && person.role.toLowerCase().includes(searchLower))
        ) {
          newResults.push({
            id: person.id,
            type: 'person',
            title: person.name,
            subtitle: person.company || person.role || 'Contact',
            icon: <Users className="h-4 w-4 text-green-600" />
          })
        }
      })

      // Search places
      places.forEach(place => {
        if (
          place.name.toLowerCase().includes(searchLower) ||
          (place.state && place.state.toLowerCase().includes(searchLower)) ||
          place.country.toLowerCase().includes(searchLower)
        ) {
          newResults.push({
            id: place.id,
            type: 'place',
            title: place.name,
            subtitle: `${place.state ? place.state + ', ' : ''}${place.country}`,
            icon: <MapPin className="h-4 w-4 text-purple-600" />
          })
        }
      })

      // Limit results to 8 for better UX
      setResults(newResults.slice(0, 8))
      setShowDropdown(true)
      setIsSearching(false)
    }

    const debounceTimer = setTimeout(search, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, properties, people, places])

  const handleResultClick = (result: SearchResult) => {
    setSearchTerm("")
    setShowDropdown(false)
    
    switch (result.type) {
      case 'property':
        router.push(`/property/${result.id}`)
        break
      case 'person':
        router.push(`/people/${result.id}`)
        break
      case 'place':
        router.push(`/places/${result.id}`)
        break
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setResults([])
    setShowDropdown(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative w-full max-w-2xl" 
      ref={searchRef}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search properties, people, and places..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-white border-gray-200 placeholder:text-muted-foreground text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center gap-3">
                      {result.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {result.type}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : searchTerm.trim().length > 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchTerm}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
