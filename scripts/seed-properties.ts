import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Sample places data
const places = [
  {
    name: "Madawaska",
    state: "ME",
    country: "United States",
    description: "Aroostook County town in northern Maine"
  },
  {
    name: "Fort Kent",
    state: "ME", 
    country: "United States",
    description: "Northernmost town in Maine, near the Canadian border"
  }
]

// Sample people data
const people = [
  {
    name: "Mindy Braley",
    email: "mindy.braley@example.com",
    phone: "(207) 555-0101",
    company: "Braley Real Estate",
    role: "Real Estate Agent",
    notes: "Primary buyer's agent for most transactions"
  },
  {
    name: "Sydney Dummond",
    email: "sydney.dummond@example.com", 
    phone: "(207) 555-0102",
    company: "Dummond Properties",
    role: "Real Estate Agent",
    notes: "Handles rural property transactions"
  },
  {
    name: "Robert Kieffer",
    email: "robert.kieffer@example.com",
    phone: "(207) 555-0103", 
    company: "Kieffer Realty",
    role: "Real Estate Agent",
    notes: "Specializes in residential lots"
  },
  {
    name: "Joseph James Pelletier",
    email: "jpelletier@example.com",
    phone: "(207) 555-0104",
    company: "FSBO",
    role: "Seller",
    notes: "For Sale By Owner - Lot 45 Winter Street"
  },
  {
    name: "Gateway Title of Maine",
    email: "info@gatewaytitle.com",
    phone: "(207) 555-0105",
    company: "Gateway Title of Maine",
    role: "Title Company",
    notes: "Primary title company for all transactions"
  }
]

const properties = [
  {
    address: "126 5th Avenue, Madawaska, ME",
    streetAddress: "126 5th Avenue",
    city: "Madawaska",
    state: "ME",
    zipCode: "04756",
    name: "5th Avenue Lot",
    description: "Driveway, utilities, foundation (unknown state)",
    acres: 0.1,
    zoning: "High Density Residential",
    purchasePrice: 5000,
    earnestMoney: 500,
    closingDate: new Date("2025-03-31"),
    estimatedTaxes: 151.8,
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicyPremium: 100,
    recordingFeesDeed: 24,
    stateTaxStamps: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: 32.03,
    realEstateCommission: 0,
    // Legacy string fields (keeping for backward compatibility)
    seller: "",
    sellerAgent: "Mindy Braley",
    buyerAgent: "Mindy Braley", 
    titleCompany: "Gateway Title of Maine"
  },
  {
    address: "840 North Perley Brook Road, Fort Kent, ME",
    streetAddress: "840 North Perley Brook Road",
    city: "Fort Kent",
    state: "ME",
    zipCode: "04743",
    name: "Perley Brook Land",
    description: "Internal N Perley Brook frontage and direct ITS85 access",
    acres: 11,
    zoning: "Rural",
    purchasePrice: 13500,
    earnestMoney: 1000,
    closingDate: new Date("2025-08-18"),
    estimatedTaxes: 444,
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicyPremium: 100,
    recordingFeesDeed: 24,
    stateTaxStamps: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: null,
    realEstateCommission: 0,
    seller: "",
    sellerAgent: "Sydney Dummond",
    buyerAgent: "Sydney Dummond",
    titleCompany: "Gateway Title of Maine"
  },
  {
    address: "Lot 94 Winter Street, Madawaska, ME",
    streetAddress: "Lot 94 Winter Street",
    city: "Madawaska", 
    state: "ME",
    zipCode: "04756",
    name: "Winter Street Lot 94",
    description: "2fr variance, dual road frontage, directly across from four seasons trail association",
    acres: 0.5,
    zoning: "High Density Residential",
    purchasePrice: 12500,
    earnestMoney: 1000,
    closingDate: new Date("2025-08-20"),
    estimatedTaxes: 379.5,
    financingType: "Cash",
    financingTerms: "n/a",
    balloonDueDate: null,
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicyPremium: 100,
    recordingFeesDeed: 24,
    stateTaxStamps: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: null,
    realEstateCommission: 0,
    seller: "",
    sellerAgent: "Robert Kieffer",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine"
  },
  {
    address: "Lot 45 Winter Street, Madawaska, ME",
    streetAddress: "Lot 45 Winter Street",
    city: "Madawaska",
    state: "ME", 
    zipCode: "04756",
    name: "Winter Street Lot 45",
    description: "End of winter street across from 94, whole culdesac control",
    acres: 2,
    zoning: "High Density Residential",
    purchasePrice: 30000,
    earnestMoney: 0,
    closingDate: new Date("2025-08-21"),
    estimatedTaxes: 391,
    financingType: "Seller Financing",
    financingTerms: "$10K down, $20K financed at 6% interest, $250/month (P+I), 18-month term, ~$17.2K balloon at maturity",
    balloonDueDate: new Date("2027-02-21"),
    titleSettlementFee: 325,
    titleExamination: 275,
    ownersPolicyPremium: 100,
    recordingFeesDeed: 24,
    stateTaxStamps: 11,
    eRecordingFee: 2.5,
    propertyTaxProration: null,
    realEstateCommission: 900,
    seller: "FSBO (Joseph James Pelletier)",
    sellerAgent: "",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine"
  }
]

async function main() {
  console.log("🌱 Starting comprehensive seeding...")

  try {
    // Find the specific user by email
    const user = await prisma.user.findUnique({
      where: {
        email: "m@m.com"
      }
    })

    if (!user) {
      throw new Error("No user found with email 'm@m.com'. Please make sure you have created an account with this email first.")
    }

    console.log(`📝 Found user: ${user.email}`)

    // Clean up existing data to avoid duplicates
    console.log("🗑️  Cleaning up existing data...")
    await prisma.property.deleteMany({ where: { userId: user.id } })
    await prisma.person.deleteMany({ where: { userId: user.id } })
    await prisma.place.deleteMany({ where: { userId: user.id } })

    // Create places
    console.log(`🏘️  Creating ${places.length} places...`)
    const createdPlaces = new Map<string, any>()
    
    for (const placeData of places) {
      const place = await prisma.place.create({
        data: {
          ...placeData,
          userId: user.id,
        }
      })
      createdPlaces.set(`${place.name}-${place.state}`, place)
      console.log(`✅ Created place: ${place.name}, ${place.state}`)
    }

    // Create people
    console.log(`👥 Creating ${people.length} people...`)
    const createdPeople = new Map<string, any>()
    
    for (const personData of people) {
      const person = await prisma.person.create({
        data: {
          ...personData,
          userId: user.id,
        }
      })
      createdPeople.set(person.name, person)
      console.log(`✅ Created person: ${person.name} (${person.role})`)
    }

    // Create properties with relationships
    console.log(`🏠 Creating ${properties.length} properties...`)
    
    for (const propertyData of properties) {
      // Find related place and people
      const place = createdPlaces.get(`${propertyData.city}-${propertyData.state}`)
      const buyerAgent = createdPeople.get(propertyData.buyerAgent)
      const sellerAgent = propertyData.sellerAgent ? createdPeople.get(propertyData.sellerAgent) : null
      const titleCompany = createdPeople.get(propertyData.titleCompany)
      
      // Handle seller (special case for FSBO)
      let seller = null
      if (propertyData.seller && propertyData.seller.includes("Joseph James Pelletier")) {
        seller = createdPeople.get("Joseph James Pelletier")
      }

      const property = await prisma.property.create({
        data: {
          ...propertyData,
          userId: user.id,
          available: true,
          // New relationship fields
          placeId: place?.id,
          sellerId: seller?.id,
          sellerAgentId: sellerAgent?.id,
          buyerAgentId: buyerAgent?.id,
          titleCompanyId: titleCompany?.id,
        }
      })
      console.log(`✅ Created property: ${property.address}`)
    }

    console.log("🎉 Seeding completed successfully!")
    
    // Show summary
    const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0)
    const totalAcres = properties.reduce((sum, p) => sum + p.acres, 0)
    console.log(`📊 Summary:`)
    console.log(`   👥 People created: ${people.length}`)
    console.log(`   🏘️  Places created: ${places.length}`)
    console.log(`   🏠 Properties created: ${properties.length}`)
    console.log(`   💰 Total Investment: $${totalInvestment.toLocaleString()}`)
    console.log(`   🏞️  Total Acres: ${totalAcres} acres`)

  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
