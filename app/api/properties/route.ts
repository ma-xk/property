import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for property creation
const createPropertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  
  // Basic Property Info
  name: z.string().optional(),
  description: z.string().optional(),
  acres: z.number().min(0).optional(),
  zoning: z.string().optional(),
  
  // Purchase Information
  purchasePrice: z.number().min(0).optional(),
  earnestMoney: z.number().min(0).optional(),
  closingDate: z.string().optional(),
  estimatedTaxes: z.number().min(0).optional(),
  
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new property
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

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        userId: session.user.id,
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
    
    console.error("Error creating property:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
