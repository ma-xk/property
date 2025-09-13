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
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        name: true,
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

    // Fetch all deals with tax-related fields for the same user
    const deals = await prisma.deal.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        stateTaxStamps: true,
        promotedToPropertyId: true,
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
    
    const totalStateTaxStamps = deals
      .filter(d => d.stateTaxStamps)
      .reduce((sum, d) => sum + Number(d.stateTaxStamps || 0), 0)
    
    const totalPropertyTaxProration = properties
      .filter(p => p.propertyTaxProration)
      .reduce((sum, p) => sum + Number(p.propertyTaxProration || 0), 0)

    const propertiesWithTaxData = propertiesWithEstimatedTaxes.filter(p => 
      p.estimatedAnnualTaxes || p.propertyTaxProration
    ).length + deals.filter(d => d.stateTaxStamps).length

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
      acc[state].totalPropertyTaxProration += Number(property.propertyTaxProration || 0)
      
      acc[state].places[placeName].count++
      acc[state].places[placeName].totalEstimatedTaxes += Number(property.estimatedAnnualTaxes || 0)
      acc[state].places[placeName].totalPropertyTaxProration += Number(property.propertyTaxProration || 0)
      acc[state].places[placeName].properties.push(property)
      
      return acc
    }, {} as Record<string, any>)

    // Add state tax stamps from deals to the regional analysis
    deals.forEach(deal => {
      if (deal.stateTaxStamps) {
        const state = deal.state || 'Unknown'
        const placeName = deal.city || 'Unknown Place'
        
        if (!propertiesByState[state]) {
          propertiesByState[state] = {
            count: 0,
            totalEstimatedTaxes: 0,
            totalStateTaxStamps: 0,
            totalPropertyTaxProration: 0,
            places: {}
          }
        }
        
        if (!propertiesByState[state].places[placeName]) {
          propertiesByState[state].places[placeName] = {
            count: 0,
            totalEstimatedTaxes: 0,
            totalStateTaxStamps: 0,
            totalPropertyTaxProration: 0,
            millRate: null,
            properties: []
          }
        }
        
        propertiesByState[state].totalStateTaxStamps += Number(deal.stateTaxStamps)
        propertiesByState[state].places[placeName].totalStateTaxStamps += Number(deal.stateTaxStamps)
      }
    })

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
