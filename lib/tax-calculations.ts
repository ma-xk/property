/**
 * Utility functions for tax calculations using historical data
 */

export interface MillRateHistory {
  year: number
  millRate: number
  notes?: string
}

export interface PropertyValuationHistory {
  year: number
  assessedValue?: number
  marketValue?: number
  assessmentDate?: string
  assessmentNotes?: string
}

export interface TaxCalculationResult {
  year: number
  millRate: number
  assessedValue?: number
  marketValue?: number
  assessedTax?: number
  marketTax?: number
  notes?: string
}

/**
 * Calculate taxes for a specific year using historical data
 */
export function calculateTaxForYear(
  year: number,
  millRateHistories: MillRateHistory[],
  valuationHistories: PropertyValuationHistory[]
): TaxCalculationResult | null {
  // Find mill rate for the year
  const millRateEntry = millRateHistories.find(entry => entry.year === year)
  if (!millRateEntry) {
    return null
  }

  // Find valuation for the year
  const valuationEntry = valuationHistories.find(entry => entry.year === year)
  if (!valuationEntry) {
    return null
  }

  const result: TaxCalculationResult = {
    year,
    millRate: millRateEntry.millRate,
    assessedValue: valuationEntry.assessedValue,
    marketValue: valuationEntry.marketValue,
    notes: millRateEntry.notes || valuationEntry.assessmentNotes
  }

  // Calculate taxes
  if (valuationEntry.assessedValue) {
    result.assessedTax = (valuationEntry.assessedValue * millRateEntry.millRate) / 1000
  }

  if (valuationEntry.marketValue) {
    result.marketTax = (valuationEntry.marketValue * millRateEntry.millRate) / 1000
  }

  return result
}

/**
 * Calculate taxes for all available years
 */
export function calculateTaxesForAllYears(
  millRateHistories: MillRateHistory[],
  valuationHistories: PropertyValuationHistory[]
): TaxCalculationResult[] {
  const results: TaxCalculationResult[] = []
  
  // Get all years that have both mill rate and valuation data
  const millRateYears = new Set(millRateHistories.map(entry => entry.year))
  const valuationYears = new Set(valuationHistories.map(entry => entry.year))
  
  const commonYears = Array.from(millRateYears).filter(year => valuationYears.has(year))
  
  for (const year of commonYears) {
    const result = calculateTaxForYear(year, millRateHistories, valuationHistories)
    if (result) {
      results.push(result)
    }
  }
  
  return results.sort((a, b) => b.year - a.year) // Sort by year descending
}

/**
 * Get the most recent tax calculation
 */
export function getCurrentTaxCalculation(
  millRateHistories: MillRateHistory[],
  valuationHistories: PropertyValuationHistory[]
): TaxCalculationResult | null {
  const allCalculations = calculateTaxesForAllYears(millRateHistories, valuationHistories)
  return allCalculations.length > 0 ? allCalculations[0] : null
}

/**
 * Calculate tax trend over time
 */
export function calculateTaxTrend(
  millRateHistories: MillRateHistory[],
  valuationHistories: PropertyValuationHistory[]
): {
  assessedTaxTrend?: { change: number; percentChange: number }
  marketTaxTrend?: { change: number; percentChange: number }
} {
  const calculations = calculateTaxesForAllYears(millRateHistories, valuationHistories)
  
  if (calculations.length < 2) {
    return {}
  }
  
  const result: {
    assessedTaxTrend?: { change: number; percentChange: number }
    marketTaxTrend?: { change: number; percentChange: number }
  } = {}
  
  // Calculate assessed tax trend
  const assessedCalculations = calculations.filter(c => c.assessedTax !== undefined)
  if (assessedCalculations.length >= 2) {
    const first = assessedCalculations[assessedCalculations.length - 1].assessedTax!
    const last = assessedCalculations[0].assessedTax!
    const change = last - first
    const percentChange = (change / first) * 100
    
    result.assessedTaxTrend = { change, percentChange }
  }
  
  // Calculate market tax trend
  const marketCalculations = calculations.filter(c => c.marketTax !== undefined)
  if (marketCalculations.length >= 2) {
    const first = marketCalculations[marketCalculations.length - 1].marketTax!
    const last = marketCalculations[0].marketTax!
    const change = last - first
    const percentChange = (change / first) * 100
    
    result.marketTaxTrend = { change, percentChange }
  }
  
  return result
}
