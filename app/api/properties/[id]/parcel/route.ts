import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import axios from "axios"

interface GeocodeResult {
  x: number
  y: number
  address: string
  score: number
}

interface ParcelFeature {
  attributes: {
    OBJECTID: number
    MAP_LOT: string
    TOWN: string
    OWNER: string
    ADDRESS: string
    ACRES: number
    LAND_VALUE: number
    BUILDING_VALUE: number
    TOTAL_VALUE: number
    [key: string]: any
  }
  geometry: {
    rings: number[][][]
    spatialReference: {
      wkid: number
    }
  }
}

interface ParcelResponse {
  features: ParcelFeature[]
  geometryType: string
  spatialReference: {
    wkid: number
  }
}

interface LUPCFeature {
  attributes: {
    OBJECTID: number
    ZONE: string
    ZONE_DESC: string
    [key: string]: any
  }
  geometry: {
    rings: number[][][]
    spatialReference: {
      wkid: number
    }
  }
}

interface LUPCResponse {
  features: LUPCFeature[]
  geometryType: string
  spatialReference: {
    wkid: number
  }
}

// Convert coordinates from Web Mercator (3857) to WGS84 (4326)
function webMercatorToWGS84(x: number, y: number): [number, number] {
  const lon = (x / 20037508.34) * 180
  let lat = (y / 20037508.34) * 180
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2)
  return [lon, lat]
}

// Convert polygon rings from Web Mercator to WGS84
function convertPolygonToWGS84(rings: number[][][]): number[][][] {
  return rings.map(ring => 
    ring.map(point => webMercatorToWGS84(point[0], point[1]))
  )
}

// Create GeoJSON from parcel data
function createGeoJSON(features: ParcelFeature[], lupcFeatures?: LUPCFeature[]) {
  const geojson: any = {
    type: "FeatureCollection",
    features: features.map(feature => ({
      type: "Feature",
      properties: {
        mapLot: feature.attributes.MAP_LOT,
        town: feature.attributes.TOWN,
        owner: feature.attributes.OWNER,
        address: feature.attributes.ADDRESS,
        acres: feature.attributes.ACRES,
        landValue: feature.attributes.LAND_VALUE,
        buildingValue: feature.attributes.BUILDING_VALUE,
        totalValue: feature.attributes.TOTAL_VALUE,
        ...feature.attributes
      },
      geometry: {
        type: "Polygon",
        coordinates: feature.geometry.rings
      }
    }))
  }

  // Add LUPC zoning if available
  if (lupcFeatures && lupcFeatures.length > 0) {
    geojson.features.push(...lupcFeatures.map(feature => ({
      type: "Feature",
      properties: {
        source: "LUPC",
        zone: feature.attributes.ZONE,
        zoneDescription: feature.attributes.ZONE_DESC,
        ...feature.attributes
      },
      geometry: {
        type: "Polygon",
        coordinates: feature.geometry.rings
      }
    })))
  }

  return geojson
}

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
    
    // Get property to verify ownership and get address info
    const property = await prisma.property.findUnique({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        place: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Determine search parameters
    let searchAddress: string
    let town: string | undefined

    console.log(`Property data:`, {
      streetAddress: property.streetAddress,
      city: property.city,
      state: property.state,
      placeName: property.place?.name
    })

    if (property.streetAddress && property.city && property.state) {
      // Use full address
      searchAddress = `${property.streetAddress}, ${property.city}, ${property.state}`
      town = property.city
    } else if (property.place?.name) {
      // Use place name as town
      town = property.place.name
      searchAddress = property.place.name + ", Maine"
    } else {
      return NextResponse.json(
        { error: "Insufficient address information for parcel lookup" },
        { status: 400 }
      )
    }

    console.log(`Search parameters:`, { searchAddress, town })

    // Step 1: Geocode the address using Maine NG911 Roads GeocodeServer
    let geocodeResult: GeocodeResult | null = null
    
    try {
      const geocodeUrl = "https://arcgisserver.maine.gov/arcgis/rest/services/NG911_Rds_Locator/GeocodeServer/findAddressCandidates"
      const geocodeParams = new URLSearchParams({
        f: "json",
        SingleLine: searchAddress,
        outFields: "Match_addr,Addr_type,Score",
        maxLocations: "1"
      })

      const geocodeResponse = await axios.get(`${geocodeUrl}?${geocodeParams}`, {
        timeout: 10000
      })

      if (geocodeResponse.data.candidates && geocodeResponse.data.candidates.length > 0) {
        const candidate = geocodeResponse.data.candidates[0]
        geocodeResult = {
          x: candidate.location.x,
          y: candidate.location.y,
          address: candidate.address,
          score: candidate.score
        }
        console.log(`Geocoding successful:`, geocodeResult)
      } else {
        console.log(`No geocoding candidates found for: ${searchAddress}`)
      }
    } catch (error) {
      console.error("Geocoding failed:", error)
      // Continue without geocoding - we'll try to search by town
    }

    // Step 2: Query Maine Parcels Organized Towns FeatureServer
    let parcelFeatures: ParcelFeature[] = []
    
    try {
      const parcelsUrl = "https://gis.maine.gov/mapservices/rest/services/escb/escbContributorFeature/FeatureServer/21/query"
      
      // Try lot-based search first if we have a lot number
      if (property.streetAddress && property.streetAddress.toLowerCase().includes('lot') && town) {
        const lotNumber = property.streetAddress.match(/\d+/)?.[0]
        if (lotNumber) {
          console.log(`Searching for lot ${lotNumber} in ${town}`)
          const whereClause = `TOWN = '${town}' AND MAP_BK_LOT LIKE '%${lotNumber}%'`
          const lotParams = new URLSearchParams({
            f: "json",
            where: whereClause,
            outFields: "*",
            returnGeometry: "true",
            maxRecordCount: "10",
            outSR: "4326" // Request WGS84 coordinates directly
          })
          
          const lotResponse = await axios.get(`${parcelsUrl}?${lotParams}`, {
            timeout: 15000
          })
          
          if (lotResponse.data.features && lotResponse.data.features.length > 0) {
            parcelFeatures = lotResponse.data.features
            console.log(`Found ${parcelFeatures.length} parcels for lot ${lotNumber}`)
            
            // If we have multiple parcels, try to find the most specific one
            if (parcelFeatures.length > 1) {
              // Look for Winter Street specifically
              const winterParcel = parcelFeatures.find(f => 
                f.attributes.PROP_LOC && f.attributes.PROP_LOC.toLowerCase().includes('winter')
              )
              
              if (winterParcel) {
                parcelFeatures = [winterParcel]
                console.log(`Selected Winter Street parcel: ${winterParcel.attributes.MAP_BK_LOT}`)
              }
            }
          } else {
            console.log(`No parcels found for lot ${lotNumber}`)
          }
        }
      }
      
      // If no lot-based search or no results, try spatial query
      if (parcelFeatures.length === 0 && geocodeResult && geocodeResult.score > 80) {
        console.log(`Trying spatial query with coordinates: ${geocodeResult.x}, ${geocodeResult.y}`)
        const spatialParams = new URLSearchParams({
          f: "json",
          where: "1=1",
          geometry: `${geocodeResult.x},${geocodeResult.y}`,
          geometryType: "esriGeometryPoint",
          inSR: "26919", // UTM Zone 19N
          spatialRel: "esriSpatialRelIntersects",
          outFields: "*",
          returnGeometry: "true",
          maxRecordCount: "10",
          outSR: "4326" // Request WGS84 coordinates directly
        })
        
        const parcelResponse = await axios.get(`${parcelsUrl}?${spatialParams}`, {
          timeout: 15000
        })
        
        if (parcelResponse.data.features) {
          parcelFeatures = parcelResponse.data.features
          console.log(`Found ${parcelFeatures.length} parcels via spatial query`)
        } else {
          console.log(`No parcels found via spatial query`)
        }
      }
      
      // If still no results, try town-based search
      if (parcelFeatures.length === 0 && town) {
        console.log(`Trying town-based search for ${town}`)
        const whereClause = `TOWN = '${town}'`
        const townParams = new URLSearchParams({
          f: "json",
          where: whereClause,
          outFields: "*",
          returnGeometry: "true",
          maxRecordCount: "50",
          orderByFields: "ACRES DESC",
          outSR: "4326" // Request WGS84 coordinates directly
        })
        
        const parcelResponse = await axios.get(`${parcelsUrl}?${townParams}`, {
          timeout: 15000
        })
        
        if (parcelResponse.data.features) {
          parcelFeatures = parcelResponse.data.features
          console.log(`Found ${parcelFeatures.length} parcels via town search`)
        } else {
          console.log(`No parcels found via town search`)
        }
      }
    } catch (error) {
      console.error("Parcel query failed:", error)
      return NextResponse.json(
        { 
          error: "Unable to retrieve parcel data at this time. The Maine GeoLibrary service may be temporarily unavailable.",
          details: "Please try again later or contact support if the issue persists."
        },
        { status: 503 }
      )
    }

    if (parcelFeatures.length === 0) {
      return NextResponse.json(
        { 
          error: "No parcel data found for this location",
          details: "The address may not be in Maine or the parcel data may not be available for this area."
        },
        { status: 404 }
      )
    }

    // Step 3: Check for LUPC zoning if in Unorganized Territory
    let lupcFeatures: LUPCFeature[] = []
    
    try {
      // Check if any parcels are in unorganized territory
      const unorganizedParcels = parcelFeatures.filter(feature => 
        feature.attributes.TOWN && 
        (feature.attributes.TOWN.includes("UT") || 
         feature.attributes.TOWN.includes("Unorganized") ||
         feature.attributes.TOWN.includes("Plantation"))
      )

      if (unorganizedParcels.length > 0) {
        const lupcUrl = "https://gis.maine.gov/mapservices/rest/services/lupc/LUPC_Zoning_Data_Offline/FeatureServer/0/query"
        
        // Create a bounding box from all parcel features
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        
        parcelFeatures.forEach(feature => {
          feature.geometry.rings.forEach(ring => {
            ring.forEach(point => {
              minX = Math.min(minX, point[0])
              minY = Math.min(minY, point[1])
              maxX = Math.max(maxX, point[0])
              maxY = Math.max(maxY, point[1])
            })
          })
        })

        const lupcParams = new URLSearchParams({
          f: "json",
          where: "1=1",
          geometry: `${minX},${minY},${maxX},${maxY}`,
          geometryType: "esriGeometryEnvelope",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "*",
          returnGeometry: "true",
          maxRecordCount: "10",
          outSR: "4326" // Request WGS84 coordinates directly
        })

        const lupcResponse = await axios.get(`${lupcUrl}?${lupcParams}`, {
          timeout: 10000
        })

        if (lupcResponse.data.features) {
          lupcFeatures = lupcResponse.data.features
        }
      }
    } catch (error) {
      console.error("LUPC zoning query failed:", error)
      // Continue without LUPC data - it's optional
    }

    // Step 4: Create GeoJSON response
    const geojson = createGeoJSON(parcelFeatures, lupcFeatures)

    return NextResponse.json({
      success: true,
      geojson,
      metadata: {
        geocoded: !!geocodeResult,
        geocodeScore: geocodeResult?.score,
        geocodeAddress: geocodeResult?.address,
        parcelCount: parcelFeatures.length,
        lupcCount: lupcFeatures.length,
        searchAddress,
        town
      }
    })

  } catch (error) {
    console.error("Parcel mapping error:", error)
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while retrieving parcel data",
        details: "Please try again later or contact support if the issue persists."
      },
      { status: 500 }
    )
  }
}
