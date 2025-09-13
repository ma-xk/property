import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient({
  // Optimize for bulk operations
  log: ['error', 'warn'],
})

// Maine counties list
const MAINE_COUNTIES = [
  "Androscoggin","Aroostook", "Cumberland", "Franklin", "Hancock", "Kennebec", "Knox", "Lincoln", 
  "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset", 
  "Waldo", "Washington", "York"
] as const

interface MillRateData {
  year: number
  county: string
  millRate: number
}

interface MunicipalityData {
  Municipality: string
  Type: string
  County: string
  'Population (2020)': string
  'Year Incorporated': string
}

interface MunicipalMillRateData {
  municipality: string
  county: string
  year: number
  millRate: number
  percentageChange?: number
}

async function readCountyMillRateCSV(): Promise<MillRateData[]> {
  const csvPath = path.join(process.cwd(), 'data', 'maine_historic_ut_rates.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')
  
  const millRateData: MillRateData[] = []
  
  // Skip header row, process data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    const year = parseInt(row[0])
    
    // Process each county column (index 1-12, but we have 14 counties total)
    const countyColumns = [
      'Aroostook', 'Franklin', 'Hancock', 'Kennebec', 'Knox', 'Lincoln',
      'Oxford', 'Penobscot', 'Piscataquis', 'Somerset', 'Waldo', 'Washington'
    ]
    
    for (let j = 1; j < row.length && j <= countyColumns.length; j++) {
      const county = countyColumns[j - 1]
      const millRateStr = row[j]
      
      if (millRateStr && millRateStr.trim() !== '') {
        const millRate = parseFloat(millRateStr)
        if (!isNaN(millRate)) {
          millRateData.push({
            year,
            county,
            millRate
          })
        }
      }
    }
  }
  
  return millRateData
}

async function readMunicipalityCSV(): Promise<MunicipalityData[]> {
  const csvPath = path.join(process.cwd(), 'data', 'maine_municipalities.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  
  const records: MunicipalityData[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const record: any = {}
    headers.forEach((header, index) => {
      record[header.trim()] = values[index]?.trim() || ''
    })
    records.push(record as MunicipalityData)
  }
  
  return records
}

async function readMunicipalMillRateCSV(): Promise<MunicipalMillRateData[]> {
  const csvPath = path.join(process.cwd(), 'data', 'maine_municipality_mill_rates.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')
  
  // Extract year headers from row 2 (index 1)
  const yearRow = lines[1].split(',')
  const years: number[] = []
  
  // Extract years from columns 2 onwards (skip first two empty columns)
  for (let i = 2; i < yearRow.length; i++) {
    const yearStr = yearRow[i].trim()
    if (yearStr && !isNaN(Number(yearStr))) {
      years.push(Number(yearStr))
    }
  }
  
  // Extract percentage changes from row 4 (index 4)
  const percentageRow = lines[4].split(',')
  const percentageChanges: { [year: number]: number } = {}
  
  for (let i = 2; i < percentageRow.length && i - 2 < years.length; i++) {
    const changeStr = percentageRow[i].trim()
    if (changeStr && changeStr.includes('%')) {
      const changeValue = parseFloat(changeStr.replace('%', ''))
      if (!isNaN(changeValue)) {
        percentageChanges[years[i - 2]] = changeValue
      }
    }
  }
  
  // Process municipality data starting from row 7 (index 6)
  const municipalData: MunicipalMillRateData[] = []
  let currentCounty = ''
  
  for (let i = 6; i < lines.length; i++) {
    const row = lines[i].split(',')
    
    // Check if this is a county header (row with county name only)
    if (row[0].trim() && !row[1].trim() && !row[2].trim()) {
      currentCounty = row[0].trim()
      continue
    }
    
    // Skip empty rows or rows without municipality data
    if (!row[1].trim() || !row[2].trim()) {
      continue
    }
    
    const municipality = row[1].trim()
    
    // Skip if this looks like a header or summary row
    if (municipality.includes('State Weighted Average') || 
        municipality.includes('Equalized Tax Rate') ||
        municipality.includes('Homestead') ||
        municipality.includes('BETE') ||
        municipality.includes('TIF')) {
      continue
    }
    
    // Extract mill rates for each year
    for (let j = 2; j < row.length && j - 2 < years.length; j++) {
      const millRateStr = row[j].trim()
      if (millRateStr && !isNaN(Number(millRateStr))) {
        const millRate = Number(millRateStr)
        const year = years[j - 2]
        
        municipalData.push({
          municipality,
          county: currentCounty,
          year,
          millRate,
          percentageChange: percentageChanges[year]
        })
      }
    }
  }
  
  return municipalData
}

async function seedCompleteMaineDataOptimized() {
  try {
    console.log('🏛️ Starting OPTIMIZED comprehensive Maine data seeding...')
    console.log('⚡ Using batch operations for maximum performance')
    
    // Find a user to associate the data with
    const user = await prisma.user.findFirst()
    if (!user) {
      throw new Error('No user found in database. Please create a user first.')
    }
    console.log(`👤 Using user: ${user.email}`)
    
    // Clean up existing data to avoid duplicates
    console.log('🗑️  Cleaning up existing Maine data...')
    await prisma.millRateHistory.deleteMany({ 
      where: { 
        userId: user.id,
        place: {
          kind: { in: ['COUNTY', 'TOWN', 'UT', 'CITY'] }
        }
      } 
    })
    await prisma.place.deleteMany({ 
      where: { 
        userId: user.id,
        kind: { in: ['COUNTY', 'TOWN', 'UT', 'CITY'] }
      } 
    })
    
    // Read all CSV data
    console.log('📊 Reading CSV data...')
    const [countyMillRateData, municipalityData, municipalMillRateData] = await Promise.all([
      readCountyMillRateCSV(),
      readMunicipalityCSV(),
      readMunicipalMillRateCSV()
    ])
    
    console.log(`📈 County mill rate records: ${countyMillRateData.length}`)
    console.log(`🏘️ Municipalities: ${municipalityData.length}`)
    console.log(`📊 Municipal mill rate records: ${municipalMillRateData.length}`)
    
    // Find or create Maine state
    let maineState = await prisma.place.findFirst({
      where: {
        kind: 'STATE',
        name: 'Maine',
        userId: user.id
      }
    })
    
    if (!maineState) {
      maineState = await prisma.place.create({
        data: {
          name: 'Maine',
          kind: 'STATE',
          state: 'ME',
          country: 'United States',
          description: 'State of Maine',
          userId: user.id
        }
      })
      console.log('✅ Created Maine state')
    } else {
      console.log('✅ Found existing Maine state')
    }
    
    // Create all Maine counties in batch
    console.log(`🏛️  Creating ${MAINE_COUNTIES.length} Maine counties...`)
    const countyData = MAINE_COUNTIES.map(countyName => ({
      name: countyName,
      kind: 'COUNTY' as const,
      state: 'ME',
      country: 'United States',
      description: `${countyName} County, Maine`,
      userId: user.id,
      parentId: maineState.id,
      statePlaceId: maineState.id
    }))
    
    const createdCounties = await prisma.place.createMany({
      data: countyData,
      skipDuplicates: true
    })
    
    console.log(`✅ Created ${createdCounties.count} counties`)
    
    // Get the created counties for mill rate creation
    const counties = await prisma.place.findMany({
      where: {
        userId: user.id,
        kind: 'COUNTY'
      }
    })
    const countyMap = new Map(counties.map(c => [c.name, c]))
    
    // Create county mill rate histories in batch
    console.log(`📊 Creating county mill rate histories...`)
    const countyMillRateData_batch = countyMillRateData
      .map(data => {
        const county = countyMap.get(data.county)
        return county ? {
          year: data.year,
          millRate: data.millRate,
          notes: `${data.county} County mill rate for ${data.year}`,
          placeId: county.id,
          userId: user.id
        } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    
    const countyMillRateResult = await prisma.millRateHistory.createMany({
      data: countyMillRateData_batch,
      skipDuplicates: true
    })
    
    console.log(`✅ Created ${countyMillRateResult.count} county mill rate records`)
    
    // Create municipalities in batch
    console.log(`🏘️ Creating ${municipalityData.length} municipalities...`)
    const municipalityData_batch = municipalityData
      .map(record => {
        const municipalityName = record.Municipality
        const countyName = record.County.replace(/\s*\(.*\)/, '') // Remove (seat) etc.
        const municipalityType = record.Type
        
        // Map CSV types to our PlaceKind enum
        let placeKind: 'TOWN' | 'UT' | 'CITY'
        if (municipalityType.includes('City')) {
          placeKind = 'CITY'
        } else if (municipalityType.includes('Plantation')) {
          placeKind = 'UT' // Treat plantations as unorganized territories
        } else {
          placeKind = 'TOWN'
        }
        
        const county = countyMap.get(countyName)
        if (!county) {
          return null
        }
        
        return {
          name: municipalityName,
          kind: placeKind,
          state: 'ME',
          country: 'United States',
          description: `${municipalityName}, ${countyName} County, Maine`,
          userId: user.id,
          parentId: county.id,
          countyId: county.id,
          statePlaceId: maineState.id
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    
    const municipalityResult = await prisma.place.createMany({
      data: municipalityData_batch,
      skipDuplicates: true
    })
    
    console.log(`✅ Created ${municipalityResult.count} municipalities`)
    
    // Get created municipalities for mill rate creation
    const municipalities = await prisma.place.findMany({
      where: {
        userId: user.id,
        kind: { in: ['TOWN', 'UT', 'CITY'] }
      }
    })
    const municipalityMap = new Map(municipalities.map(m => [`${m.name}-${m.countyId}`, m]))
    
    // Create municipal mill rate histories in batch (OPTIMIZED!)
    console.log(`📊 Creating municipal mill rate histories (OPTIMIZED BATCH)...`)
    
    // Process in chunks to avoid memory issues
    const BATCH_SIZE = 1000
    let totalCreated = 0
    
    for (let i = 0; i < municipalMillRateData.length; i += BATCH_SIZE) {
      const batch = municipalMillRateData.slice(i, i + BATCH_SIZE)
      
      const batchData = batch
        .map(data => {
          // Try to find matching municipality
          const municipalityKey = `${data.municipality}-${data.county}`
          let municipality = municipalityMap.get(municipalityKey)
          
          // If not found, try without county (some municipalities might not have county in CSV)
          if (!municipality) {
            municipality = municipalities.find(m => 
              m.name.toLowerCase() === data.municipality.toLowerCase()
            )
          }
          
          return municipality ? {
            year: data.year,
            millRate: data.millRate,
            notes: data.percentageChange ? 
              `Percentage change: ${data.percentageChange}%` : 
              'Municipal mill rate data',
            placeId: municipality.id,
            userId: user.id
          } : null
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      
      if (batchData.length > 0) {
        const result = await prisma.millRateHistory.createMany({
          data: batchData,
          skipDuplicates: true
        })
        totalCreated += result.count
      }
      
      // Progress logging
      const progress = Math.min(i + BATCH_SIZE, municipalMillRateData.length)
      console.log(`📊 Processed ${progress}/${municipalMillRateData.length} municipal mill rate records...`)
    }
    
    console.log(`✅ Created ${totalCreated} municipal mill rate records`)
    
    // Final summary
    console.log('\n🎉 OPTIMIZED Maine data seeding finished!')
    console.log(`📊 Summary:`)
    console.log(`   🏛️  Counties created: ${createdCounties.count}`)
    console.log(`   📈 County mill rate records: ${countyMillRateResult.count}`)
    console.log(`   🏘️  Municipalities created: ${municipalityResult.count}`)
    console.log(`   📊 Municipal mill rate records: ${totalCreated}`)
    console.log(`   📅 County data years: 1990-2022`)
    console.log(`   📅 Municipal data years: 1991-2023`)
    
    // Verify the final structure
    const totalMillRates = await prisma.millRateHistory.count({
      where: { userId: user.id }
    })
    
    const municipalitiesWithRates = await prisma.place.count({
      where: {
        userId: user.id,
        kind: { in: ['TOWN', 'UT', 'CITY'] },
        millRateHistories: {
          some: {}
        }
      }
    })
    
    console.log(`\n📊 Final database state:`)
    console.log(`📈 Total mill rate records: ${totalMillRates}`)
    console.log(`🏘️ Municipalities with mill rate data: ${municipalitiesWithRates}`)
    
  } catch (error) {
    console.error('❌ Error seeding complete Maine data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedCompleteMaineDataOptimized()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
