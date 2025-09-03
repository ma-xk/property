"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Receipt,
  MapPin,
  Globe,
  Phone,
  Calendar,
  Clock,
  Percent,
  FileText,
  ExternalLink,
  Building2
} from "lucide-react"

interface Place {
  id: string
  name: string
  state?: string
  country: string
  taxPaymentAddress?: string
  taxPaymentWebsite?: string
  taxOfficePhone?: string
  taxDueMonth?: number
  taxDueDay?: number
  lateInterestRate?: number
  assessmentMonth?: number
  assessmentDay?: number
  taxNotes?: string
}

interface PropertyTaxInfoProps {
  place?: Place | null
  propertyName?: string
}

export function PropertyTaxInfo({ place, propertyName }: PropertyTaxInfoProps) {
  const formatTaxDate = (month?: number, day?: number) => {
    if (!month) return null
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return `${monthNames[month - 1]} ${day || 1}`
  }

  const formatPercentage = (rate?: number) => {
    if (!rate) return null
    return `${rate}%`
  }

  if (!place) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Municipal Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No location assigned</h3>
            <p className="text-muted-foreground text-sm">
              {propertyName ? `${propertyName} is` : "This property is"} not associated with a place. 
              Assign a place to view municipal tax information.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasTaxInfo = place.taxPaymentAddress || 
                     place.taxPaymentWebsite || 
                     place.taxOfficePhone || 
                     place.taxDueMonth || 
                     place.assessmentMonth || 
                     place.lateInterestRate || 
                     place.taxNotes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Municipal Tax Information
          <span className="text-sm font-normal text-muted-foreground">
            • {place.name}{place.state && `, ${place.state}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasTaxInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Payment Information */}
            {(place.taxPaymentAddress || place.taxPaymentWebsite || place.taxOfficePhone) && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Payment Details</h4>
                
                <div className="space-y-3">
                  {place.taxPaymentAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Payment Address</div>
                        <div className="text-sm text-muted-foreground break-words">
                          {place.taxPaymentAddress}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.taxPaymentWebsite && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Payment Website</div>
                        <div className="text-sm text-muted-foreground">
                          <a 
                            href={place.taxPaymentWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 break-all"
                          >
                            {place.taxPaymentWebsite.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {place.taxOfficePhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Office Phone</div>
                        <div className="text-sm text-muted-foreground">
                          <a href={`tel:${place.taxOfficePhone}`} className="text-blue-600 hover:text-blue-800">
                            {place.taxOfficePhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Important Dates */}
            {(place.taxDueMonth || place.assessmentMonth || place.lateInterestRate) && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Important Dates</h4>
                
                <div className="space-y-3">
                  {place.taxDueMonth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Tax Due Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTaxDate(place.taxDueMonth, place.taxDueDay)}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.assessmentMonth && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Assessment Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTaxDate(place.assessmentMonth, place.assessmentDay)}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.lateInterestRate && (
                    <div className="flex items-center gap-3">
                      <Percent className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">Late Interest Rate</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(Number(place.lateInterestRate))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {place.taxNotes && (
              <div className="space-y-4 md:col-span-2 lg:col-span-1">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Additional Notes</h4>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Tax Notes</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {place.taxNotes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No tax information available</h3>
            <p className="text-muted-foreground text-sm">
              Tax information for {place.name} has not been added yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
