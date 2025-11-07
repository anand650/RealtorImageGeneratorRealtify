/**
 * Unit Tests for Utility Functions
 * 
 * These tests verify the core utility functions that are used throughout the application.
 * Each test validates a specific function's behavior with various inputs and edge cases.
 */

import { describe, it, expect } from '@jest/globals'
import {
  calculateTokenUsage,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateSlug,
  getRoomTypeDisplayName,
  getStyleDisplayName,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('calculateTokenUsage', () => {
    /**
     * Test: Calculate token usage for different room types and styles
     * 
     * This test verifies that token calculation works correctly for various
     * combinations of room types and styles. It ensures that:
     * - Base tokens are always 1
     * - Style multipliers are applied correctly
     * - Unknown styles default to multiplier of 1
     */
    it('should calculate base tokens as 1 for simple styles', () => {
      const tokens = calculateTokenUsage('living_room', 'modern')
      expect(tokens).toBe(1)
    })

    it('should apply style multipliers correctly', () => {
      // Luxury style has a 1.5 multiplier
      const luxuryTokens = calculateTokenUsage('bedroom', 'luxury')
      expect(luxuryTokens).toBe(2) // Math.ceil(1 * 1.5) = 2

      // Minimalist style has a 0.8 multiplier
      const minimalistTokens = calculateTokenUsage('kitchen', 'minimalist')
      expect(minimalistTokens).toBe(1) // Math.ceil(1 * 0.8) = 1

      // Rustic style has a 1.2 multiplier
      const rusticTokens = calculateTokenUsage('dining_room', 'rustic')
      expect(rusticTokens).toBe(2) // Math.ceil(1 * 1.2) = 2
    })

    it('should default to multiplier 1 for unknown styles', () => {
      const tokens = calculateTokenUsage('living_room', 'unknown-style')
      expect(tokens).toBe(1)
    })

    it('should handle empty strings', () => {
      const tokens = calculateTokenUsage('', '')
      expect(tokens).toBe(1)
    })
  })

  describe('formatCurrency', () => {
    /**
     * Test: Format currency amounts correctly
     * 
     * This test verifies that currency formatting works correctly:
     * - Amounts are divided by 100 (stored in cents)
     * - Proper currency symbols are displayed
     * - Different currencies are supported
     */
    it('should format USD currency correctly', () => {
      // Amount is in cents, so 2500 = $25.00
      const formatted = formatCurrency(2500)
      expect(formatted).toBe('$25.00')
    })

    it('should handle zero amount', () => {
      const formatted = formatCurrency(0)
      expect(formatted).toBe('$0.00')
    })

    it('should format large amounts correctly', () => {
      const formatted = formatCurrency(100000) // $1,000.00
      expect(formatted).toBe('$1,000.00')
    })

    it('should format with different currency', () => {
      const formatted = formatCurrency(2500, 'EUR')
      expect(formatted).toContain('25')
    })
  })

  describe('formatDate', () => {
    /**
     * Test: Format dates in readable format
     * 
     * This test verifies date formatting works with:
     * - Date objects
     * - Date strings
     * - Various date formats
     */
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('January')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2024')
    })

    it('should format date string correctly', () => {
      const formatted = formatDate('2024-01-15T10:30:00Z')
      expect(formatted).toContain('January')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2024')
    })
  })

  describe('formatDateTime', () => {
    /**
     * Test: Format date and time together
     * 
     * Verifies that both date and time are included in the formatted output.
     */
    it('should include both date and time', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toMatch(/\d{1,2}:\d{2}/) // Time format HH:MM or H:MM
    })
  })

  describe('generateSlug', () => {
    /**
     * Test: Generate URL-friendly slugs
     * 
     * Verifies that slugs are:
     * - Lowercase
     * - Special characters removed
     * - Spaces converted to hyphens
     * - Leading/trailing hyphens removed
     */
    it('should convert text to lowercase slug', () => {
      const slug = generateSlug('Living Room')
      expect(slug).toBe('living-room')
    })

    it('should remove special characters', () => {
      const slug = generateSlug('Kitchen & Dining')
      expect(slug).toBe('kitchen-dining')
    })

    it('should handle multiple spaces', () => {
      const slug = generateSlug('Master   Bedroom')
      expect(slug).toBe('master-bedroom')
    })

    it('should remove leading and trailing hyphens', () => {
      const slug = generateSlug('---Test---')
      expect(slug).toBe('test')
    })

    it('should handle empty string', () => {
      const slug = generateSlug('')
      expect(slug).toBe('')
    })
  })

  describe('getRoomTypeDisplayName', () => {
    /**
     * Test: Convert room type keys to display names
     * 
     * Verifies that room type identifiers are converted to user-friendly names.
     */
    it('should return correct display names for known room types', () => {
      expect(getRoomTypeDisplayName('living_room')).toBe('Living Room')
      expect(getRoomTypeDisplayName('kitchen')).toBe('Kitchen')
      expect(getRoomTypeDisplayName('bedroom')).toBe('Bedroom')
      expect(getRoomTypeDisplayName('bathroom')).toBe('Bathroom')
      expect(getRoomTypeDisplayName('dining_room')).toBe('Dining Room')
      expect(getRoomTypeDisplayName('office')).toBe('Office')
      expect(getRoomTypeDisplayName('outdoor')).toBe('Outdoor Space')
    })

    it('should format unknown room types', () => {
      const formatted = getRoomTypeDisplayName('custom_room_type')
      expect(formatted).toBe('Custom Room Type')
    })

    it('should handle empty string', () => {
      const formatted = getRoomTypeDisplayName('')
      expect(formatted).toBe('')
    })
  })

  describe('getStyleDisplayName', () => {
    /**
     * Test: Convert style keys to display names
     * 
     * Verifies that style identifiers are converted to user-friendly names.
     */
    it('should return correct display names for known styles', () => {
      expect(getStyleDisplayName('modern')).toBe('Modern')
      expect(getStyleDisplayName('traditional')).toBe('Traditional')
      expect(getStyleDisplayName('minimalist')).toBe('Minimalist')
      expect(getStyleDisplayName('luxury')).toBe('Luxury')
      expect(getStyleDisplayName('rustic')).toBe('Rustic')
      expect(getStyleDisplayName('industrial')).toBe('Industrial')
      expect(getStyleDisplayName('scandinavian')).toBe('Scandinavian')
    })

    it('should capitalize unknown styles', () => {
      const formatted = getStyleDisplayName('unknown-style')
      expect(formatted).toBe('Unknown-style')
    })

    it('should handle single character', () => {
      const formatted = getStyleDisplayName('a')
      expect(formatted).toBe('A')
    })
  })
})

