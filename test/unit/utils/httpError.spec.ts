import { describe, expect, it } from 'vitest'
import { createHttpError, isNotFoundError, statusCodeOf, statusTextOf } from '@/utils/httpError'

describe('statusCodeOf', () => {
  it('reads the canonical `status` first', () => {
    // Nuxt 4 defines `status` as a getter over the deprecated `statusCode`.
    expect(statusCodeOf({ status: 404, statusCode: 500 })).toBe(404)
  })

  it('falls back to the `statusCode` ofetch rejects with', () => {
    expect(statusCodeOf(Object.assign(new Error('[GET] 404'), { statusCode: 404 }))).toBe(404)
  })

  it('falls back to the response status of an error without a code', () => {
    expect(statusCodeOf({ response: { status: 500 } })).toBe(500)
  })

  it('returns undefined when there is no status to read', () => {
    expect(statusCodeOf(new Error('Failed to fetch'))).toBeUndefined()
    expect(statusCodeOf(null)).toBeUndefined()
    expect(statusCodeOf('404')).toBeUndefined()
  })
})

describe('statusTextOf', () => {
  it('reads the canonical `statusText` first', () => {
    expect(
      statusTextOf({ statusText: 'Profissional não encontrado', statusMessage: 'legado' }),
    ).toBe('Profissional não encontrado')
  })

  it('falls back to the deprecated `statusMessage`', () => {
    expect(statusTextOf({ statusMessage: 'Não foi possível carregar' })).toBe(
      'Não foi possível carregar',
    )
  })

  it('ignores a blank copy and never leaks a raw `message`', () => {
    expect(statusTextOf({ statusText: '   ' })).toBeUndefined()
    expect(statusTextOf(new Error('Cannot read properties of null'))).toBeUndefined()
    expect(statusTextOf(null)).toBeUndefined()
  })
})

describe('isNotFoundError', () => {
  it('is true only for a real 404', () => {
    expect(isNotFoundError({ statusCode: 404 })).toBe(true)
    expect(isNotFoundError({ response: { status: 500 } })).toBe(false)
    expect(isNotFoundError(new Error('offline'))).toBe(false)
  })
})

describe('createHttpError', () => {
  it('carries status and copy on a plain Error, without a Nuxt runtime', () => {
    const error = createHttpError(404, 'Profissional não encontrado')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Profissional não encontrado')
    expect(statusCodeOf(error)).toBe(404)
    expect(statusTextOf(error)).toBe('Profissional não encontrado')
    expect(isNotFoundError(error)).toBe(true)
  })
})
