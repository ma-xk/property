import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all mill rate history for the user
    const millRateHistory = await prisma.millRateHistory.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        place: {
          select: {
            name: true,
            kind: true,
            county: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { millRate: 'desc' }
      ]
    })

    // Transform the data to include county information
    // For analytics, we want county-level mill rates only
    const millRateData = millRateHistory
      .filter(record => record.place.kind === 'COUNTY') // Only county-level rates
      .map(record => ({
        year: record.year,
        county: record.place.name, // County name
        millRate: record.millRate,
        placeName: record.place.name,
        placeKind: record.place.kind
      }))

    return NextResponse.json(millRateData)
  } catch (error) {
    console.error('Error fetching mill rate analytics:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
