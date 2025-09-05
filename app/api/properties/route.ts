import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for property creation
const createPropertySchema = z.object({
  // Address fields
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  
  // Basic Property Info
  name: z.string().optional(),
  description: z.string().optional(),
  acres: z.number().min(0).optional(),
  zoning: z.string().optional(),
  
  // Purchase Information
  purchasePrice: z.number().min(0).optional(),
  earnestMoney: z.number().min(0).optional(),
  closingDate: z.string().optional(),
  
  // Financing Details
  financingType: z.string().optional(),
  financingTerms: z.string().optional(),
  balloonDueDate: z.string().optional(),
  
  // Closing Costs
  titleSettlementFee: z.number().min(0).optional(),
  titleExamination: z.number().min(0).optional(),
  ownersPolicyPremium: z.number().min(0).optional(),
  recordingFeesDeed: z.number().min(0).optional(),
  stateTaxStamps: z.number().min(0).optional(),
  eRecordingFee: z.number().min(0).optional(),
  propertyTaxProration: z.number().min(0).optional(),
  realEstateCommission: z.number().min(0).optional(),
  
  // People/Companies
  seller: z.string().optional(),
  sellerAgent: z.string().optional(),
  buyerAgent: z.string().optional(),
  titleCompany: z.string().optional(),
  
  // Legacy fields (keeping for backward compatibility)
  type: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  squareFeet: z.number().int().min(0).optional(),
  rent: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  available: z.boolean().optional().default(true),
})

// GET - Fetch user's properties
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const properties = await prisma.property.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        sellerPerson: true,
        sellerAgentPerson: true,
        buyerAgentPerson: true,
        titleCompanyPerson: true,
        place: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


// Helper function to find or create a person
async function findOrCreatePerson(name: string, role: string, userId: string) {
  if (!name || name.trim() === '') return null
  
  const trimmedName = name.trim()
  
  // Try to find existing person
  let person = await prisma.person.findFirst({
    where: {
      name: trimmedName,
      userId: userId
    }
  })
  
  // If not found, create new person
  if (!person) {
    person = await prisma.person.create({
      data: {
        name: trimmedName,
        role: role,
        userId: userId
      }
    })
  }
  
  return person
}

// Helper function to find or create a place (represents a town/city)
async function findOrCreatePlace(city: string, state: string | null, userId: string) {
  if (!city || city.trim() === '') return null
  
  const trimmedCity = city.trim()
  const trimmedState = state?.trim() || null
  
  // Try to find existing place with same city and state
  let place = await prisma.place.findFirst({
    where: {
      name: trimmedCity,
      state: trimmedState,
      userId: userId
    }
  })
  
  // If not found, create new place representing this town/city
  if (!place) {
    place = await prisma.place.create({
      data: {
        name: trimmedCity,
        state: trimmedState,
        country: "United States",
        description: `All properties in ${trimmedCity}${trimmedState ? `, ${trimmedState}` : ''}`,
        userId: userId
      }
    })
  }
  
  return place
}

// POST - Create new property with automatic people and place creation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = createPropertySchema.parse(body)

    // Create people and place in parallel
    const [sellerPerson, sellerAgentPerson, buyerAgentPerson, titleCompanyPerson, place] = await Promise.all([
      validatedData.seller ? findOrCreatePerson(validatedData.seller, "Seller", session.user.id) : null,
      validatedData.sellerAgent ? findOrCreatePerson(validatedData.sellerAgent, "Seller Agent", session.user.id) : null,
      validatedData.buyerAgent ? findOrCreatePerson(validatedData.buyerAgent, "Buyer Agent", session.user.id) : null,
      validatedData.titleCompany ? findOrCreatePerson(validatedData.titleCompany, "Title Company", session.user.id) : null,
      validatedData.city ? findOrCreatePlace(validatedData.city, validatedData.state, session.user.id) : null
    ])

    // Create property with all relationships
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        // Link to created people
        sellerId: sellerPerson?.id,
        sellerAgentId: sellerAgentPerson?.id,
        buyerAgentId: buyerAgentPerson?.id,
        titleCompanyId: titleCompanyPerson?.id,
        // Link to created place
        placeId: place?.id,
      },
      include: {
        sellerPerson: true,
        sellerAgentPerson: true,
        buyerAgentPerson: true,
        titleCompanyPerson: true,
        place: true,
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
