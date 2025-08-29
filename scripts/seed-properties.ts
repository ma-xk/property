import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const properties = [
  {
    address: "126 5th Avenue, Madawaska, ME",
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
    seller: "",
    sellerAgent: "Mindy Braley",
    buyerAgent: "Mindy Braley",
    titleCompany: "Gateway Title of Maine"
  },
  {
    address: "840 North Perley Brook Road, Fort Kent, ME",
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
  console.log("🌱 Starting property seeding...")

  try {
    // Get the user ID (you'll need to replace this with your actual user ID)
    // We'll find the user by email - you may need to adjust this
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!user) {
      throw new Error("No user found. Please make sure you have created an account first.")
    }

    console.log(`📝 Found user: ${user.email}`)
    console.log(`🏠 Creating ${properties.length} properties...`)

    // Delete existing properties for this user to avoid duplicates
    const existingCount = await prisma.property.count({
      where: { userId: user.id }
    })
    
    if (existingCount > 0) {
      console.log(`🗑️  Deleting ${existingCount} existing properties...`)
      await prisma.property.deleteMany({
        where: { userId: user.id }
      })
    }

    // Create all properties
    for (const propertyData of properties) {
      const property = await prisma.property.create({
        data: {
          ...propertyData,
          userId: user.id,
          available: true, // Set all as available by default
        }
      })
      console.log(`✅ Created: ${property.address}`)
    }

    console.log("🎉 Seeding completed successfully!")
    console.log(`📊 Created ${properties.length} properties for ${user.email}`)
    
    // Show summary
    const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0)
    const totalAcres = properties.reduce((sum, p) => sum + p.acres, 0)
    console.log(`💰 Total Investment: $${totalInvestment.toLocaleString()}`)
    console.log(`🏞️  Total Acres: ${totalAcres} acres`)

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
