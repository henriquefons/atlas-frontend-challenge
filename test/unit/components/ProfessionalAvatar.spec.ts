import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ProfessionalAvatar from '@/components/professional/ProfessionalAvatar.vue'
import { getAvatarColor } from '@/utils/avatar'

Object.defineProperty(HTMLImageElement.prototype, 'complete', {
  configurable: true,
  get: () => false,
})

describe('ProfessionalAvatar', () => {
  it('renders the initials when there is no photo', () => {
    const wrapper = mount(ProfessionalAvatar, { props: { name: 'Ana Souza' } })

    expect(wrapper.find('img').exists()).toBe(false)

    const badge = wrapper.get('span')
    expect(badge.text()).toBe('AS')
    expect(badge.classes()).toContain(getAvatarColor('Ana Souza'))
    expect(badge.classes()).toEqual(expect.arrayContaining(['h-12', 'w-12']))
    // Decorative: the name is already announced by the card heading.
    expect(badge.attributes('aria-hidden')).toBe('true')
  })

  it('treats a blank src as no photo', () => {
    const wrapper = mount(ProfessionalAvatar, { props: { name: 'Ana Souza', src: '' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('span').text()).toBe('AS')
  })

  it('renders the photo with the name as alt text when a src is given', () => {
    const wrapper = mount(ProfessionalAvatar, {
      props: { name: 'Ana Souza', src: 'https://example.com/ana.jpg' },
    })

    expect(wrapper.find('span').exists()).toBe(false)

    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('https://example.com/ana.jpg')
    expect(img.attributes('alt')).toBe('Ana Souza')
  })

  it('maps the size prop to the matching classes', () => {
    const wrapper = mount(ProfessionalAvatar, { props: { name: 'Ana', size: 'lg' } })

    expect(wrapper.get('span').classes()).toEqual(expect.arrayContaining(['h-20', 'w-20']))
  })

  it('falls back to a placeholder for an empty name', () => {
    const wrapper = mount(ProfessionalAvatar, { props: { name: '  ' } })

    expect(wrapper.get('span').text()).toBe('?')
  })

  it('falls back to the initials when the photo fails to load', async () => {
    const wrapper = mount(ProfessionalAvatar, {
      props: { name: 'Ana Souza', src: 'https://example.com/quebrada.jpg' },
    })

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('span').text()).toBe('AS')
  })

  it('falls back when the photo already failed before hydration', async () => {
    // Above-the-fold photos are eager, so their `error` can fire while Vue is
    // still hydrating and the listener misses it; onMounted reads the DOM back.
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    const naturalWidth = vi
      .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
      .mockReturnValue(0)

    try {
      const wrapper = mount(ProfessionalAvatar, {
        props: { name: 'Ana Souza', src: 'https://example.com/quebrada.jpg' },
      })

      // `onMounted` flips `failed`, but the DOM updates on the next tick.
      await nextTick()

      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.get('span').text()).toBe('AS')
    } finally {
      complete.mockRestore()
      naturalWidth.mockRestore()
    }
  })

  it('gives a new src a new chance after a failure', async () => {
    const wrapper = mount(ProfessionalAvatar, {
      props: { name: 'Ana Souza', src: 'https://example.com/quebrada.jpg' },
    })

    await wrapper.get('img').trigger('error')
    await wrapper.setProps({ src: 'https://example.com/ana.jpg' })

    expect(wrapper.get('img').attributes('src')).toBe('https://example.com/ana.jpg')
  })
})
