import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateMillRateSchema = z.object({
  millRate: z.number().min(0),
  notes: z.string().optional(),
})

// PUT - Update mill rate entry
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; millRateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, millRateId } = await params
    const body = await req.json()
    const validatedData = updateMillRateSchema.parse(body)

    // Verify mill rate entry exists and belongs to user
    const existingMillRate = await prisma.millRateHistory.findFirst({
      where: {
        id: millRateId,
        placeId: id,
        userId: session.user.id
      }
    })

    if (!existingMillRate) {
      return NextResponse.json(
        { error: "Mill rate entry not found" },
        { status: 404 }
      )
    }

    const updatedMillRate = await prisma.millRateHistory.update({
      where: {
        id: millRateId
      },
      data: {
        millRate: validatedData.millRate,
        notes: validatedData.notes
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

    if (latestMillRate && latestMillRate.year === existingMillRate.year) {
      await prisma.place.update({
        where: { id },
        data: { millRate: validatedData.millRate }
      })
    }

    return NextResponse.json(updatedMillRate)
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

// DELETE - Delete mill rate entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; millRateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, millRateId } = await params

    // Verify mill rate entry exists and belongs to user
    const existingMillRate = await prisma.millRateHistory.findFirst({
      where: {
        id: millRateId,
        placeId: id,
        userId: session.user.id
      }
    })

    if (!existingMillRate) {
      return NextResponse.json(
        { error: "Mill rate entry not found" },
        { status: 404 }
      )
    }

    await prisma.millRateHistory.delete({
      where: {
        id: millRateId
      }
    })

    // Update the current mill rate on the place if this was the most recent year
    const latestMillRate = await prisma.millRateHistory.findFirst({
      where: {
        placeId: id,
        userId: session.user.id
      },
      orderBy: {
        year: 'desc'
      }
    })

    if (latestMillRate) {
      await prisma.place.update({
        where: { id },
        data: { millRate: latestMillRate.millRate }
      })
    } else {
      // No more mill rate history, set to null
      await prisma.place.update({
        where: { id },
        data: { millRate: null }
      })
    }

    return NextResponse.json({ message: "Mill rate entry deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
