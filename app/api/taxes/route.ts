import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch consolidated tax information for all user properties
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch all properties with tax-related fields
    const properties = await prisma.property.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        address: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        name: true,
        purchasePrice: true,
        closingDate: true,
        estimatedTaxes: true,
        stateTaxStamps: true,
        propertyTaxProration: true,
        place: {
          select: {
            name: true,
            state: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate summary statistics
    const totalProperties = properties.length
    const totalEstimatedAnnualTaxes = properties
      .filter(p => p.estimatedTaxes)
      .reduce((sum, p) => sum + Number(p.estimatedTaxes || 0), 0)
    
    const totalStateTaxStamps = properties
      .filter(p => p.stateTaxStamps)
      .reduce((sum, p) => sum + Number(p.stateTaxStamps || 0), 0)
    
    const totalPropertyTaxProration = properties
      .filter(p => p.propertyTaxProration)
      .reduce((sum, p) => sum + Number(p.propertyTaxProration || 0), 0)

    const propertiesWithTaxData = properties.filter(p => 
      p.estimatedTaxes || p.stateTaxStamps || p.propertyTaxProration
    ).length

    // Group properties by state for regional analysis
    const propertiesByState = properties.reduce((acc, property) => {
      const state = property.state || property.place?.state || 'Unknown'
      if (!acc[state]) {
        acc[state] = {
          count: 0,
          totalEstimatedTaxes: 0,
          totalStateTaxStamps: 0,
          totalPropertyTaxProration: 0,
          properties: []
        }
      }
      acc[state].count++
      acc[state].totalEstimatedTaxes += Number(property.estimatedTaxes || 0)
      acc[state].totalStateTaxStamps += Number(property.stateTaxStamps || 0)
      acc[state].totalPropertyTaxProration += Number(property.propertyTaxProration || 0)
      acc[state].properties.push(property)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      summary: {
        totalProperties,
        propertiesWithTaxData,
        totalEstimatedAnnualTaxes,
        totalStateTaxStamps,
        totalPropertyTaxProration,
        averageEstimatedTaxes: propertiesWithTaxData > 0 ? totalEstimatedAnnualTaxes / propertiesWithTaxData : 0,
      },
      propertiesByState,
      properties,
    })
  } catch (error) {
    console.error("Error fetching tax data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
