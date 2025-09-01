"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Bell,
  Search,
  MapPin,
  Square
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const mockLandProperties = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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



export function Dashboard() {
  const router = useRouter()
  const totalParcels = mockLandProperties.length
  const totalAcreage = mockLandProperties.reduce((sum, p) => sum + p.acres, 0)
  const totalInvestment = mockLandProperties.reduce((sum, p) => sum + p.purchasePrice, 0)
  const averagePricePerAcre = totalAcreage > 0 ? Math.round(totalInvestment / totalAcreage) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Land Parcels</CardTitle>
                <MapPin className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalParcels}</div>
              <p className="text-slate-300 text-sm">Properties in portfolio</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalInvestment.toLocaleString()}</div>
              <p className="text-slate-300 text-sm">Total purchase prices</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Total Acreage</CardTitle>
                <Square className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalAcreage}</div>
              <p className="text-slate-300 text-sm">Acres owned/pending</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Avg $/Acre</CardTitle>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${averagePricePerAcre.toLocaleString()}</div>
              <p className="text-slate-300 text-sm">Average price per acre</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Land Parcels Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Your Land Portfolio</h2>
            <Button className="bg-white text-slate-900 hover:bg-slate-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Land Parcel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mockLandProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/property/${property.id}`)}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{property.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-slate-300 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm font-medium text-white">{property.address}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-tight">{property.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Purchase Price:</span>
                          <div className="text-white font-semibold">${property.purchasePrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Acreage:</span>
                          <div className="text-white font-semibold">{Number(property.acres)} acres</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Zoning:</span>
                          <div className="text-slate-300">{property.zoning}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Financing:</span>
                          <div className="text-slate-300">{property.financingType}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Closing Date:</span>
                          <div className="text-slate-300">{property.closingDate}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Est. Taxes:</span>
                          <div className="text-slate-300">${property.estimatedTaxes}</div>
                        </div>
                      </div>

                      {property.balloonDueDate && (
                        <div className="text-sm">
                          <span className="text-slate-400">Balloon Due:</span>
                          <div className="text-yellow-300 font-medium">{property.balloonDueDate}</div>
                        </div>
                      )}

                      <div className="text-sm border-t border-white/10 pt-3">
                        <span className="text-slate-400">Agents:</span>
                        <div className="text-slate-300 text-xs">
                          <div>Buyer: {property.buyerAgent}</div>
                          <div>Seller: {property.sellerAgent}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
