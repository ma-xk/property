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
  
  // Ongoing financial management
  balloonDueDate: z.string().optional(),
  propertyTaxProration: z.number().min(0).optional(),
  
  // Valuation information
  assessedValue: z.number().min(0).optional(),
  assessmentNotes: z.string().optional(),
  lastAssessmentDate: z.string().optional(),
  marketValue: z.number().min(0).optional(),
  
  // Property characteristics
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
        place: {
          include: {
            county: {
              select: {
                name: true
              }
            }
          }
        },
        originalDeal: true,
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

// POST - Create new property (properties should be created from deals)
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

    // Create place if address is provided
    const place = validatedData.city ? await findOrCreateHierarchicalPlace(
      validatedData.city, 
      validatedData.state || null, 
      validatedData.county || null, 
      validatedData.placeType || null, 
      session.user.id
    ) : null

    // Filter out hierarchical fields that don't belong on the Property model
    const { county, placeType, ...propertyData } = validatedData

    // Create property (focused on ongoing management, not transactions)
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        userId: session.user.id,
        placeId: place?.id,
        // Convert date fields
        balloonDueDate: validatedData.balloonDueDate ? new Date(validatedData.balloonDueDate) : null,
        lastAssessmentDate: validatedData.lastAssessmentDate ? new Date(validatedData.lastAssessmentDate) : null,
      },
      include: {
        place: true,
        originalDeal: true,
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
      { error: "Failed to create property" },
      { status: 500 }
    )
  }
}
