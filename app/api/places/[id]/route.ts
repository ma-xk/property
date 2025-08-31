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
            address: true,
            name: true,
            purchasePrice: true,
            acres: true,
            type: true,
            estimatedTaxes: true,
            available: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
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
    console.error("Error fetching place:", error)
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
            address: true,
            name: true,
            purchasePrice: true,
            acres: true,
            type: true,
            estimatedTaxes: true,
            available: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
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
    
    console.error("Error updating place:", error)
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
    console.error("Error deleting place:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
