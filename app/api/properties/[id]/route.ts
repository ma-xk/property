import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch individual property by ID
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
    const property = await prisma.property.findUnique({
      where: {
        id,
        // Ensure user can only access their own properties
        userId: session.user.id
      },
      include: {
        sellerPerson: true,
        sellerAgentPerson: true,
        buyerAgentPerson: true,
        titleCompanyPerson: true,
        place: true,
        taxPayments: {
          orderBy: {
            year: 'desc'
          }
        },
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update property
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

    // First check if property exists and belongs to user
    const existingProperty = await prisma.property.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Update the property
    const updatedProperty = await prisma.property.update({
      where: {
        id
      },
      data: {
        ...body,
        // Ensure userId cannot be changed
        userId: session.user.id
      },
      include: {
        sellerPerson: true,
        sellerAgentPerson: true,
        buyerAgentPerson: true,
        titleCompanyPerson: true,
        place: true,
        taxPayments: {
          orderBy: {
            year: 'desc'
          }
        },
      }
    })

    return NextResponse.json(updatedProperty)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete property
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
    // First check if property exists and belongs to user
    const existingProperty = await prisma.property.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Delete the property
    await prisma.property.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
