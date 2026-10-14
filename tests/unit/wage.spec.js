import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'
import PendingDeclarations from '@/components/tracking/PendingDeclarations.vue'
import * as wageApi from '@/api/wageApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/missionApi')
vi.mock('@/api/geocodingApi')
vi.mock('@/api/wageApi', async (importOriginal) => ({
  ...(await importOriginal()),
  estimateCost: vi.fn(),
  fetchPendingDeclarations: vi.fn(),
  markDeclared: vi.fn(),
  unmarkDeclared: vi.fn(),
}))

const ESTIMATE = {
  minimumHourlyNetWage: 10.45,
  netWage: 18,
  contributions: 12.48,
  totalCost: 30.48,
  taxCredit: 15.24,
  costAfterTaxCredit: 15.24,
  belowMinimum: false,
  simulatorUrl: 'https://www.cesu.urssaf.fr',
}

describe('wage of a mission', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(wageApi.estimateCost).mockResolvedValue(ESTIMATE)
  })

  afterEach(() => vi.useRealTimers())

  async function mountForm(props = {}) {
    const wrapper = mount(MissionPublishForm, { props, attachTo: document.body })
    await flushPromises()
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    return wrapper
  }

  it('starts at the minimum and shows what the mission will cost', async () => {
    const wrapper = await mountForm()

    expect(wrapper.get('#hourly-net-wage').element.value).toBe('10,45')
    expect(wrapper.text()).toContain('au moins 10,45')
    const estimate = wrapper.get('section[aria-labelledby="cost-estimate-title"]')
    expect(estimate.text()).toContain('Coût réel estimé')
    expect(estimate.text()).toContain('15,24')
    expect(estimate.get('a').attributes('href')).toBe('https://www.cesu.urssaf.fr')
    wrapper.unmount()
  })

  it('estimates again when the wage changes', async () => {
    const wrapper = await mountForm()

    await wrapper.get('#hourly-net-wage').setValue('12,50')
    await vi.advanceTimersByTimeAsync(300)

    expect(wageApi.estimateCost).toHaveBeenLastCalledWith({ hourlyNetWage: 12.5, durationMinutes: 60 })
    wrapper.unmount()
  })

  it('reminds to register to the CESU when asked to', async () => {
    const reminded = await mountForm({ showCesuReminder: true })
    expect(reminded.text()).toContain('Inscrivez-vous sur cesu.urssaf.fr')
    reminded.unmount()

    const registered = await mountForm()
    expect(registered.text()).not.toContain('Inscrivez-vous sur cesu.urssaf.fr')
    registered.unmount()
  })
})

describe('PendingDeclarations', () => {
  const DECLARATION = {
    employer: { id: 'jeanne', firstName: 'Jeanne', lastName: 'Dupont' },
    employee: { id: 'lea', firstName: 'Léa', lastName: 'Martin' },
    month: '2026-11',
    totalMinutes: 150,
    netWage: 30,
    missions: [
      { id: 'm1', title: 'Courses', scheduledAt: '2026-11-03T09:00:00Z', durationMinutes: 90, hourlyNetWage: 12, netWage: 18 },
      { id: 'm2', title: 'Jardinage', scheduledAt: '2026-11-20T09:00:00Z', durationMinutes: 60, hourlyNetWage: 12, netWage: 12 },
    ],
  }

  beforeEach(() => vi.resetAllMocks())

  function buttonNamed(wrapper, name) {
    return wrapper.findAll('button').find((button) => button.text() === name)
  }

  it('says when nothing is to declare, and tells how many declarations are left', async () => {
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([])

    const wrapper = mount(PendingDeclarations)
    await flushPromises()

    expect(wrapper.text()).toContain('Rien à déclarer pour le moment')
    expect(wrapper.emitted('count')).toEqual([[0]])
  })

  it('shows what to copy into the CESU, by student and by month', async () => {
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([DECLARATION])

    const wrapper = mount(PendingDeclarations)
    await flushPromises()

    const card = wrapper.get('article')
    expect(card.get('h3').text()).toBe('Léa Martin · novembre 2026')
    expect(card.text()).toContain('2 h 30')
    expect(card.text()).toContain('30,00')
    expect(card.text()).toContain('2 missions')
    expect(card.get('a').attributes('href')).toBe('https://www.cesu.urssaf.fr')
    expect(card.text()).not.toContain('Employeur')
  })

  it('names the employer for a caregiver', async () => {
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([DECLARATION])

    const wrapper = mount(PendingDeclarations, { props: { isCaregiver: true } })
    await flushPromises()

    expect(wrapper.text()).toContain('Jeanne Dupont')
  })

  it('marks a declaration as made, and undoes a wrong click', async () => {
    // Given
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValueOnce([DECLARATION]).mockResolvedValueOnce([]).mockResolvedValueOnce([DECLARATION])
    vi.mocked(wageApi.markDeclared).mockResolvedValue()
    vi.mocked(wageApi.unmarkDeclared).mockResolvedValue()
    const wrapper = mount(PendingDeclarations)
    await flushPromises()

    // When
    await buttonNamed(wrapper, 'C’est déclaré').trigger('click')
    await flushPromises()

    // Then
    expect(wageApi.markDeclared).toHaveBeenCalledWith(['m1', 'm2'])
    expect(wrapper.find('article').exists()).toBe(false)
    expect(wrapper.text()).toContain('Missions de Léa de novembre 2026 indiquées comme déclarées.')

    await buttonNamed(wrapper, 'Annuler').trigger('click')
    await flushPromises()
    expect(wageApi.unmarkDeclared).toHaveBeenCalledWith(['m1', 'm2'])
    expect(wrapper.find('article').exists()).toBe(true)
  })

  it('explains a refusal', async () => {
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([DECLARATION])
    vi.mocked(wageApi.markDeclared).mockRejectedValue(new ApiError(409, 'Not completed', 'MISSION_NOT_COMPLETED'))
    const wrapper = mount(PendingDeclarations)
    await flushPromises()

    await buttonNamed(wrapper, 'C’est déclaré').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
