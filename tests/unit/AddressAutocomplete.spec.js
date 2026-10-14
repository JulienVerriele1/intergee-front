import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete.vue'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'
import * as geocodingApi from '@/api/geocodingApi'

vi.mock('@/api/geocodingApi')

const LENS = { label: '12 Rue de Lens 59000 Lille', street: '12 Rue de Lens', postalCode: '59000', city: 'Lille', latitude: 50.625, longitude: 3.063 }
const ROUBAIX = { label: '12 Rue de Lens 59100 Roubaix', street: '12 Rue de Lens', postalCode: '59100', city: 'Roubaix', latitude: 50.69, longitude: 3.155 }

describe('AddressAutocomplete', () => {
  let suggest

  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetAllMocks()
    suggest = geocodingApi.suggestAddresses
    suggest.mockResolvedValue([LENS, ROUBAIX])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountField() {
    return mount(AddressAutocomplete, {
      props: { id: 'street', modelValue: '', 'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }) },
      attachTo: document.body,
    })
  }

  let wrapper

  async function type(text) {
    await wrapper.get('#street').setValue(text)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }

  afterEach(() => wrapper?.unmount())

  it('proposes addresses once 3 characters are typed', async () => {
    wrapper = mountField()

    await type('12')
    expect(suggest).not.toHaveBeenCalled()
    await type('12 rue de lens')

    expect(suggest).toHaveBeenCalledTimes(1)
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual([LENS.label, ROUBAIX.label])
    expect(wrapper.text()).toContain('2 adresses proposées')
  })

  it('waits for the typing to pause before searching', async () => {
    wrapper = mountField()

    await wrapper.get('input').setValue('12 r')
    await wrapper.get('input').setValue('12 ru')
    await wrapper.get('input').setValue('12 rue')
    await vi.advanceTimersByTimeAsync(300)

    expect(suggest).toHaveBeenCalledTimes(1)
    expect(suggest).toHaveBeenCalledWith('12 rue')
  })

  it('chooses an address with the keyboard', async () => {
    wrapper = mountField()
    await type('12 rue de lens')
    const input = wrapper.get('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe('street-option-1')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')[0][0]).toEqual(ROUBAIX)
    expect(wrapper.props('modelValue')).toBe('12 Rue de Lens')
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('chooses an address with the mouse', async () => {
    wrapper = mountField()
    await type('12 rue de lens')

    await wrapper.findAll('[role="option"]')[0].trigger('mousedown')

    expect(wrapper.emitted('select')[0][0]).toEqual(LENS)
  })

  it('closes the list on Escape', async () => {
    wrapper = mountField()
    await type('12 rue de lens')

    await wrapper.get('input').trigger('keydown', { key: 'Escape' })

    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false')
  })

  it('ignores the answer to an older request', async () => {
    let answerFirst
    suggest.mockImplementationOnce(() => new Promise((resolve) => { answerFirst = resolve }))
    suggest.mockResolvedValueOnce([ROUBAIX])
    wrapper = mountField()

    await type('12 rue de le')
    await type('12 rue de lens roubaix')
    answerFirst([LENS])
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual([ROUBAIX.label])
  })

  it('lets the address be typed by hand when the service is unavailable', async () => {
    suggest.mockRejectedValue(new Error('Network Error'))
    wrapper = mountField()

    await type('12 rue de lens')

    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false')
    expect(wrapper.props('modelValue')).toBe('12 rue de lens')
  })

  it('locates the mission from the chosen address, without any button to verify it', async () => {
    wrapper = mount(MissionPublishForm, { attachTo: document.body })
    expect(wrapper.text()).not.toContain('Vérifier l’adresse')

    await type('12 rue de lens')
    await wrapper.findAll('[role="option"]')[0].trigger('mousedown')
    await flushPromises()

    expect(wrapper.get('#postalCode').element.value).toBe('59000')
    expect(wrapper.get('#city').element.value).toBe('Lille')
    expect(wrapper.text()).toContain('Adresse reconnue : 12 Rue de Lens 59000 Lille')
  })
})
