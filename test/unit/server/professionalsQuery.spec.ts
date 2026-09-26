import { describe, expect, it } from 'vitest'
import professionals from '#data/professionals.json'
import type { Professional } from '@/types/professional'
import {
  matchesSearch,
  parseProfessionalsQuery,
  queryProfessionals,
} from '#server/utils/professionalsQuery'
import { normalizeText } from '#server/utils/normalizeText'

/** Full dataset (520 records): the real input of the API handler. */
const dataset = professionals as Professional[]

const professional = (overrides: Partial<Professional> = {}): Professional => ({
  id: 'p1',
  name: 'João da Silva',
  profession: 'Pedreiro',
  category: 'Construção e Reforma',
  avatarUrl: null,
  price: 100,
  rating: 4.5,
  distanceKm: 2,
  city: 'São Paulo',
  description: 'Descrição',
  services: ['Serviço'],
  availability: ['Segunda'],
  ...overrides,
})

describe('normalizeText', () => {
  it('removes case and diacritics', () => {
    expect(normalizeText('Técnico em Edificações')).toBe('tecnico em edificacoes')
    expect(normalizeText('AÇÃO Ç')).toBe('acao c')
    expect(normalizeText('João')).toBe('joao')
  })

  it('leaves already normalized text untouched', () => {
    expect(normalizeText('pedreiro')).toBe('pedreiro')
  })
})

describe('matchesSearch', () => {
  it('matches the profession regardless of case and accents', () => {
    const item = professional({ profession: 'Técnico em Edificações' })

    for (const term of ['tecnico', 'Técnico', 'TÉCNICO', '  edificações  ']) {
      expect(matchesSearch(item, term)).toBe(true)
    }
  })

  it('matches the name regardless of case and accents', () => {
    const item = professional({ name: 'João da Silva' })

    expect(matchesSearch(item, 'joao')).toBe(true)
    expect(matchesSearch(item, 'JOÃO')).toBe(true)
    expect(matchesSearch(item, 'ana')).toBe(false)
  })

  it('matches everything for a blank term', () => {
    expect(matchesSearch(professional(), '   ')).toBe(true)
  })
})

describe('parseProfessionalsQuery', () => {
  it('falls back to the defaults', () => {
    expect(parseProfessionalsQuery()).toEqual({
      search: '',
      category: undefined,
      sort: undefined,
      page: 1,
      limit: 20,
    })
  })

  it('trims the search and keeps a valid category and sort', () => {
    const query = parseProfessionalsQuery({ search: '  ana  ', category: 'Beleza', sort: 'rating' })

    expect(query.search).toBe('ana')
    expect(query.category).toBe('Beleza')
    expect(query.sort).toBe('rating')
  })

  it('drops an unknown sort instead of failing', () => {
    expect(parseProfessionalsQuery({ sort: 'drop table' }).sort).toBeUndefined()
  })

  it('clamps page and limit', () => {
    expect(parseProfessionalsQuery({ page: '-4' }).page).toBe(1)
    expect(parseProfessionalsQuery({ page: 'abc' }).page).toBe(1)
    expect(parseProfessionalsQuery({ page: '2.7' }).page).toBe(2)
    expect(parseProfessionalsQuery({ page: 0 }).page).toBe(1)
    expect(parseProfessionalsQuery({ limit: '9999' }).limit).toBe(100)
    expect(parseProfessionalsQuery({ limit: '-3' }).limit).toBe(1)
    expect(parseProfessionalsQuery({ limit: '0' }).limit).toBe(20)
    expect(parseProfessionalsQuery({ limit: '7' }).limit).toBe(7)
  })

  it('degrades safely on repeated params, staying inside the valid range', () => {
    // `?sort=a&sort=b` reaches the handler as an array (h3 behaviour).
    const query = parseProfessionalsQuery({ sort: ['rating', 'price_asc'], page: ['1', '2'] })

    expect(query.sort).toBeUndefined()
    expect(Number.isInteger(query.page)).toBe(true)
    expect(query.page).toBeGreaterThanOrEqual(1)
    expect(query.limit).toBeGreaterThanOrEqual(1)
    // A joined, bogus term narrows the result instead of widening it.
    expect(
      queryProfessionals(dataset, parseProfessionalsQuery({ search: ['ana', 'joao'] })).total,
    ).toBe(0)
  })
})

describe('queryProfessionals', () => {
  it('paginates and reports the totals', () => {
    const items = Array.from({ length: 25 }, (_, index) => professional({ id: `p${index + 1}` }))
    const response = queryProfessionals(items, parseProfessionalsQuery({ page: '2', limit: '10' }))

    expect(response.items.map((item) => item.id)).toEqual([
      'p11',
      'p12',
      'p13',
      'p14',
      'p15',
      'p16',
      'p17',
      'p18',
      'p19',
      'p20',
    ])
    expect(response).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 })
  })

  it('returns an empty page past the end and never zero total pages', () => {
    const items = [professional({ id: 'p1' })]

    expect(queryProfessionals(items, parseProfessionalsQuery({ page: '99999' })).items).toEqual([])
    expect(queryProfessionals([], parseProfessionalsQuery({})).totalPages).toBe(1)
  })

  it('does not mutate the dataset while sorting', () => {
    const items = [professional({ id: 'a', price: 300 }), professional({ id: 'b', price: 100 })]

    expect(
      queryProfessionals(items, parseProfessionalsQuery({ sort: 'price_asc' })).items[0]!.id,
    ).toBe('b')
    expect(items.map((item) => item.id)).toEqual(['a', 'b'])
  })
})

describe('search over the real dataset', () => {
  const search = (term: string) =>
    queryProfessionals(dataset, parseProfessionalsQuery({ search: term, limit: '100' }))

  it('returns the same results with and without accents', () => {
    const unaccented = search('tecnico')
    const accented = search('técnico')

    expect(unaccented.total).toBeGreaterThan(0)
    expect(unaccented.total).toBe(accented.total)
    expect(unaccented.items.map((item) => item.id)).toEqual(accented.items.map((item) => item.id))
  })

  it('is case-insensitive and ignores surrounding spaces', () => {
    expect(search('ALEXANDRE').total).toBe(search('alexandre').total)
    expect(search('  alexandre  ').total).toBe(search('alexandre').total)
  })

  it('finds names with diacritics typed without them', () => {
    expect(search('joao').total).toBe(search('joão').total)
  })

  it('combines the search with the category filter', () => {
    // The category comes from the dataset itself, so the test does not depend on
    // which category happens to hold the "técnico" records.
    const category = search('tecnico').items[0]!.category
    const response = queryProfessionals(
      dataset,
      parseProfessionalsQuery({ search: 'tecnico', category }),
    )

    expect(response.total).toBeGreaterThan(0)
    expect(response.items.every((item) => item.category === category)).toBe(true)
  })
})
