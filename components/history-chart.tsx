"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HistoryDataPoint {
  year: number
  value: number
  notes?: string
}

interface HistoryChartProps {
  title: string
  data: HistoryDataPoint[]
  valueLabel: string
  className?: string
}

export function HistoryChart({ title, data, valueLabel, className }: HistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No historical data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort data by year
  const sortedData = [...data].sort((a, b) => a.year - b.year)
  
  // Calculate trend
  const getTrend = () => {
    if (sortedData.length < 2) return null
    
    const first = sortedData[0].value
    const last = sortedData[sortedData.length - 1].value
    const change = last - first
    const percentChange = (change / first) * 100
    
    return {
      change,
      percentChange,
      isPositive: change > 0,
      isNegative: change < 0,
      isNeutral: change === 0
    }
  }

  const trend = getTrend()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          {title}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
              {trend.isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
              {trend.isNeutral && <Minus className="h-3 w-3 text-gray-500" />}
              <span className={trend.isPositive ? "text-green-500" : trend.isNegative ? "text-red-500" : "text-gray-500"}>
                {trend.percentChange > 0 ? "+" : ""}{trend.percentChange.toFixed(1)}%
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((point, index) => (
            <div key={point.year} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium w-12">{point.year}</div>
                <div className="text-sm text-muted-foreground">
                  {valueLabel}: {point.value.toLocaleString()}
                </div>
                {point.notes && (
                  <div className="text-xs text-muted-foreground">
                    {point.notes}
                  </div>
                )}
              </div>
              {index > 0 && (
                <div className="text-xs text-muted-foreground">
                  {point.value > sortedData[index - 1].value ? (
                    <span className="text-green-500">↗</span>
                  ) : point.value < sortedData[index - 1].value ? (
                    <span className="text-red-500">↘</span>
                  ) : (
                    <span className="text-gray-500">→</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {trend && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <strong>Overall trend:</strong> {trend.change > 0 ? "Increased" : trend.change < 0 ? "Decreased" : "No change"} by {Math.abs(trend.change).toLocaleString()} 
              ({trend.percentChange > 0 ? "+" : ""}{trend.percentChange.toFixed(1)}%) from {sortedData[0].year} to {sortedData[sortedData.length - 1].year}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
