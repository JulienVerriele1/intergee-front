import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterSelect from '@/components/ui/FilterSelect.vue'

const OPTIONS = [
  { value: 'GROCERIES', label: 'Aide aux courses' },
  { value: 'GARDENING', label: 'Jardinage' },
]

function mountFilter(modelValue = '') {
  return mount(FilterSelect, {
    props: {
      id: 'category-filter',
      label: 'Catégorie',
      options: OPTIONS,
      allLabel: 'Toutes',
      modelValue,
      'onUpdate:modelValue': () => {},
    },
  })
}

describe('FilterSelect', () => {
  it('labels the list and offers no filter first', () => {
    const wrapper = mountFilter()

    expect(wrapper.get('label').attributes('for')).toBe('category-filter')
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual(['Toutes', 'Aide aux courses', 'Jardinage'])
    expect(wrapper.get('select').element.value).toBe('')
  })

  it('emits the chosen value', async () => {
    const wrapper = mountFilter()

    await wrapper.get('select').setValue('GARDENING')

    expect(wrapper.emitted('update:modelValue')).toEqual([['GARDENING']])
  })

  it('stands out while a filter applies', () => {
    expect(mountFilter('GROCERIES').get('select').classes()).toContain('border-primary')
    expect(mountFilter().get('select').classes()).toContain('border-border')
  })
})
