import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for person creation
const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
})

const updatePersonSchema = createPersonSchema.partial().extend({
  name: z.string().min(1, "Name is required"),
})

// GET - Fetch user's people
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const people = await prisma.person.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        propertiesAsSeller: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsSellerAgent: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsBuyerAgent: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsTitleCompany: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(people)
  } catch (error) {
    console.error("Error fetching people:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new person
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
    const validatedData = createPersonSchema.parse(body)

    // Check if person with same name already exists for this user
    const existingPerson = await prisma.person.findFirst({
      where: {
        name: validatedData.name,
        userId: session.user.id
      }
    })

    if (existingPerson) {
      return NextResponse.json(
        { error: "A person with this name already exists" },
        { status: 409 }
      )
    }

    const person = await prisma.person.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        propertiesAsSeller: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsSellerAgent: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsBuyerAgent: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
        propertiesAsTitleCompany: {
          select: {
            id: true,
            address: true,
            name: true,
          }
        },
      }
    })

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    
    console.error("Error creating person:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
