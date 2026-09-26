import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProfessionalAvatar from '@/components/professional/ProfessionalAvatar.vue'
import { getAvatarColor } from '@/utils/avatar'

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
})
