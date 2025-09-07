import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createValuationSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  assessedValue: z.number().min(0).optional(),
  marketValue: z.number().min(0).optional(),
  assessmentDate: z.string().optional(),
  assessmentNotes: z.string().optional(),
})

const updateValuationSchema = z.object({
  assessedValue: z.number().min(0).optional(),
  marketValue: z.number().min(0).optional(),
  assessmentDate: z.string().optional(),
  assessmentNotes: z.string().optional(),
})

// GET - Fetch valuation history for a property
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

    // Verify property exists and belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const valuationHistories = await prisma.propertyValuationHistory.findMany({
      where: {
        propertyId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    return NextResponse.json(valuationHistories)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new valuation entry
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
    const body = await req.json()
    const validatedData = createValuationSchema.parse(body)

    // Verify property exists and belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Check if valuation for this year already exists
    const existingValuation = await prisma.propertyValuationHistory.findFirst({
      where: {
        propertyId: id,
        year: validatedData.year,
        userId: session.user.id
      }
    })

    if (existingValuation) {
      return NextResponse.json(
        { error: "Valuation for this year already exists" },
        { status: 409 }
      )
    }

    // Convert assessment date string to DateTime if provided
    let assessmentDate = undefined
    if (validatedData.assessmentDate) {
      assessmentDate = new Date(validatedData.assessmentDate)
    }

    const valuationHistory = await prisma.propertyValuationHistory.create({
      data: {
        year: validatedData.year,
        assessedValue: validatedData.assessedValue,
        marketValue: validatedData.marketValue,
        assessmentDate: assessmentDate,
        assessmentNotes: validatedData.assessmentNotes,
        propertyId: id,
        userId: session.user.id
      }
    })

    // Update the current valuation on the property if this is the most recent year
    const latestValuation = await prisma.propertyValuationHistory.findFirst({
      where: {
        propertyId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    if (latestValuation && latestValuation.year === validatedData.year) {
      await prisma.property.update({
        where: { id },
        data: {
          assessedValue: validatedData.assessedValue,
          marketValue: validatedData.marketValue,
          lastAssessmentDate: assessmentDate,
          assessmentNotes: validatedData.assessmentNotes
        }
      })
    }

    return NextResponse.json(valuationHistory, { status: 201 })
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
