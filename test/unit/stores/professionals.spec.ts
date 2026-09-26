import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProfessionals } from '@/services/professionals'
import { useProfessionalsStore } from '@/stores/professionals'
import type { Professional, ProfessionalsResponse } from '@/types/professional'

vi.mock('@/services/professionals')

const getProfessionalsMock = vi.mocked(getProfessionals)

const professional = (id: string): Professional => ({
  id,
  name: 'Ana Souza',
  profession: 'Pedreira',
  category: 'Construção e Reforma',
  avatarUrl: null,
  price: 100,
  rating: 4.5,
  distanceKm: 2,
  city: 'São Paulo',
  description: 'Descrição',
  services: ['Serviço'],
  availability: ['Segunda'],
})

const response = (items: Professional[], total: number): ProfessionalsResponse => ({
  items,
  total,
  page: 1,
  limit: 20,
  totalPages: Math.ceil(total / 20) || 1,
})

beforeEach(() => {
  setActivePinia(createPinia())
  getProfessionalsMock.mockReset()
})

describe('loadFirstPage', () => {
  it('does not refetch while the filters keep the same signature', async () => {
    getProfessionalsMock.mockResolvedValue(response([professional('p1')], 1))
    const store = useProfessionalsStore()

    await store.loadFirstPage()
    await store.loadFirstPage()

    expect(getProfessionalsMock).toHaveBeenCalledTimes(1)
    expect(store.items.map((item) => item.id)).toEqual(['p1'])
  })

  it('refetches when forced', async () => {
    getProfessionalsMock.mockResolvedValue(response([professional('p1')], 1))
    const store = useProfessionalsStore()

    await store.loadFirstPage()
    await store.loadFirstPage({ force: true })

    expect(getProfessionalsMock).toHaveBeenCalledTimes(2)
  })
})

describe('loadNextPage', () => {
  it('appends the next page and advances the page number', async () => {
    getProfessionalsMock
      .mockResolvedValueOnce(response([professional('p1'), professional('p2')], 3))
      .mockResolvedValueOnce(response([professional('p3')], 3))
    const store = useProfessionalsStore()

    await store.loadFirstPage()
    await store.loadNextPage()

    expect(store.items.map((item) => item.id)).toEqual(['p1', 'p2', 'p3'])
    expect(store.page).toBe(2)
  })

  it('requests nothing while another request is in flight', async () => {
    let resolveFirstPage!: (value: ProfessionalsResponse) => void
    getProfessionalsMock.mockImplementation(
      () =>
        new Promise<ProfessionalsResponse>((resolve) => {
          resolveFirstPage = resolve
        }),
    )
    const store = useProfessionalsStore()

    const pending = store.loadFirstPage()
    await store.loadNextPage()

    expect(getProfessionalsMock).toHaveBeenCalledTimes(1)

    resolveFirstPage(response([professional('p1')], 3))
    await pending
  })

  it('requests nothing when every item is already loaded', async () => {
    getProfessionalsMock.mockResolvedValue(response([professional('p1')], 1))
    const store = useProfessionalsStore()

    await store.loadFirstPage()
    await store.loadNextPage()

    expect(getProfessionalsMock).toHaveBeenCalledTimes(1)
  })

  it('rolls the page back and keeps the loaded items when it fails', async () => {
    getProfessionalsMock
      .mockResolvedValueOnce(response([professional('p1'), professional('p2')], 3))
      .mockRejectedValueOnce(new Error('offline'))
    const store = useProfessionalsStore()

    await store.loadFirstPage()
    await store.loadNextPage()

    expect(store.page).toBe(1)
    expect(store.items.map((item) => item.id)).toEqual(['p1', 'p2'])
    expect(store.errorNext).toBeTruthy()
    expect(store.loading).toBe('idle')
  })
})
