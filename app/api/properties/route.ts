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
  
  // Place hierarchy fields
  county: z.string().optional(),
  placeType: z.enum(["TOWN", "UT", "CITY"]).optional(),
  
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
        place: {
          include: {
            county: {
              select: {
                name: true
              }
            }
          }
        },
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

// Helper function to find or create hierarchical places
async function findOrCreateHierarchicalPlace(
  city: string, 
  state: string | null, 
  county: string | null, 
  placeType: string | null, 
  userId: string
) {
  if (!city || city.trim() === '') return null
  
  const trimmedCity = city.trim()
  const trimmedState = state?.trim() || null
  const trimmedCounty = county?.trim() || null
  const trimmedPlaceType = placeType?.trim() || null
  
  // First, ensure we have a STATE place
  let statePlace = null
  if (trimmedState) {
    // Normalize state input - convert "Maine" to "ME" for consistency
    const normalizedState = trimmedState === "Maine" ? "ME" : trimmedState
    
    // Look for existing state place
    statePlace = await prisma.place.findFirst({
      where: {
        kind: "STATE",
        state: normalizedState,
        userId: userId
      }
    })
    
    if (!statePlace) {
      // Create state place with full name
      const stateName = normalizedState === "ME" ? "Maine" : normalizedState
      statePlace = await prisma.place.create({
        data: {
          name: stateName,
          kind: "STATE",
          state: normalizedState,
          country: "United States",
          description: `State of ${stateName}`,
          userId: userId
        }
      })
    }
  }
  
  // Then, ensure we have a COUNTY place
  let countyPlace = null
  if (trimmedCounty && statePlace) {
    countyPlace = await prisma.place.findFirst({
      where: {
        name: trimmedCounty,
        kind: "COUNTY",
        parentId: statePlace.id,
        userId: userId
      }
    })
    
    if (!countyPlace) {
      countyPlace = await prisma.place.create({
        data: {
          name: trimmedCounty,
          kind: "COUNTY",
          state: trimmedState,
          country: "United States",
          description: `${trimmedCounty} County, ${trimmedState}`,
          parentId: statePlace.id,
          statePlaceId: statePlace.id,
          userId: userId
        }
      })
    }
  }
  
  // Finally, create the TOWN/UT/CITY place
  let place = null
  if (trimmedPlaceType && countyPlace) {
    place = await prisma.place.findFirst({
      where: {
        name: trimmedCity,
        kind: trimmedPlaceType as any,
        parentId: countyPlace.id,
        userId: userId
      }
    })
    
    if (!place) {
      place = await prisma.place.create({
        data: {
          name: trimmedCity,
          kind: trimmedPlaceType as any,
          state: trimmedState,
          country: "United States",
          description: `${trimmedCity}, ${trimmedCounty} County, ${trimmedState}`,
          parentId: countyPlace.id,
          countyId: countyPlace.id,
          statePlaceId: statePlace?.id,
          userId: userId
        }
      })
    }
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
      validatedData.city ? findOrCreateHierarchicalPlace(
        validatedData.city, 
        validatedData.state || null, 
        validatedData.county || null, 
        validatedData.placeType || null, 
        session.user.id
      ) : null
    ])

    // Filter out hierarchical fields that don't belong on the Property model
    const { county, placeType, ...propertyData } = validatedData

    // Log the data being used for property creation
    console.log("Creating property with data:", {
      ...propertyData,
      userId: session.user.id,
      sellerId: sellerPerson?.id,
      sellerAgentId: sellerAgentPerson?.id,
      buyerAgentId: buyerAgentPerson?.id,
      titleCompanyId: titleCompanyPerson?.id,
      placeId: place?.id,
    })

    // Create property with all relationships
    const property = await prisma.property.create({
      data: {
        ...propertyData,
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
    console.error("Property creation error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
