"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Building2, 
  DollarSign,
  Calendar,
  PieChart,
  Activity
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mill Rate Chart Component
function MillRateChart({ data }: { data: MillRateData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No mill rate data available
      </div>
    )
  }

  const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
  const counties = [...new Set(data.map(d => d.county))]
  
  const maxRate = Math.max(...data.map(d => Number(d.millRate)))
  const minRate = Math.min(...data.map(d => Number(d.millRate)))
  
  const chartHeight = 280
  const chartWidth = 800
  const padding = 40
  
  const getX = (year: number) => {
    return padding + ((year - years[0]) / (years[years.length - 1] - years[0])) * (chartWidth - 2 * padding)
  }
  
  const getY = (rate: number) => {
    return chartHeight - padding - ((Number(rate) - minRate) / (maxRate - minRate)) * (chartHeight - 2 * padding)
  }
  
  const getCountyColor = (index: number) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {/* Grid lines */}
        {years.map(year => (
          <line
            key={`grid-${year}`}
            x1={getX(year)}
            y1={padding}
            x2={getX(year)}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Y-axis labels */}
        {[minRate, (minRate + maxRate) / 2, maxRate].map((rate, index) => (
          <g key={`y-label-${index}`}>
            <line
              x1={padding}
              y1={getY(rate)}
              x2={chartWidth - padding}
              y2={getY(rate)}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <text
              x={padding - 10}
              y={getY(rate) + 4}
              textAnchor="end"
              className="text-xs fill-muted-foreground"
            >
              {Number(rate).toFixed(4)}
            </text>
          </g>
        ))}
        
        {/* County lines */}
        {counties.slice(0, 8).map((county, countyIndex) => {
          const countyData = data
            .filter(d => d.county === county)
            .sort((a, b) => a.year - b.year)
          
          if (countyData.length < 2) return null
          
          const pathData = countyData.map((point, index) => {
            const x = getX(point.year)
            const y = getY(Number(point.millRate))
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')
          
          return (
            <g key={county}>
              <path
                d={pathData}
                fill="none"
                stroke={getCountyColor(countyIndex)}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {countyData.map(point => (
                <circle
                  key={`${county}-${point.year}`}
                  cx={getX(point.year)}
                  cy={getY(Number(point.millRate))}
                  r={3}
                  fill={getCountyColor(countyIndex)}
                  stroke="white"
                  strokeWidth={1}
                />
              ))}
            </g>
          )
        })}
        
        {/* X-axis labels */}
        {years.map(year => (
          <text
            key={`x-label-${year}`}
            x={getX(year)}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {year}
          </text>
        ))}
        
        {/* Axes */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#374151"
          strokeWidth={2}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#374151"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}

interface MillRateData {
  year: number
  county: string
  millRate: number
}

interface PropertyData {
  id: string
  city: string
  purchasePrice: number
  acres: number
  type: string
  place?: {
    county?: {
      name: string
    }
  }
}

interface AnalyticsData {
  millRates: MillRateData[]
  properties: PropertyData[]
  totalCounties: number
  totalMunicipalities: number
  totalProperties: number
  totalValue: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2022)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch mill rate data
      const millRatesResponse = await fetch('/api/analytics/mill-rates')
      const millRates = await millRatesResponse.json()
      
      // Fetch property data
      const propertiesResponse = await fetch('/api/properties')
      const properties = await propertiesResponse.json()
      
      // Fetch places data for counts
      const placesResponse = await fetch('/api/places')
      const places = await placesResponse.json()
      
      // Calculate totals
      const totalCounties = places.filter((p: any) => p.kind === 'COUNTY').length
      const totalMunicipalities = places.filter((p: any) => ['TOWN', 'UT', 'CITY'].includes(p.kind)).length
      const totalProperties = properties.length
      const totalValue = properties.reduce((sum: number, p: any) => sum + (p.purchasePrice || 0), 0)
      
      setData({
        millRates,
        properties,
        totalCounties,
        totalMunicipalities,
        totalProperties,
        totalValue
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableYears = () => {
    if (!data) return []
    const years = [...new Set(data.millRates.map(mr => mr.year))]
    return years.sort((a, b) => a - b) // Chronological order for chart
  }

  const getTopCounties = () => {
    if (!data) return []
    const countyCounts: { [key: string]: number } = {}
    data.millRates.forEach(rate => {
      countyCounts[rate.county] = (countyCounts[rate.county] || 0) + 1
    })
    return Object.entries(countyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 counties
      .map(([county]) => county)
  }

  const getCountyColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red  
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316', // orange
    ]
    return colors[index % colors.length]
  }


  const getPropertyDistributionByCounty = () => {
    if (!data) return []
    const distribution: { [key: string]: number } = {}
    
    data.properties.forEach(property => {
      const county = property.place?.county?.name
      if (county) {
        distribution[county] = (distribution[county] || 0) + 1
      }
    })
    
    return Object.entries(distribution)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getPropertyValueByCounty = () => {
    if (!data) return []
    const values: { [key: string]: number } = {}
    
    data.properties.forEach(property => {
      const county = property.place?.county?.name
      if (county && property.purchasePrice) {
        values[county] = (values[county] || 0) + property.purchasePrice
      }
    })
    
    return Object.entries(values)
      .map(([county, value]) => ({ county, value }))
      .sort((a, b) => b.value - a.value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const propertyDistribution = getPropertyDistributionByCounty()
  const propertyValues = getPropertyValueByCounty()

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your Maine property portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Data Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Maine Data Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{data.totalCounties}</div>
              <div className="text-sm text-muted-foreground">Counties</div>
              <div className="text-xs text-muted-foreground mt-1">
                Complete Maine coverage
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{data.totalMunicipalities}</div>
              <div className="text-sm text-muted-foreground">Municipalities</div>
              <div className="text-xs text-muted-foreground mt-1">
                Towns, cities, and plantations
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {data.millRates.length > 0 ? Math.max(...data.millRates.map(mr => mr.year)) - Math.min(...data.millRates.map(mr => mr.year)) + 1 : 0}
              </div>
              <div className="text-sm text-muted-foreground">Years of Data</div>
              <div className="text-xs text-muted-foreground mt-1">
                Historical mill rate coverage
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mill Rate Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Mill Rates by County
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Compare mill rate trends across Maine counties over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart Area */}
            <div className="h-80 w-full">
              <MillRateChart data={data?.millRates || []} />
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              {getTopCounties().map((county, index) => (
                <div key={county} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCountyColor(index) }}
                  ></div>
                  <span className="text-sm font-medium">{county}</span>
                </div>
              ))}
            </div>
            
            {/* Footnote */}
            <p className="text-xs text-muted-foreground text-center">
              *Each color represents a different county. Compare trends over time to identify patterns.
            </p>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
