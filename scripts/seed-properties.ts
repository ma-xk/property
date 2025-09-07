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
    description: "Aroostook County town in northern Maine",
    // Tax Information Fields
    taxPaymentAddress: "328 St. Thomas Street, Madawaska, ME 04756",
    taxPaymentWebsite: "https://www.madawaska-me.org/tax-collector",
    taxOfficePhone: "(207) 728-6356",
    taxDueMonth: 9, // September
    taxDueDay: 15, // 15th of the month
    lateInterestRate: 7.0, // 7% late payment interest
    assessmentMonth: 4, // April
    assessmentDay: 1, // 1st of the month
    taxNotes: "Tax bills mailed in August, due September 15th. Late payments accrue 7% interest.",
    // Zoning Information Fields
    zoningOfficeAddress: "328 St. Thomas Street, Madawaska, ME 04756",
    zoningOfficePhone: "(207) 728-6356",
    zoningOfficeWebsiteUrl: "https://www.madawaska-me.org/planning-zoning",
    // Code Enforcement Officer (CEO) Information
    ceoName: "John Smith",
    ceoEmail: "ceo@madawaska-me.org",
    ceoPhone: "(207) 728-6356",
    // Plumbing Inspector Information
    plumbingInspectorName: "Mike Johnson",
    plumbingInspectorEmail: "plumbing@madawaska-me.org",
    plumbingInspectorPhone: "(207) 728-6356",
    // Tax Rate Information
    millRate: 18.5 // $18.50 per $1,000 of assessed value
  },
  {
    name: "Fort Kent",
    state: "ME", 
    country: "United States",
    description: "Northernmost town in Maine, near the Canadian border",
    // Tax Information Fields
    taxPaymentAddress: "416 West Main Street, Fort Kent, ME 04743",
    taxPaymentWebsite: "https://www.fortkent.org/tax-collector",
    taxOfficePhone: "(207) 834-3105",
    taxDueMonth: 10, // October
    taxDueDay: 31, // 31st of the month
    lateInterestRate: 8.0, // 8% late payment interest
    assessmentMonth: 3, // March
    assessmentDay: 1, // 1st of the month
    taxNotes: "Tax bills mailed in September, due October 31st. Late payments accrue 8% interest.",
    // Zoning Information Fields
    zoningOfficeAddress: "416 West Main Street, Fort Kent, ME 04743",
    zoningOfficePhone: "(207) 834-3105",
    zoningOfficeWebsiteUrl: "https://www.fortkent.org/planning-zoning",
    // Code Enforcement Officer (CEO) Information
    ceoName: "Sarah Wilson",
    ceoEmail: "ceo@fortkent.org",
    ceoPhone: "(207) 834-3105",
    // Plumbing Inspector Information
    plumbingInspectorName: "David Brown",
    plumbingInspectorEmail: "plumbing@fortkent.org",
    plumbingInspectorPhone: "(207) 834-3105",
    // Tax Rate Information
    millRate: 16.2 // $16.20 per $1,000 of assessed value
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
    titleCompany: "Gateway Title of Maine",
    // New tax assessment fields
    assessedValue: 8200,
    marketValue: 8500,
    lastAssessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Assessed at 96.5% of market value per town policy"
  },
  {
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
    titleCompany: "Gateway Title of Maine",
    // New tax assessment fields
    assessedValue: 27400,
    marketValue: 28000,
    lastAssessmentDate: new Date("2024-03-01"),
    assessmentNotes: "Rural land assessment based on comparable sales"
  },
  {
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
    titleCompany: "Gateway Title of Maine",
    // New tax assessment fields
    assessedValue: 20500,
    marketValue: 21000,
    lastAssessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Residential lot with dual road frontage premium"
  },
  {
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
    titleCompany: "Gateway Title of Maine",
    // New tax assessment fields
    assessedValue: 21100,
    marketValue: 22000,
    lastAssessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Large residential lot with cul-de-sac control premium"
  }
]

// Sample tax payments data for historical records
const taxPayments = [
  // 5th Avenue Lot - 2024 payment
  {
    propertyAddress: "126 5th Avenue, Madawaska, ME",
    year: 2024,
    amount: 151.8,
    paymentDate: new Date("2024-09-15"),
    notes: "Annual property tax payment"
  },
  // Perley Brook Land - 2024 payment
  {
    propertyAddress: "840 North Perley Brook Road, Fort Kent, ME", 
    year: 2024,
    amount: 444.0,
    paymentDate: new Date("2024-10-31"),
    notes: "Annual property tax payment"
  },
  // Winter Street Lot 94 - 2024 payment
  {
    propertyAddress: "Lot 94 Winter Street, Madawaska, ME",
    year: 2024,
    amount: 379.5,
    paymentDate: new Date("2024-09-15"),
    notes: "Annual property tax payment"
  },
  // Winter Street Lot 45 - 2024 payment
  {
    propertyAddress: "Lot 45 Winter Street, Madawaska, ME",
    year: 2024,
    amount: 391.0,
    paymentDate: new Date("2024-09-15"),
    notes: "Annual property tax payment"
  }
]

// Sample mill rate history data for places
const millRateHistories = [
  // Madawaska mill rate history
  {
    placeName: "Madawaska",
    placeState: "ME",
    year: 2022,
    millRate: 18.0,
    notes: "Previous mill rate before increase"
  },
  {
    placeName: "Madawaska",
    placeState: "ME", 
    year: 2023,
    millRate: 18.2,
    notes: "Slight increase due to infrastructure improvements"
  },
  {
    placeName: "Madawaska",
    placeState: "ME",
    year: 2024,
    millRate: 18.5,
    notes: "Current mill rate reflecting town budget needs"
  },
  // Fort Kent mill rate history
  {
    placeName: "Fort Kent",
    placeState: "ME",
    year: 2022,
    millRate: 15.8,
    notes: "Previous mill rate before adjustments"
  },
  {
    placeName: "Fort Kent",
    placeState: "ME",
    year: 2023,
    millRate: 16.0,
    notes: "Minor increase for town services"
  },
  {
    placeName: "Fort Kent",
    placeState: "ME",
    year: 2024,
    millRate: 16.2,
    notes: "Current mill rate with school district funding"
  }
]

// Sample property valuation history data
const propertyValuationHistories = [
  // 5th Avenue Lot valuation history
  {
    propertyAddress: "126 5th Avenue, Madawaska, ME",
    year: 2022,
    assessedValue: 7800,
    marketValue: 8000,
    assessmentDate: new Date("2022-04-01"),
    assessmentNotes: "Initial assessment after purchase"
  },
  {
    propertyAddress: "126 5th Avenue, Madawaska, ME",
    year: 2023,
    assessedValue: 8000,
    marketValue: 8200,
    assessmentDate: new Date("2023-04-01"),
    assessmentNotes: "Value increase due to market conditions"
  },
  {
    propertyAddress: "126 5th Avenue, Madawaska, ME",
    year: 2024,
    assessedValue: 8200,
    marketValue: 8500,
    assessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Current assessment reflecting improvements"
  },
  // Perley Brook Land valuation history
  {
    propertyAddress: "840 North Perley Brook Road, Fort Kent, ME",
    year: 2022,
    assessedValue: 26000,
    marketValue: 26500,
    assessmentDate: new Date("2022-03-01"),
    assessmentNotes: "Rural land assessment based on acreage"
  },
  {
    propertyAddress: "840 North Perley Brook Road, Fort Kent, ME",
    year: 2023,
    assessedValue: 26700,
    marketValue: 27200,
    assessmentDate: new Date("2023-03-01"),
    assessmentNotes: "Slight increase due to comparable sales"
  },
  {
    propertyAddress: "840 North Perley Brook Road, Fort Kent, ME",
    year: 2024,
    assessedValue: 27400,
    marketValue: 28000,
    assessmentDate: new Date("2024-03-01"),
    assessmentNotes: "Current assessment reflecting market trends"
  },
  // Winter Street Lot 94 valuation history
  {
    propertyAddress: "Lot 94 Winter Street, Madawaska, ME",
    year: 2022,
    assessedValue: 19000,
    marketValue: 19500,
    assessmentDate: new Date("2022-04-01"),
    assessmentNotes: "Residential lot assessment"
  },
  {
    propertyAddress: "Lot 94 Winter Street, Madawaska, ME",
    year: 2023,
    assessedValue: 19750,
    marketValue: 20250,
    assessmentDate: new Date("2023-04-01"),
    assessmentNotes: "Value increase due to location premium"
  },
  {
    propertyAddress: "Lot 94 Winter Street, Madawaska, ME",
    year: 2024,
    assessedValue: 20500,
    marketValue: 21000,
    assessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Current assessment with dual road frontage premium"
  },
  // Winter Street Lot 45 valuation history
  {
    propertyAddress: "Lot 45 Winter Street, Madawaska, ME",
    year: 2022,
    assessedValue: 19500,
    marketValue: 20000,
    assessmentDate: new Date("2022-04-01"),
    assessmentNotes: "Large residential lot assessment"
  },
  {
    propertyAddress: "Lot 45 Winter Street, Madawaska, ME",
    year: 2023,
    assessedValue: 20300,
    marketValue: 21000,
    assessmentDate: new Date("2023-04-01"),
    assessmentNotes: "Value increase due to cul-de-sac control"
  },
  {
    propertyAddress: "Lot 45 Winter Street, Madawaska, ME",
    year: 2024,
    assessedValue: 21100,
    marketValue: 22000,
    assessmentDate: new Date("2024-04-01"),
    assessmentNotes: "Current assessment with cul-de-sac control premium"
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
    await prisma.propertyValuationHistory.deleteMany({ where: { userId: user.id } })
    await prisma.millRateHistory.deleteMany({ where: { userId: user.id } })
    await prisma.taxPayment.deleteMany({ where: { userId: user.id } })
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
      console.log(`✅ Created place: ${place.name}, ${place.state} (Mill Rate: ${place.millRate})`)
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
    const createdProperties = new Map<string, any>()
    
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
      const addressKey = `${property.streetAddress}, ${property.city}, ${property.state}`
      createdProperties.set(addressKey, property)
      console.log(`✅ Created property: ${addressKey} (Assessed: $${property.assessedValue}, Market: $${property.marketValue})`)
    }

    // Create tax payments
    console.log(`💰 Creating ${taxPayments.length} tax payments...`)
    
    for (const paymentData of taxPayments) {
      const property = createdProperties.get(paymentData.propertyAddress)
      if (property) {
        await prisma.taxPayment.create({
          data: {
            year: paymentData.year,
            amount: paymentData.amount,
            paymentDate: paymentData.paymentDate,
            notes: paymentData.notes,
            propertyId: property.id,
            userId: user.id,
          }
        })
        console.log(`✅ Created tax payment: ${paymentData.year} - $${paymentData.amount} for ${paymentData.propertyAddress}`)
      }
    }

    // Create mill rate histories
    console.log(`📊 Creating ${millRateHistories.length} mill rate history records...`)
    
    for (const millRateData of millRateHistories) {
      const place = createdPlaces.get(`${millRateData.placeName}-${millRateData.placeState}`)
      if (place) {
        await prisma.millRateHistory.create({
          data: {
            year: millRateData.year,
            millRate: millRateData.millRate,
            notes: millRateData.notes,
            placeId: place.id,
            userId: user.id,
          }
        })
        console.log(`✅ Created mill rate history: ${millRateData.year} - ${millRateData.millRate} mills for ${millRateData.placeName}`)
      }
    }

    // Create property valuation histories
    console.log(`📈 Creating ${propertyValuationHistories.length} property valuation history records...`)
    
    for (const valuationData of propertyValuationHistories) {
      const property = createdProperties.get(valuationData.propertyAddress)
      if (property) {
        await prisma.propertyValuationHistory.create({
          data: {
            year: valuationData.year,
            assessedValue: valuationData.assessedValue,
            marketValue: valuationData.marketValue,
            assessmentDate: valuationData.assessmentDate,
            assessmentNotes: valuationData.assessmentNotes,
            propertyId: property.id,
            userId: user.id,
          }
        })
        console.log(`✅ Created valuation history: ${valuationData.year} - Assessed: $${valuationData.assessedValue}, Market: $${valuationData.marketValue} for ${valuationData.propertyAddress}`)
      }
    }

    console.log("🎉 Seeding completed successfully!")
    
    // Show summary
    const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0)
    const totalAcres = properties.reduce((sum, p) => sum + p.acres, 0)
    const totalAssessedValue = properties.reduce((sum, p) => sum + (p.assessedValue || 0), 0)
    const totalMarketValue = properties.reduce((sum, p) => sum + (p.marketValue || 0), 0)
    console.log(`📊 Summary:`)
    console.log(`   👥 People created: ${people.length}`)
    console.log(`   🏘️  Places created: ${places.length}`)
    console.log(`   🏠 Properties created: ${properties.length}`)
    console.log(`   💰 Total Investment: $${totalInvestment.toLocaleString()}`)
    console.log(`   🏞️  Total Acres: ${totalAcres} acres`)
    console.log(`   📈 Total Assessed Value: $${totalAssessedValue.toLocaleString()}`)
    console.log(`   📊 Total Market Value: $${totalMarketValue.toLocaleString()}`)
    console.log(`   💸 Tax Payments created: ${taxPayments.length}`)
    console.log(`   📊 Mill Rate Histories created: ${millRateHistories.length}`)
    console.log(`   📈 Property Valuation Histories created: ${propertyValuationHistories.length}`)

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
