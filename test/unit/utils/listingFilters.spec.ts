import { describe, expect, it } from 'vitest'
import type { LocationQuery } from 'vue-router'
import {
  filterKey,
  listingFiltersOf,
  parseListingFilters,
  queryMatchesFilters,
  serializeListingFilters,
  type ListingFilters,
} from '@/utils/listingFilters'

const DEFAULTS: ListingFilters = { search: '', category: null, sort: 'rating' }

describe('listingFilters normalization', () => {
  it('trims the search once and does not mutate the source', () => {
    const source: ListingFilters = { search: '  ana  ', category: null, sort: 'rating' }

    expect(listingFiltersOf(source)).toEqual({ search: 'ana', category: null, sort: 'rating' })
    expect(source.search).toBe('  ana  ')
  })

  it('trims the search from the URL, so a padded query is the same filter', () => {
    expect(parseListingFilters({ search: '  ana  ' }).search).toBe('ana')
    expect(queryMatchesFilters({ search: 'ana ' }, { ...DEFAULTS, search: 'ana' })).toBe(true)
  })
})

describe('listingFilters fallbacks', () => {
  it('falls back to the defaults for an out-of-domain category or sort', () => {
    expect(parseListingFilters({ category: 'Inexistente', sort: 'foo' })).toEqual(DEFAULTS)
  })

  it('falls back to the defaults for absent, empty or repeated params', () => {
    expect(parseListingFilters({})).toEqual(DEFAULTS)
    expect(parseListingFilters({ search: ['a', 'b'], category: '', sort: '123' })).toEqual(DEFAULTS)
  })
})

describe('listingFilters serialization', () => {
  it('omits every default value, leaving no empty keys', () => {
    expect(serializeListingFilters(DEFAULTS)).toEqual({})
  })

  it('keeps only what differs from the defaults', () => {
    expect(serializeListingFilters({ ...DEFAULTS, category: 'Tecnologia' })).toEqual({
      category: 'Tecnologia',
    })
    expect(serializeListingFilters({ ...DEFAULTS, sort: 'price_desc' })).toEqual({
      sort: 'price_desc',
    })
    expect(
      serializeListingFilters({ search: 'ana', category: 'Tecnologia', sort: 'price_asc' }),
    ).toEqual({ search: 'ana', category: 'Tecnologia', sort: 'price_asc' })
  })

  it('round-trips URL and filters keeping the normalized value', () => {
    const cases: ListingFilters[] = [
      DEFAULTS,
      { search: 'ana', category: null, sort: 'rating' },
      { search: '', category: 'Tecnologia', sort: 'price_asc' },
      { search: 'ana souza', category: 'Educação', sort: 'distance' },
    ]

    for (const filters of cases) {
      const query = serializeListingFilters(filters) as LocationQuery
      expect(parseListingFilters(query)).toEqual(listingFiltersOf(filters))
    }
  })
})

describe('listingFilters matching', () => {
  it('matches a query that already expresses the filters', () => {
    expect(queryMatchesFilters({}, DEFAULTS)).toBe(true)
    expect(
      queryMatchesFilters({ category: 'Tecnologia' }, { ...DEFAULTS, category: 'Tecnologia' }),
    ).toBe(true)
  })

  it('reports a mismatch when the query carries leftovers', () => {
    expect(queryMatchesFilters({ search: '' }, DEFAULTS)).toBe(false)
    expect(queryMatchesFilters({ foo: '1' }, DEFAULTS)).toBe(false)
  })

  it('gives different fetch identities to different filters', () => {
    expect(filterKey({ ...DEFAULTS, search: 'ana' })).not.toBe(filterKey(DEFAULTS))
  })
})
