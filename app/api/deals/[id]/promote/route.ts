import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Promote a deal to a property
export async function POST(
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

    // Find the deal
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
        place: true
      }
    })

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      )
    }

    // Check if deal has already been promoted
    if (deal.promotedToPropertyId) {
      return NextResponse.json(
        { error: "Deal has already been promoted to a property" },
        { status: 400 }
      )
    }

    // Check if deal is in WON stage
    if (deal.dealStage !== "WON") {
      return NextResponse.json(
        { error: "Only deals in WON stage can be promoted to properties" },
        { status: 400 }
      )
    }

    // Validate required fields for promotion
    const validationErrors = []
    
    if (!deal.streetAddress) {
      validationErrors.push("Street address is required for property creation")
    }
    
    if (!deal.city) {
      validationErrors.push("City is required for property creation")
    }
    
    if (!deal.state) {
      validationErrors.push("State is required for property creation")
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required information for property creation",
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // Create or find place for the property
    let placeId = deal.placeId
    
    if (!placeId && deal.city && deal.state) {
      // Create place if it doesn't exist
      const place = await prisma.place.create({
        data: {
          name: deal.city,
          kind: "TOWN", // Default to town
          state: deal.state,
          country: "United States",
          description: `${deal.city}, ${deal.state}`,
          userId: session.user.id
        }
      })
      placeId = place.id
    }

    // Create the property from the deal data
    const property = await prisma.property.create({
      data: {
        // Basic property info
        name: deal.name,
        description: deal.description,
        
        // Address fields
        streetAddress: deal.streetAddress,
        city: deal.city,
        state: deal.state,
        zipCode: deal.zipCode,
        placeId: placeId,
        
        // Property characteristics
        acres: deal.acres,
        zoning: deal.zoning,
        
        // Ongoing financial management
        balloonDueDate: deal.targetClosingDate, // Use target closing date as balloon due date
        
        // Property characteristics
        type: "Land", // Default type for promoted deals
        available: true,
        
        userId: session.user.id
      },
      include: {
        place: true,
        originalDeal: true
      }
    })

    // Update the deal to mark it as promoted
    const updatedDeal = await prisma.deal.update({
      where: { id: id },
      data: {
        promotedToPropertyId: property.id,
        promotedAt: new Date()
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

    return NextResponse.json({
      deal: updatedDeal,
      property: property,
      message: "Deal successfully promoted to property"
    }, { status: 201 })
  } catch (error) {
    console.error("Error promoting deal:", error)
    return NextResponse.json(
      { error: "Failed to promote deal to property" },
      { status: 500 }
    )
  }
}
