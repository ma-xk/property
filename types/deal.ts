export interface Person {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Place {
  id: string
  name: string
  kind: "STATE" | "COUNTY" | "TOWN" | "UT" | "CITY"
  state?: string
  country: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  name?: string
  description?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  acres?: number
  zoning?: string
  createdAt: string
  updatedAt: string
}

export type DealStage = "LEAD" | "UNDER_CONTRACT" | "DUE_DILIGENCE" | "CLOSING" | "WON" | "LOST"
export type DealStatus = "ACTIVE" | "ON_HOLD" | "CANCELLED"

export interface Deal {
  id: string
  name: string
  description?: string
  dealStage: DealStage
  dealStatus: DealStatus
  targetClosingDate?: string
  dealNotes?: string
  
  // Property information
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  acres?: number
  zoning?: string
  
  // Deal financials
  askingPrice?: number
  offerPrice?: number
  earnestMoney?: number
  estimatedClosingCosts?: number
  
  // Purchase transaction details
  purchasePrice?: number
  closingDate?: string
  
  // Financing details
  financingTerms?: string
  financingType?: string
  
  // Closing costs
  titleSettlementFee?: number
  titleExamination?: number
  ownersPolicyPremium?: number
  recordingFeesDeed?: number
  stateTaxStamps?: number
  eRecordingFee?: number
  realEstateCommission?: number
  
  // Relationships
  seller?: Person
  sellerAgent?: Person
  buyerAgent?: Person
  titleCompany?: Person
  place?: Place
  promotedProperty?: Property
  
  // Promotion tracking
  promotedToPropertyId?: string
  promotedAt?: string
  
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDealData {
  // Basic deal info
  name: string
  description?: string
  dealStage?: DealStage
  dealStatus?: DealStatus
  targetClosingDate?: string
  dealNotes?: string
  
  // Address fields
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  
  // Place hierarchy fields
  county?: string
  placeType?: "TOWN" | "UT" | "CITY"
  
  // Property information
  acres?: number
  zoning?: string
  
  // Deal financials
  askingPrice?: number
  offerPrice?: number
  earnestMoney?: number
  estimatedClosingCosts?: number
  
  // Purchase transaction details
  purchasePrice?: number
  closingDate?: string
  
  // Financing details
  financingTerms?: string
  financingType?: string
  
  // Closing costs
  titleSettlementFee?: number
  titleExamination?: number
  ownersPolicyPremium?: number
  recordingFeesDeed?: number
  stateTaxStamps?: number
  eRecordingFee?: number
  realEstateCommission?: number
  
  // People/Companies
  seller?: string
  sellerAgent?: string
  buyerAgent?: string
  titleCompany?: string
}

export interface UpdateDealData extends Partial<CreateDealData> {}

// Deal stage configuration for UI
export const DEAL_STAGES: Record<DealStage, { label: string; color: string; description: string }> = {
  LEAD: {
    label: "Lead",
    color: "bg-gray-100 text-gray-800",
    description: "Initial contact or interest"
  },
  UNDER_CONTRACT: {
    label: "Under Contract",
    color: "bg-blue-100 text-blue-800",
    description: "Offer accepted, contract signed"
  },
  DUE_DILIGENCE: {
    label: "Due Diligence",
    color: "bg-yellow-100 text-yellow-800",
    description: "Investigating property and terms"
  },
  CLOSING: {
    label: "Closing",
    color: "bg-purple-100 text-purple-800",
    description: "Finalizing transaction"
  },
  WON: {
    label: "Won",
    color: "bg-green-100 text-green-800",
    description: "Deal completed successfully"
  },
  LOST: {
    label: "Lost",
    color: "bg-red-100 text-red-800",
    description: "Deal did not close"
  }
}

export const DEAL_STATUSES: Record<DealStatus, { label: string; color: string; description: string }> = {
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    description: "Deal is actively being pursued"
  },
  ON_HOLD: {
    label: "On Hold",
    color: "bg-yellow-100 text-yellow-800",
    description: "Deal is temporarily paused"
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    description: "Deal has been cancelled"
  }
}
