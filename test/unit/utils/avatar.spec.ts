import { describe, expect, it } from 'vitest'
import { getAvatarColor, getInitials } from '@/utils/avatar'

describe('getInitials', () => {
  it('uses the first and last words, or the first word when there is only one', () => {
    expect(getInitials('Ana Souza')).toBe('AS')
    expect(getInitials('  ana júlia xavier ')).toBe('AX')
    expect(getInitials('Ana')).toBe('AN')
  })

  it('falls back to a placeholder for an empty name', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})

describe('getAvatarColor', () => {
  it('is deterministic for the same name', () => {
    expect(getAvatarColor('Ana Souza')).toBe(getAvatarColor('Ana Souza'))
  })
})
