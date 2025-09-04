import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTaxPaymentSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 10),
  amount: z.number().min(0),
  paymentDate: z.string().datetime(),
  notes: z.string().optional(),
})

const updateTaxPaymentSchema = createTaxPaymentSchema.partial()

// GET - Fetch all tax payments for a property
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

    const { id: propertyId } = await params

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const taxPayments = await prisma.taxPayment.findMany({
      where: {
        propertyId: propertyId,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    return NextResponse.json(taxPayments)
  } catch (error) {
    console.error("Error fetching tax payments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new tax payment
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

    const { id: propertyId } = await params
    const body = await req.json()
    const validatedData = createTaxPaymentSchema.parse(body)

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Check if payment for this year already exists
    const existingPayment = await prisma.taxPayment.findUnique({
      where: {
        propertyId_year: {
          propertyId: propertyId,
          year: validatedData.year
        }
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: `Tax payment for ${validatedData.year} already exists. Use PUT to update it.` },
        { status: 409 }
      )
    }

    const taxPayment = await prisma.taxPayment.create({
      data: {
        ...validatedData,
        propertyId: propertyId,
        userId: session.user.id
      }
    })

    return NextResponse.json(taxPayment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    
    console.error("Error creating tax payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
