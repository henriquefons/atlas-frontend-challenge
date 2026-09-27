import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProfessionalList from '@/components/professional/ProfessionalList.vue'
import type { Professional } from '@/types/professional'

/**
 * The children are Nuxt auto-imported components, which do not exist in the
 * Vitest runtime: lightweight stubs keep the test focused on the list's own
 * state machine (error > loading > empty > items).
 */
const stubs = {
  BaseButton: { template: '<button><slot /></button>' },
  ProfessionalCard: { template: '<article data-test="card" />' },
  ProfessionalCardSkeleton: { template: '<div data-test="skeleton" />' },
}

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

const mountList = (props: Record<string, unknown> = {}) =>
  mount(ProfessionalList, {
    props: { items: [], ...props },
    global: { stubs },
  })

describe('ProfessionalList', () => {
  it('shows the error message and emits retry', async () => {
    const wrapper = mountList({ error: 'Não foi possível carregar os profissionais.' })

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('Não foi possível carregar os profissionais.')
    expect(wrapper.findAll('[data-test="skeleton"]')).toHaveLength(0)

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('prioritizes the error over the loading state and the loaded items', () => {
    const wrapper = mountList({
      items: [professional('p1')],
      loading: true,
      error: 'Falhou',
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)
    // Stale items never survive alongside an error.
    expect(wrapper.findAll('[data-test="card"]')).toHaveLength(0)
  })

  it('renders the skeletons while the first page loads', () => {
    const wrapper = mountList({ loading: true, skeletonCount: 3 })

    const grid = wrapper.get('[aria-busy="true"]')
    expect(grid.attributes('aria-label')).toBe('Carregando profissionais')
    expect(grid.findAll('[data-test="skeleton"]')).toHaveLength(3)
    expect(grid.findAll('[data-test="card"]')).toHaveLength(0)
  })

  it('shows the empty state when there is no result and no request in flight', () => {
    const wrapper = mountList()

    expect(wrapper.text()).toContain('Nenhum profissional encontrado')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="skeleton"]')).toHaveLength(0)
  })

  it('renders the cards and appends the extra skeletons while loading more', () => {
    const wrapper = mountList({
      items: [professional('p1'), professional('p2')],
      loadingMore: true,
    })

    expect(wrapper.findAll('[data-test="card"]')).toHaveLength(2)
    // The already loaded cards stay on screen instead of being swapped out.
    expect(wrapper.findAll('[data-test="skeleton"]')).toHaveLength(4)
  })
})
