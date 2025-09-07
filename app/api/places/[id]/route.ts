import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePlaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  state: z.string().optional(),
  country: z.string().optional().default("United States"),
  description: z.string().optional(),
  
  // Tax Information Fields
  taxPaymentAddress: z.string().nullable().optional(),
  taxPaymentWebsite: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  taxOfficePhone: z.string().nullable().optional(),
  taxDueMonth: z.number().int().min(1).max(12).optional(),
  taxDueDay: z.number().int().min(1).max(31).optional(),
  lateInterestRate: z.union([z.number().min(0).max(100), z.string().transform((val) => parseFloat(val)), z.null()]).optional(),
  assessmentMonth: z.number().int().min(1).max(12).optional(),
  assessmentDay: z.number().int().min(1).max(31).optional(),
  millRate: z.union([z.number().min(0), z.string().transform((val) => parseFloat(val)), z.null()]).optional(),
  taxNotes: z.string().nullable().optional(),
  
  // Zoning Information Fields
  zoningOfficeAddress: z.string().optional(),
  zoningOfficePhone: z.string().optional(),
  zoningOfficeWebsiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  
  // Code Enforcement Officer (CEO) Information
  ceoName: z.string().optional(),
  ceoEmail: z.union([z.string().email(), z.literal("")]).optional(),
  ceoPhone: z.string().optional(),
  
  // Plumbing Inspector Information
  plumbingInspectorName: z.string().optional(),
  plumbingInspectorEmail: z.union([z.string().email(), z.literal("")]).optional(),
  plumbingInspectorPhone: z.string().optional(),
})

// GET - Fetch specific place
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

    const place = await prisma.place.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        properties: {
          select: {
            id: true,
            streetAddress: true,
            city: true,
            state: true,
            zipCode: true,
            name: true,
            purchasePrice: true,
            acres: true,
            type: true,
            assessedValue: true,
            available: true,
            createdAt: true,
            place: {
              select: {
                id: true,
                name: true,
                state: true,
                millRate: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        millRateHistories: {
          orderBy: {
            year: 'desc'
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    if (!place) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(place)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update place
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
    const validatedData = updatePlaceSchema.parse(body)

    // Check if place exists and belongs to user
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingPlace) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      )
    }

    // Check if another place with same name and state exists (excluding current place)
    if (validatedData.name !== existingPlace.name || validatedData.state !== existingPlace.state) {
      const duplicatePlace = await prisma.place.findFirst({
        where: {
          name: validatedData.name,
          state: validatedData.state || null,
          userId: session.user.id,
          id: { not: id }
        }
      })

      if (duplicatePlace) {
        return NextResponse.json(
          { error: "A place with this name and state already exists" },
          { status: 409 }
        )
      }
    }

    const place = await prisma.place.update({
      where: {
        id: id,
      },
      data: validatedData,
      include: {
        properties: {
          select: {
            id: true,
            streetAddress: true,
            city: true,
            state: true,
            zipCode: true,
            name: true,
            purchasePrice: true,
            acres: true,
            type: true,
            assessedValue: true,
            available: true,
            createdAt: true,
            place: {
              select: {
                id: true,
                name: true,
                state: true,
                millRate: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        millRateHistories: {
          orderBy: {
            year: 'desc'
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    return NextResponse.json(place)
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

// DELETE - Delete place
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

    // Check if place exists and belongs to user
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    if (!existingPlace) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      )
    }

    // Check if place has associated properties
    if (existingPlace._count.properties > 0) {
      return NextResponse.json(
        { error: "Cannot delete place that has associated properties. Please remove or reassign the properties first." },
        { status: 409 }
      )
    }

    await prisma.place.delete({
      where: {
        id: id,
      }
    })

    return NextResponse.json({ message: "Place deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
