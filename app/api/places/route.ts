import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for place creation
const createPlaceSchema = z.object({
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

const updatePlaceSchema = createPlaceSchema.partial().extend({
  name: z.string().min(1, "Name is required"),
})

// GET - Fetch user's places
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const places = await prisma.place.findMany({
      where: {
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
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(places)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new place
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
    const validatedData = createPlaceSchema.parse(body)

    // Check if place with same name and state already exists for this user
    const existingPlace = await prisma.place.findFirst({
      where: {
        name: validatedData.name,
        state: validatedData.state || null,
        userId: session.user.id
      }
    })

    if (existingPlace) {
      return NextResponse.json(
        { error: "A place with this name and state already exists" },
        { status: 409 }
      )
    }

    const place = await prisma.place.create({
      data: {
        ...validatedData,
        userId: session.user.id,
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
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    return NextResponse.json(place, { status: 201 })
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
