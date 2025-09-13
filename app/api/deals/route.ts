import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for deal creation
const createDealSchema = z.object({
  // Basic deal info
  name: z.string().min(1, "Deal name is required"),
  description: z.string().optional(),
  dealStage: z.enum(["LEAD", "UNDER_CONTRACT", "DUE_DILIGENCE", "CLOSING", "WON", "LOST"]).optional().default("LEAD"),
  dealStatus: z.enum(["ACTIVE", "ON_HOLD", "CANCELLED"]).optional().default("ACTIVE"),
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

// Helper function to find or create hierarchical place (reused from properties API)
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

// GET - Fetch all deals for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const deals = await prisma.deal.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        seller: true,
        sellerAgent: true,
        buyerAgent: true,
        titleCompany: true,
        place: true,
        promotedProperty: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(deals)
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    )
  }
}

// POST - Create new deal with automatic people and place creation
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
    const validatedData = createDealSchema.parse(body)

    // Create people and place in parallel
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

    // Create the deal
    const deal = await prisma.deal.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        dealStage: validatedData.dealStage,
        dealStatus: validatedData.dealStatus,
        targetClosingDate: validatedData.targetClosingDate ? new Date(validatedData.targetClosingDate) : null,
        dealNotes: validatedData.dealNotes,
        
        // Address fields
        streetAddress: validatedData.streetAddress,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        
        // Property information
        acres: validatedData.acres,
        zoning: validatedData.zoning,
        
        // Deal financials
        askingPrice: validatedData.askingPrice,
        offerPrice: validatedData.offerPrice,
        earnestMoney: validatedData.earnestMoney,
        estimatedClosingCosts: validatedData.estimatedClosingCosts,
        
        // Purchase transaction details
        purchasePrice: validatedData.purchasePrice,
        closingDate: validatedData.closingDate ? new Date(validatedData.closingDate) : null,
        
        // Financing details
        financingTerms: validatedData.financingTerms,
        financingType: validatedData.financingType,
        
        // Closing costs
        titleSettlementFee: validatedData.titleSettlementFee,
        titleExamination: validatedData.titleExamination,
        ownersPolicyPremium: validatedData.ownersPolicyPremium,
        recordingFeesDeed: validatedData.recordingFeesDeed,
        stateTaxStamps: validatedData.stateTaxStamps,
        eRecordingFee: validatedData.eRecordingFee,
        realEstateCommission: validatedData.realEstateCommission,
        
        // Relationships
        sellerId: sellerPerson?.id,
        sellerAgentId: sellerAgentPerson?.id,
        buyerAgentId: buyerAgentPerson?.id,
        titleCompanyId: titleCompanyPerson?.id,
        placeId: place?.id,
        
        userId: session.user.id
      },
      include: {
        seller: true,
        sellerAgent: true,
        buyerAgent: true,
        titleCompany: true,
        place: true
      }
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error("Error creating deal:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    )
  }
}
