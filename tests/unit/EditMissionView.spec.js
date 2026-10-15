import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import EditMissionView from '@/views/EditMissionView.vue'
import * as missionApi from '@/api/missionApi'
import * as wageApi from '@/api/wageApi'

vi.mock('@/api/missionApi')
vi.mock('@/api/wageApi')

// Spec 017, UC-2
const MISSION = {
  id: 'mission-1',
  title: 'Courses au marché',
  category: 'GROCERIES',
  description: 'Porter les sacs',
  scheduledAt: '2026-12-06T08:00:00Z',
  durationMinutes: 90,
  location: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille', latitude: 50.6278, longitude: 3.0525 },
  hourlyNetWage: 12,
  netWage: 18,
  requiredSkills: ['GROCERY_SHOPPING'],
  status: 'APPLIED',
}

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'my-missions', component: { template: '<p>missions</p>' } }],
  })
  const wrapper = mount(EditMissionView, { props: { id: 'mission-1' }, global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('EditMissionView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-12-05T12:00:00Z'))
    wageApi.estimateCost.mockResolvedValue({ minimumHourlyNetWage: 10.45, employerCost: 20, netWage: 15 })
  })

  afterEach(() => vi.useRealTimers())

  it('keeps the conditions the students applied to, and changes the title and the wage upwards', async () => {
    missionApi.fetchMission.mockResolvedValue(MISSION)
    missionApi.changeMission.mockResolvedValue({ ...MISSION, title: 'Courses au grand marché' })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Conditions fixées')
    expect(wrapper.find('#scheduledAt').exists()).toBe(false)
    expect(wrapper.find('#street').exists()).toBe(false)
    expect(wrapper.get('#title').element.value).toBe('Courses au marché')

    await wrapper.get('#hourly-net-wage').setValue('11,00')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(missionApi.changeMission).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('le salaire ne peut qu’augmenter')

    await wrapper.get('#title').setValue('Courses au grand marché')
    await wrapper.get('#hourly-net-wage').setValue('13,00')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(missionApi.changeMission).toHaveBeenCalledWith('mission-1', expect.objectContaining({
      title: 'Courses au grand marché',
      hourlyNetWage: 13,
      scheduledAt: '2026-12-06T08:00:00.000Z',
      location: MISSION.location,
    }))
    expect(wrapper.text()).toContain('Mission « Courses au grand marché » modifiée.')
  })

  it('changes everything while nobody applied', async () => {
    missionApi.fetchMission.mockResolvedValue({ ...MISSION, status: 'OPEN' })
    const wrapper = await mountView()

    expect(wrapper.text()).not.toContain('Conditions fixées')
    expect(wrapper.find('#street').exists()).toBe(true)
    expect(wrapper.text()).toContain('Adresse reconnue')
  })

  it('refuses a mission cancelled or started', async () => {
    missionApi.fetchMission.mockResolvedValue({ ...MISSION, status: 'CANCELLED' })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('elle ne se modifie plus')
    expect(wrapper.find('form').exists()).toBe(false)
  })
})
