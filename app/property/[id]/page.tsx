"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Building,
  Users,
  AlertTriangle,
  Calculator,
  Home,
  Landmark,
  PiggyBank,
  CreditCard,
  Receipt,
  User,
  LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// This would normally come from a database
const mockLandProperties = [
  {
    id: "1",
    address: "126 5th Avenue, Madawaska, ME",
    purchasePrice: 5000,
    acres: 0.1,
    zoning: "High Density Residential",
    description: "Driveway, utilities, foundation (unknown state)",
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    earnestMoney: 500,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicy: 100,
    recordingFees: 24,
    stateTax: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: 32.03,
    realEstateCommission: 0,
    seller: "Mindy Braley",
    sellerAgent: "Mindy Braley",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine",
    closingDate: "3/31/2025",
    estimatedTaxes: 151.8,
    status: "Pending",
    image: "🏠"
  },
  {
    id: "2",
    address: "840 North Perley Brook Road, Fort Kent, ME",
    purchasePrice: 13500,
    acres: 11,
    zoning: "Rural",
    description: "Internal N Perley Brook frontage and direct ITS85 access",
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    earnestMoney: 1000,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicy: 100,
    recordingFees: 24,
    stateTax: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: 0,
    realEstateCommission: 0,
    seller: "Sydney Dummond",
    sellerAgent: "Sydney Dummond",
    buyerAgent: "Sydney Dummond",
    titleCompany: "Gateway Title of Maine",
    closingDate: "8/18/2025",
    estimatedTaxes: 444,
    status: "Pending",
    image: "🌲"
  },
  {
    id: "3",
    address: "Lot 94 Winter Street, Madawaska, ME",
    purchasePrice: 12500,
    acres: 0.5,
    zoning: "High Density Residential",
    description: "2fr variance, dual road frontage, directly across from four seasons trail association",
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    earnestMoney: 1000,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicy: 100,
    recordingFees: 24,
    stateTax: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: 0,
    realEstateCommission: 0,
    seller: "Robert Kieffer",
    sellerAgent: "Robert Kieffer",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine",
    closingDate: "8/20/2025",
    estimatedTaxes: 379.5,
    status: "Pending",
    image: "🏘️"
  },
  {
    id: "4",
    address: "Lot 45 Winter Street, Madawaska, ME",
    purchasePrice: 30000,
    acres: 2,
    zoning: "High Density Residential", 
    description: "End of winter street across from 94, whole culdesac control",
    financingType: "Seller Financing",
    financingTerms: "$10K down, $20K financed at 6% interest, $250/month (P+I), 18-month term, ~$17.2K balloon at maturity",
    balloonDueDate: "February 21, 2027",
    earnestMoney: 0,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicy: 100,
    recordingFees: 24,
    stateTax: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: 0,
    realEstateCommission: 900,
    seller: "FSBO (Joseph James Pelletier)",
    sellerAgent: "FSBO (Joseph James Pelletier)",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine",
    closingDate: "8/21/2025",
    estimatedTaxes: 391,
    status: "Pending",
    image: "🏞️"
  }
]

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [property, setProperty] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      const found = mockLandProperties.find(p => p.id === params.id)
      setProperty(found)
    }
  }, [params.id])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Property Not Found</h1>
              <p className="text-slate-300 mb-6">The property you're looking for doesn't exist.</p>
              <Button onClick={() => router.push("/")} className="bg-white text-slate-900 hover:bg-slate-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalClosingCosts = property.titleSettlementFee + property.titleExamination + property.ownersPolicy + 
                           property.recordingFees + property.stateTax + property.eRecordingFee + 
                           property.propertyTaxProration + property.realEstateCommission + property.earnestMoney

  const pricePerAcre = property.acres > 0 ? Math.round(property.purchasePrice / property.acres) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-purple-900 p-6 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Property App
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            <span>Welcome, {session.user?.name}</span>
          </div>
          <Button 
            onClick={() => router.push("/auth/signin")} 
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <button
                  onClick={() => router.push("/")}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </button>
              </li>
              <li className="text-slate-500">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </li>
              <li className="text-white font-medium">
                Property Details
              </li>
            </ol>
          </motion.nav>

          {/* Property Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{property.image}</div>
                    <div>
                      <div className="flex items-center gap-2 text-white mb-2">
                        <MapPin className="h-5 w-5" />
                        <h1 className="text-2xl font-bold">{property.address}</h1>
                      </div>
                      <p className="text-slate-300">{property.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-slate-400">Zoning:</span>
                        <span className="text-white font-medium">{property.zoning}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === "Pending" 
                      ? "bg-yellow-500/20 text-yellow-300" 
                      : property.status === "Closed"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-gray-500/20 text-gray-300"
                  }`}>
                    {property.status}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm font-medium">Purchase Price</CardTitle>
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${property.purchasePrice.toLocaleString()}</div>
                <p className="text-slate-300 text-sm">${pricePerAcre.toLocaleString()}/acre</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm font-medium">Acreage</CardTitle>
                  <Landmark className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{property.acres}</div>
                <p className="text-slate-300 text-sm">Total acres</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm font-medium">Closing Date</CardTitle>
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{property.closingDate}</div>
                <p className="text-slate-300 text-sm">Scheduled closing</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm font-medium">Annual Taxes</CardTitle>
                  <Receipt className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${property.estimatedTaxes}</div>
                <p className="text-slate-300 text-sm">Estimated yearly</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Financial Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Purchase Price</span>
                      <span className="text-white font-semibold">${property.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Earnest Money</span>
                      <span className="text-white">${property.earnestMoney.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-white font-medium mb-2">Closing Costs</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Title Settlement Fee</span>
                          <span className="text-white">${property.titleSettlementFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Title Examination</span>
                          <span className="text-white">${property.titleExamination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Owner's Policy Premium</span>
                          <span className="text-white">${property.ownersPolicy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Recording Fees</span>
                          <span className="text-white">${property.recordingFees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">State Tax/Stamps</span>
                          <span className="text-white">${property.stateTax}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">E-Recording Fee</span>
                          <span className="text-white">${property.eRecordingFee}</span>
                        </div>
                        {property.propertyTaxProration > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">Property Tax Proration</span>
                            <span className="text-white">${property.propertyTaxProration}</span>
                          </div>
                        )}
                        {property.realEstateCommission > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">Real Estate Commission</span>
                            <span className="text-white">${property.realEstateCommission}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-white font-medium">Total Closing Costs</span>
                        <span className="text-white font-bold">${totalClosingCosts.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between text-xl">
                        <span className="text-white font-bold">Total Investment</span>
                        <span className="text-white font-bold">${(property.purchasePrice + totalClosingCosts).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Financing & People */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Financing Details */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Financing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Financing Type</span>
                      <span className="text-white font-semibold">{property.financingType}</span>
                    </div>
                    <div>
                      <span className="text-slate-300">Terms</span>
                      <p className="text-white mt-1">{property.financingTerms}</p>
                    </div>
                    {property.balloonDueDate && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-300">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Balloon Payment Due</span>
                        </div>
                        <p className="text-yellow-200 mt-1">{property.balloonDueDate}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* People & Companies */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    People & Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-300">Seller</span>
                      <p className="text-white">{property.seller}</p>
                    </div>
                    <div>
                      <span className="text-slate-300">Seller Agent</span>
                      <p className="text-white">{property.sellerAgent}</p>
                    </div>
                    <div>
                      <span className="text-slate-300">Buyer Agent</span>
                      <p className="text-white">{property.buyerAgent}</p>
                    </div>
                    <div>
                      <span className="text-slate-300">Title Company</span>
                      <p className="text-white">{property.titleCompany}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
