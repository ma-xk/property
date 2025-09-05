import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateTaxPaymentSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  amount: z.number().min(0).optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

// PUT - Update a tax payment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: propertyId, paymentId } = await params
    const body = await req.json()
    const validatedData = updateTaxPaymentSchema.parse(body)

    // Verify tax payment exists and belongs to user
    const existingPayment = await prisma.taxPayment.findFirst({
      where: {
        id: paymentId,
        propertyId: propertyId,
        userId: session.user.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Tax payment not found" },
        { status: 404 }
      )
    }

    // If year is being updated, check for conflicts
    if (validatedData.year && validatedData.year !== existingPayment.year) {
      const conflictingPayment = await prisma.taxPayment.findUnique({
        where: {
          propertyId_year: {
            propertyId: propertyId,
            year: validatedData.year
          }
        }
      })

      if (conflictingPayment) {
        return NextResponse.json(
          { error: `Tax payment for ${validatedData.year} already exists` },
          { status: 409 }
        )
      }
    }

    const updatedPayment = await prisma.taxPayment.update({
      where: {
        id: paymentId
      },
      data: validatedData
    })

    return NextResponse.json(updatedPayment)
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

// DELETE - Delete a tax payment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: propertyId, paymentId } = await params

    // Verify tax payment exists and belongs to user
    const existingPayment = await prisma.taxPayment.findFirst({
      where: {
        id: paymentId,
        propertyId: propertyId,
        userId: session.user.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Tax payment not found" },
        { status: 404 }
      )
    }

    await prisma.taxPayment.delete({
      where: {
        id: paymentId
      }
    })

    return NextResponse.json({ message: "Tax payment deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
