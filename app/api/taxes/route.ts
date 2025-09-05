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

        stateTaxStamps: true,
        propertyTaxProration: true,
        assessedValue: true,
        marketValue: true,
        lastAssessmentDate: true,
        place: {
          select: {
            id: true,
            name: true,
            state: true,
            millRate: true,
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
    
    // Calculate estimated annual taxes for each property
    const propertiesWithEstimatedTaxes = properties.map(property => {
      const estimatedAnnualTaxes = property.assessedValue && property.place?.millRate 
        ? (Number(property.assessedValue) * Number(property.place.millRate)) / 1000
        : null
      
      return {
        ...property,
        estimatedAnnualTaxes
      }
    })
    
    const totalEstimatedAnnualTaxes = propertiesWithEstimatedTaxes
      .filter(p => p.estimatedAnnualTaxes)
      .reduce((sum, p) => sum + Number(p.estimatedAnnualTaxes || 0), 0)
    
    const totalStateTaxStamps = properties
      .filter(p => p.stateTaxStamps)
      .reduce((sum, p) => sum + Number(p.stateTaxStamps || 0), 0)
    
    const totalPropertyTaxProration = properties
      .filter(p => p.propertyTaxProration)
      .reduce((sum, p) => sum + Number(p.propertyTaxProration || 0), 0)

    const propertiesWithTaxData = propertiesWithEstimatedTaxes.filter(p => 
      p.estimatedAnnualTaxes || p.stateTaxStamps || p.propertyTaxProration
    ).length

    // Group properties by state and place for regional analysis
    const propertiesByState = propertiesWithEstimatedTaxes.reduce((acc, property) => {
      const state = property.state || property.place?.state || 'Unknown'
      const placeName = property.place?.name || property.city || 'Unknown Place'
      
      if (!acc[state]) {
        acc[state] = {
          count: 0,
          totalEstimatedTaxes: 0,
          totalStateTaxStamps: 0,
          totalPropertyTaxProration: 0,
          places: {}
        }
      }
      
      if (!acc[state].places[placeName]) {
        acc[state].places[placeName] = {
          count: 0,
          totalEstimatedTaxes: 0,
          totalStateTaxStamps: 0,
          totalPropertyTaxProration: 0,
          millRate: property.place?.millRate,
          properties: []
        }
      }
      
      acc[state].count++
      acc[state].totalEstimatedTaxes += Number(property.estimatedAnnualTaxes || 0)
      acc[state].totalStateTaxStamps += Number(property.stateTaxStamps || 0)
      acc[state].totalPropertyTaxProration += Number(property.propertyTaxProration || 0)
      
      acc[state].places[placeName].count++
      acc[state].places[placeName].totalEstimatedTaxes += Number(property.estimatedAnnualTaxes || 0)
      acc[state].places[placeName].totalStateTaxStamps += Number(property.stateTaxStamps || 0)
      acc[state].places[placeName].totalPropertyTaxProration += Number(property.propertyTaxProration || 0)
      acc[state].places[placeName].properties.push(property)
      
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
      properties: propertiesWithEstimatedTaxes,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
