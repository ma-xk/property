import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import axios from "axios"

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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const bounds = searchParams.get('bounds')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    console.log(`Fetching parcels for coordinates: ${latitude}, ${longitude}`)

    // Step 1: Query Maine Parcels Organized Towns FeatureServer using spatial query
    let parcelFeatures: ParcelFeature[] = []
    
    try {
      const parcelsUrl = "https://gis.maine.gov/mapservices/rest/services/escb/escbContributorFeature/FeatureServer/21/query"
      
      // Use spatial query with the provided coordinates
      const spatialParams = new URLSearchParams({
        f: "json",
        where: "1=1",
        geometry: `${longitude},${latitude}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326", // WGS84
        spatialRel: "esriSpatialRelIntersects",
        outFields: "*",
        returnGeometry: "true",
        maxRecordCount: "50",
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
          details: "The coordinates may not be in Maine or the parcel data may not be available for this area."
        },
        { status: 404 }
      )
    }

    // Step 2: Check for LUPC zoning if in Unorganized Territory
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

    // Step 3: Create GeoJSON response
    const geojson = createGeoJSON(parcelFeatures, lupcFeatures)

    return NextResponse.json({
      success: true,
      geojson,
      metadata: {
        geocoded: true,
        geocodeScore: 100,
        geocodeAddress: `Coordinates: ${latitude}, ${longitude}`,
        parcelCount: parcelFeatures.length,
        lupcCount: lupcFeatures.length,
        searchAddress: `Coordinates: ${latitude}, ${longitude}`,
        town: parcelFeatures[0]?.attributes.TOWN || "Unknown"
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
