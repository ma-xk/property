import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Maine counties list
const MAINE_COUNTIES = [
  "Aroostook", "Franklin", "Hancock", "Kennebec", "Knox", "Lincoln", 
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

async function seedCompleteMaineData() {
  try {
    console.log('🏛️ Starting comprehensive Maine data seeding...')
    
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
    
    // Create all Maine counties
    console.log(`🏛️  Creating ${MAINE_COUNTIES.length} Maine counties...`)
    const createdCounties = new Map<string, any>()
    
    for (const countyName of MAINE_COUNTIES) {
      const county = await prisma.place.create({
        data: {
          name: countyName,
          kind: 'COUNTY',
          state: 'ME',
          country: 'United States',
          description: `${countyName} County, Maine`,
          userId: user.id,
          parentId: maineState.id,
          statePlaceId: maineState.id
        }
      })
      createdCounties.set(countyName, county)
      console.log(`✅ Created county: ${countyName}`)
    }
    
    // Create county mill rate histories
    console.log(`📊 Creating county mill rate histories...`)
    let countyMillRateCount = 0
    
    for (const data of countyMillRateData) {
      const county = createdCounties.get(data.county)
      if (county) {
        await prisma.millRateHistory.create({
          data: {
            year: data.year,
            millRate: data.millRate,
            notes: `${data.county} County mill rate for ${data.year}`,
            placeId: county.id,
            userId: user.id
          }
        })
        countyMillRateCount++
      }
    }
    
    console.log(`✅ Created ${countyMillRateCount} county mill rate records`)
    
    // Create municipalities
    console.log(`🏘️ Creating ${municipalityData.length} municipalities...`)
    const createdMunicipalities = new Map<string, any>()
    let createdMunicipalityCount = 0
    let skippedMunicipalityCount = 0
    
    for (const record of municipalityData) {
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
      
      const county = createdCounties.get(countyName)
      if (!county) {
        console.log(`⚠️  County not found for ${municipalityName}: ${countyName}`)
        continue
      }
      
      const municipality = await prisma.place.create({
        data: {
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
      
      createdMunicipalities.set(`${municipalityName}-${countyName}`, municipality)
      createdMunicipalityCount++
      
      if (createdMunicipalityCount % 50 === 0) {
        console.log(`📝 Created ${createdMunicipalityCount} municipalities...`)
      }
    }
    
    console.log(`✅ Created ${createdMunicipalityCount} municipalities`)
    
    // Create municipal mill rate histories
    console.log(`📊 Creating municipal mill rate histories...`)
    let municipalMillRateCount = 0
    let skippedMillRateCount = 0
    
    for (const data of municipalMillRateData) {
      // Try to find matching municipality
      const municipalityKey = `${data.municipality}-${data.county}`
      let municipality = createdMunicipalities.get(municipalityKey)
      
      // If not found, try without county (some municipalities might not have county in CSV)
      if (!municipality) {
        municipality = Array.from(createdMunicipalities.values()).find(m => 
          m.name.toLowerCase() === data.municipality.toLowerCase()
        )
      }
      
      if (municipality) {
        // Check if mill rate already exists for this municipality and year
        const existingRate = await prisma.millRateHistory.findFirst({
          where: {
            placeId: municipality.id,
            year: data.year,
            userId: user.id
          }
        })
        
        if (!existingRate) {
          await prisma.millRateHistory.create({
            data: {
              year: data.year,
              millRate: data.millRate,
              notes: data.percentageChange ? 
                `Percentage change: ${data.percentageChange}%` : 
                'Municipal mill rate data',
              placeId: municipality.id,
              userId: user.id
            }
          })
          municipalMillRateCount++
        } else {
          skippedMillRateCount++
        }
      }
    }
    
    console.log(`✅ Created ${municipalMillRateCount} municipal mill rate records`)
    console.log(`⏭️  Skipped ${skippedMillRateCount} existing records`)
    
    // Final summary
    console.log('\n🎉 Complete Maine data seeding finished!')
    console.log(`📊 Summary:`)
    console.log(`   🏛️  Counties created: ${MAINE_COUNTIES.length}`)
    console.log(`   📈 County mill rate records: ${countyMillRateCount}`)
    console.log(`   🏘️  Municipalities created: ${createdMunicipalityCount}`)
    console.log(`   📊 Municipal mill rate records: ${municipalMillRateCount}`)
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

seedCompleteMaineData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
