import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
})

// GET - Fetch specific person
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

    const person = await prisma.person.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        propertiesAsSeller: {
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
            createdAt: true,
          }
        },
        propertiesAsSellerAgent: {
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
            createdAt: true,
          }
        },
        propertiesAsBuyerAgent: {
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
            createdAt: true,
          }
        },
        propertiesAsTitleCompany: {
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
            createdAt: true,
          }
        },
      }
    })

    if (!person) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(person)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update person
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
    const validatedData = updatePersonSchema.parse(body)

    // Check if person exists and belongs to user
    const existingPerson = await prisma.person.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      )
    }

    // Check if another person with same name exists (excluding current person)
    if (validatedData.name !== existingPerson.name) {
      const duplicatePerson = await prisma.person.findFirst({
        where: {
          name: validatedData.name,
          userId: session.user.id,
          id: { not: id }
        }
      })

      if (duplicatePerson) {
        return NextResponse.json(
          { error: "A person with this name already exists" },
          { status: 409 }
        )
      }
    }

    const person = await prisma.person.update({
      where: {
        id: id,
      },
      data: validatedData,
      include: {
        propertiesAsSeller: {
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
            createdAt: true,
          }
        },
        propertiesAsSellerAgent: {
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
            createdAt: true,
          }
        },
        propertiesAsBuyerAgent: {
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
            createdAt: true,
          }
        },
        propertiesAsTitleCompany: {
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
            createdAt: true,
          }
        },
      }
    })

    return NextResponse.json(person)
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

// DELETE - Delete person
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

    // Check if person exists and belongs to user
    const existingPerson = await prisma.person.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      )
    }

    await prisma.person.delete({
      where: {
        id: id,
      }
    })

    return NextResponse.json({ message: "Person deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
