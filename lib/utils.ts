import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format property addresses consistently
export function formatPropertyAddress(property: {
  streetAddress?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}): string {
  const parts = [
    property.streetAddress,
    property.city,
    property.state,
    property.zipCode
  ].filter(Boolean)
  
  return parts.join(', ')
}
