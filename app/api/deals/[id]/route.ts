import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for deal updates
const updateDealSchema = z.object({
  // Basic deal info
  name: z.string().min(1, "Deal name is required").optional(),
  description: z.string().optional(),
  dealStage: z.enum(["LEAD", "UNDER_CONTRACT", "DUE_DILIGENCE", "CLOSING", "WON", "LOST"]).optional(),
  dealStatus: z.enum(["ACTIVE", "ON_HOLD", "CANCELLED"]).optional(),
  targetClosingDate: z.string().optional(),
  dealNotes: z.string().optional(),
  
  // Address fields
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Place hierarchy fields
  county: z.string().optional(),
  placeType: z.enum(["TOWN", "UT", "CITY"]).optional(),
  
  // Property information
  acres: z.number().min(0).optional(),
  zoning: z.string().optional(),
  
  // Deal financials
  askingPrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0).optional(),
  earnestMoney: z.number().min(0).optional(),
  estimatedClosingCosts: z.number().min(0).optional(),
  
  // Purchase transaction details
  purchasePrice: z.number().min(0).optional(),
  closingDate: z.string().optional(),
  
  // Financing details
  financingTerms: z.string().optional(),
  financingType: z.string().optional(),
  
  // Closing costs
  titleSettlementFee: z.number().min(0).optional(),
  titleExamination: z.number().min(0).optional(),
  ownersPolicyPremium: z.number().min(0).optional(),
  recordingFeesDeed: z.number().min(0).optional(),
  stateTaxStamps: z.number().min(0).optional(),
  eRecordingFee: z.number().min(0).optional(),
  realEstateCommission: z.number().min(0).optional(),
  
  // People/Companies
  seller: z.string().optional(),
  sellerAgent: z.string().optional(),
  buyerAgent: z.string().optional(),
  titleCompany: z.string().optional(),
})

// Helper function to find or create hierarchical place (reused from deals API)
async function findOrCreateHierarchicalPlace(
  city: string, 
  state: string | null, 
  county: string | null, 
  placeType: string | null, 
  userId: string
) {
  const trimmedCity = city?.trim()
  const trimmedState = state?.trim()
  const trimmedCounty = county?.trim()
  const trimmedPlaceType = placeType?.trim()

  if (!trimmedCity || !trimmedState) {
    return null
  }

  // Find or create state place
  let statePlace = null
  if (trimmedState) {
    statePlace = await prisma.place.findFirst({
      where: {
        name: trimmedState,
        kind: "STATE",
        userId: userId
      }
    })
    
    if (!statePlace) {
      statePlace = await prisma.place.create({
        data: {
          name: trimmedState,
          kind: "STATE",
          state: trimmedState,
          country: "United States",
          description: `${trimmedState} State`,
          userId: userId
        }
      })
    }
  }

  // Find or create county place
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

// GET - Fetch a specific deal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const deal = await prisma.deal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        seller: true,
        sellerAgent: true,
        buyerAgent: true,
        titleCompany: true,
        place: true,
        promotedProperty: true
      }
    })

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("Error fetching deal:", error)
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    )
  }
}

// PUT - Update a specific deal
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = updateDealSchema.parse(body)

    // Check if deal exists and belongs to user
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingDeal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      )
    }

    // Create people and place in parallel if they're being updated
    const [sellerPerson, sellerAgentPerson, buyerAgentPerson, titleCompanyPerson, place] = await Promise.all([
      // Create seller person if provided
      validatedData.seller ? prisma.person.upsert({
        where: {
          name_userId: {
            name: validatedData.seller,
            userId: session.user.id
          }
        },
        update: {},
        create: {
          name: validatedData.seller,
          userId: session.user.id
        }
      }) : null,
      
      // Create seller agent person if provided
      validatedData.sellerAgent ? prisma.person.upsert({
        where: {
          name_userId: {
            name: validatedData.sellerAgent,
            userId: session.user.id
          }
        },
        update: {},
        create: {
          name: validatedData.sellerAgent,
          userId: session.user.id
        }
      }) : null,
      
      // Create buyer agent person if provided
      validatedData.buyerAgent ? prisma.person.upsert({
        where: {
          name_userId: {
            name: validatedData.buyerAgent,
            userId: session.user.id
          }
        },
        update: {},
        create: {
          name: validatedData.buyerAgent,
          userId: session.user.id
        }
      }) : null,
      
      // Create title company person if provided
      validatedData.titleCompany ? prisma.person.upsert({
        where: {
          name_userId: {
            name: validatedData.titleCompany,
            userId: session.user.id
          }
        },
        update: {},
        create: {
          name: validatedData.titleCompany,
          userId: session.user.id
        }
      }) : null,
      
      // Create place if address is provided
      validatedData.city && validatedData.state ? findOrCreateHierarchicalPlace(
        validatedData.city,
        validatedData.state,
        validatedData.county || null,
        validatedData.placeType || null,
        session.user.id
      ) : null
    ])

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      targetClosingDate: validatedData.targetClosingDate ? new Date(validatedData.targetClosingDate) : undefined,
      closingDate: validatedData.closingDate ? new Date(validatedData.closingDate) : undefined,
    }

    // Add relationship IDs if people were created/found
    if (sellerPerson) updateData.sellerId = sellerPerson.id
    if (sellerAgentPerson) updateData.sellerAgentId = sellerAgentPerson.id
    if (buyerAgentPerson) updateData.buyerAgentId = buyerAgentPerson.id
    if (titleCompanyPerson) updateData.titleCompanyId = titleCompanyPerson.id
    if (place) updateData.placeId = place.id

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const updatedDeal = await prisma.deal.update({
      where: { id: id },
      data: updateData,
      include: {
        seller: true,
        sellerAgent: true,
        buyerAgent: true,
        titleCompany: true,
        place: true,
        promotedProperty: true
      }
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    console.error("Error updating deal:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific deal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if deal exists and belongs to user
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingDeal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      )
    }

    // Check if deal has been promoted to a property
    if (existingDeal.promotedToPropertyId) {
      return NextResponse.json(
        { error: "Cannot delete deal that has been promoted to a property" },
        { status: 400 }
      )
    }

    await prisma.deal.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Deal deleted successfully" })
  } catch (error) {
    console.error("Error deleting deal:", error)
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    )
  }
}
