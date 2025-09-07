import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateValuationSchema = z.object({
  assessedValue: z.number().min(0).optional(),
  marketValue: z.number().min(0).optional(),
  assessmentDate: z.string().optional(),
  assessmentNotes: z.string().optional(),
})

// PUT - Update valuation entry
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; valuationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, valuationId } = await params
    const body = await req.json()
    const validatedData = updateValuationSchema.parse(body)

    // Verify valuation entry exists and belongs to user
    const existingValuation = await prisma.propertyValuationHistory.findFirst({
      where: {
        id: valuationId,
        propertyId: id,
        userId: session.user.id
      }
    })

    if (!existingValuation) {
      return NextResponse.json(
        { error: "Valuation entry not found" },
        { status: 404 }
      )
    }

    // Convert assessment date string to DateTime if provided
    let assessmentDate = existingValuation.assessmentDate
    if (validatedData.assessmentDate !== undefined) {
      assessmentDate = validatedData.assessmentDate ? new Date(validatedData.assessmentDate) : null
    }

    const updatedValuation = await prisma.propertyValuationHistory.update({
      where: {
        id: valuationId
      },
      data: {
        assessedValue: validatedData.assessedValue,
        marketValue: validatedData.marketValue,
        assessmentDate: assessmentDate,
        assessmentNotes: validatedData.assessmentNotes
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

    if (latestValuation && latestValuation.year === existingValuation.year) {
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

    return NextResponse.json(updatedValuation)
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

// DELETE - Delete valuation entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; valuationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, valuationId } = await params

    // Verify valuation entry exists and belongs to user
    const existingValuation = await prisma.propertyValuationHistory.findFirst({
      where: {
        id: valuationId,
        propertyId: id,
        userId: session.user.id
      }
    })

    if (!existingValuation) {
      return NextResponse.json(
        { error: "Valuation entry not found" },
        { status: 404 }
      )
    }

    await prisma.propertyValuationHistory.delete({
      where: {
        id: valuationId
      }
    })

    // Update the current valuation on the property if this was the most recent year
    const latestValuation = await prisma.propertyValuationHistory.findFirst({
      where: {
        propertyId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    if (latestValuation) {
      await prisma.property.update({
        where: { id },
        data: {
          assessedValue: latestValuation.assessedValue,
          marketValue: latestValuation.marketValue,
          lastAssessmentDate: latestValuation.assessmentDate,
          assessmentNotes: latestValuation.assessmentNotes
        }
      })
    } else {
      // No more valuation history, set to null
      await prisma.property.update({
        where: { id },
        data: {
          assessedValue: null,
          marketValue: null,
          lastAssessmentDate: null,
          assessmentNotes: null
        }
      })
    }

    return NextResponse.json({ message: "Valuation entry deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
