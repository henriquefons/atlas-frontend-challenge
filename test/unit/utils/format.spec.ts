import { describe, expect, it } from 'vitest'
import { formatBRL, formatDistance, formatRating } from '@/utils/format'

describe('formatBRL', () => {
  it('formats pt-BR currency with thousands separator and cents', () => {
    // Intl separates the symbol from the value with a non-breaking space.
    expect(formatBRL(1234.5)).toBe('R$\u00a01.234,50')
    expect(formatBRL(0)).toBe('R$\u00a00,00')
  })
})

describe('formatDistance', () => {
  it('uses at most one decimal and none for whole numbers', () => {
    expect(formatDistance(3.4)).toBe('3,4 km')
    expect(formatDistance(2)).toBe('2 km')
  })
})

describe('formatRating', () => {
  it('always shows exactly one decimal', () => {
    expect(formatRating(4)).toBe('4,0')
    expect(formatRating(4.7)).toBe('4,7')
  })
})
