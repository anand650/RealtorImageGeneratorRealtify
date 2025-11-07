import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateTokenUsage(roomType: string, style: string): number {
  // Base token usage
  const baseTokens = 1
  
  // Additional tokens for complex styles
  const styleMultipliers: Record<string, number> = {
    'luxury': 1.5,
    'modern': 1,
    'traditional': 1,
    'minimalist': 0.8,
    'rustic': 1.2,
  }
  
  const multiplier = styleMultipliers[style] || 1
  return Math.ceil(baseTokens * multiplier)
}

export function getRoomTypeDisplayName(roomType: string): string {
  const displayNames: Record<string, string> = {
    'living_room': 'Living Room',
    'kitchen': 'Kitchen',
    'bedroom': 'Bedroom',
    'bathroom': 'Bathroom',
    'dining_room': 'Dining Room',
    'office': 'Office',
    'outdoor': 'Outdoor Space',
  }
  
  if (displayNames[roomType]) {
    return displayNames[roomType]
  }
  
  // Replace all underscores with spaces and capitalize each word
  return roomType
    .replace(/_/g, ' ')  // Replace all underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase())  // Capitalize first letter of each word
}

export function getStyleDisplayName(style: string): string {
  const displayNames: Record<string, string> = {
    'modern': 'Modern',
    'traditional': 'Traditional',
    'minimalist': 'Minimalist',
    'luxury': 'Luxury',
    'rustic': 'Rustic',
    'industrial': 'Industrial',
    'scandinavian': 'Scandinavian',
  }
  
  return displayNames[style] || style.charAt(0).toUpperCase() + style.slice(1)
}



