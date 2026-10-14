import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DashboardView from '@/views/DashboardView.vue'
import OpenMissionList from '@/components/missions/OpenMissionList.vue'
import StudentApplicationsTable from '@/components/tracking/StudentApplicationsTable.vue'
import * as missionApi from '@/api/missionApi'

vi.mock('@/api/missionApi')
vi.mock('@/api/reviewApi')

const EMPTY_PAGE = { items: [], page: 0, size: 5, totalItems: 0, totalPages: 0 }

async function mountDashboard() {
  const wrapper = mount(DashboardView, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

function tab(wrapper, name) {
  return wrapper.findAll('[role="tab"]').find((candidate) => candidate.text() === name)
}

function panelOf(wrapper, tabElement) {
  return wrapper.get(`#${tabElement.attributes('aria-controls')}`)
}

describe('DashboardView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    missionApi.fetchMyApplications.mockResolvedValue(EMPTY_PAGE)
    missionApi.fetchOpenMissions.mockResolvedValue(EMPTY_PAGE)
  })

  it('opens on the open missions, the applications in a second tab', async () => {
    const wrapper = await mountDashboard()

    expect(wrapper.findAll('[role="tab"]').map((element) => element.text())).toEqual([
      'Missions ouvertes près de chez moi',
      'Mes candidatures',
    ])
    const open = tab(wrapper, 'Missions ouvertes près de chez moi')
    const applications = tab(wrapper, 'Mes candidatures')
    expect(open.attributes('aria-selected')).toBe('true')
    expect(applications.attributes('aria-selected')).toBe('false')
    expect(panelOf(wrapper, open).isVisible()).toBe(true)
    expect(panelOf(wrapper, applications).isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('shows the applications on a click on their tab', async () => {
    const wrapper = await mountDashboard()
    const applications = tab(wrapper, 'Mes candidatures')

    await applications.trigger('click')

    expect(applications.attributes('aria-selected')).toBe('true')
    expect(applications.attributes('tabindex')).toBe('0')
    expect(panelOf(wrapper, applications).isVisible()).toBe(true)
    expect(panelOf(wrapper, tab(wrapper, 'Missions ouvertes près de chez moi')).isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('moves between the tabs with the arrow keys', async () => {
    const wrapper = await mountDashboard()

    await tab(wrapper, 'Missions ouvertes près de chez moi').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()

    expect(tab(wrapper, 'Mes candidatures').attributes('aria-selected')).toBe('true')
    expect(document.activeElement.textContent.trim()).toBe('Mes candidatures')

    await tab(wrapper, 'Mes candidatures').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(tab(wrapper, 'Missions ouvertes près de chez moi').attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('reloads the applications after an application', async () => {
    const wrapper = await mountDashboard()

    wrapper.findComponent(OpenMissionList).vm.$emit('applications-changed')
    await flushPromises()

    expect(missionApi.fetchMyApplications).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('reloads the open missions after a withdrawal', async () => {
    const wrapper = await mountDashboard()

    wrapper.findComponent(StudentApplicationsTable).vm.$emit('applications-changed')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})
