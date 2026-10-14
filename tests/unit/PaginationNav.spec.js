import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationNav from '@/components/ui/PaginationNav.vue'
import { pageWindow } from '@/utils/pagination'

function mountNav(page, totalPages) {
  return mount(PaginationNav, { props: { page, totalPages, label: 'Pagination des missions' } })
}

function buttonNamed(wrapper, name) {
  return wrapper.findAll('button').find((button) => (button.attributes('aria-label') ?? button.text()) === name)
}

describe('pageWindow', () => {
  it('shows every page when there are few', () => {
    expect(pageWindow(0, 1)).toEqual([0])
    expect(pageWindow(1, 4)).toEqual([0, 1, 2, 3])
  })

  it('keeps the first, the last, the current page and its neighbours, with gaps between', () => {
    expect(pageWindow(5, 12)).toEqual([0, 'gap', 4, 5, 6, 'gap', 11])
    expect(pageWindow(0, 12)).toEqual([0, 1, 'gap', 11])
    expect(pageWindow(11, 12)).toEqual([0, 'gap', 10, 11])
  })

  it('shows a single left-out page rather than a gap', () => {
    expect(pageWindow(3, 7)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('PaginationNav', () => {
  it('is not shown for a single page', () => {
    expect(mountNav(0, 1).find('nav').exists()).toBe(false)
  })

  it('names the navigation and marks the current page', () => {
    const wrapper = mountNav(1, 3)

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Pagination des missions')
    expect(wrapper.get('[aria-current="page"]').attributes('aria-label')).toBe('Page 2')
    expect(wrapper.text()).toContain('Page 2 sur 3')
  })

  it('goes to the previous, the next or a chosen page', async () => {
    const wrapper = mountNav(1, 3)

    await buttonNamed(wrapper, 'Précédente').trigger('click')
    await buttonNamed(wrapper, 'Suivante').trigger('click')
    await buttonNamed(wrapper, 'Page 3').trigger('click')

    expect(wrapper.emitted('go')).toEqual([[0], [2], [2]])
  })

  it('does not reload the current page', async () => {
    const wrapper = mountNav(1, 3)

    await buttonNamed(wrapper, 'Page 2').trigger('click')

    expect(wrapper.emitted('go')).toBeUndefined()
  })

  it('disables the steps beyond the first and the last page', () => {
    expect(buttonNamed(mountNav(0, 3), 'Précédente').attributes('disabled')).toBeDefined()
    expect(buttonNamed(mountNav(2, 3), 'Suivante').attributes('disabled')).toBeDefined()
  })
})
