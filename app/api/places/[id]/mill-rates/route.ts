import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createMillRateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  millRate: z.number().min(0),
  notes: z.string().optional(),
})

const updateMillRateSchema = z.object({
  millRate: z.number().min(0),
  notes: z.string().optional(),
})

// GET - Fetch mill rate history for a place
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

    // Verify place exists and belongs to user
    const place = await prisma.place.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!place) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      )
    }

    const millRateHistories = await prisma.millRateHistory.findMany({
      where: {
        placeId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    return NextResponse.json(millRateHistories)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new mill rate entry
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
    const validatedData = createMillRateSchema.parse(body)

    // Verify place exists and belongs to user
    const place = await prisma.place.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!place) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      )
    }

    // Check if mill rate for this year already exists
    const existingMillRate = await prisma.millRateHistory.findFirst({
      where: {
        placeId: id,
        year: validatedData.year,
        userId: session.user.id
      }
    })

    if (existingMillRate) {
      return NextResponse.json(
        { error: "Mill rate for this year already exists" },
        { status: 409 }
      )
    }

    const millRateHistory = await prisma.millRateHistory.create({
      data: {
        year: validatedData.year,
        millRate: validatedData.millRate,
        notes: validatedData.notes,
        placeId: id,
        userId: session.user.id
      }
    })

    // Update the current mill rate on the place if this is the most recent year
    const latestMillRate = await prisma.millRateHistory.findFirst({
      where: {
        placeId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    if (latestMillRate && latestMillRate.year === validatedData.year) {
      await prisma.place.update({
        where: { id },
        data: { millRate: validatedData.millRate }
      })
    }

    return NextResponse.json(millRateHistory, { status: 201 })
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
