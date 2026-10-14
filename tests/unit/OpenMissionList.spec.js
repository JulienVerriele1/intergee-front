import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import OpenMissionList from '@/components/missions/OpenMissionList.vue'
import * as missionApi from '@/api/missionApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/missionApi')

const PREVIEW = {
  id: 'd5fe8e5a-11f7-416b-a299-a5682649bb04',
  title: 'Aide pour faire les courses',
  category: 'GROCERIES',
  description: 'Porter les sacs',
  scheduledAt: '2026-12-05T08:00:00Z',
  durationMinutes: 90,
  postalCode: '59000',
  city: 'Lille',
  distanceKm: 3,
  reward: 20,
  alreadyApplied: false,
  requiredSkills: ['GROCERY_SHOPPING'],
  matchingSkills: ['GROCERY_SHOPPING'],
}

function page(overrides = {}) {
  return { items: [{ ...PREVIEW }], page: 0, size: 5, totalItems: 1, totalPages: 1, ...overrides }
}

function emptyPage() {
  return page({ items: [], totalItems: 0, totalPages: 0 })
}

function buttonNamed(wrapper, name) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === name)
  if (!button) {
    throw new Error(`No button named "${name}"`)
  }
  return button
}

async function mountWithDetail() {
  const wrapper = mount(OpenMissionList, { attachTo: document.body })
  await flushPromises()
  await buttonNamed(wrapper, PREVIEW.title).trigger('click')
  return wrapper
}

describe('OpenMissionList', () => {
  beforeEach(() => vi.resetAllMocks())

  it('asks for the first five missions the student has not applied to', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())

    mount(OpenMissionList)
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenCalledWith({ category: '', excludeApplied: true, page: 0, size: 5 })
  })

  it('shows one row per mission with its date and place', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    const cells = wrapper.findAll('tbody tr > *').map((cell) => cell.text())
    expect(cells[0]).toBe('Aide pour faire les courses')
    expect(cells[1]).toContain('2026')
    expect(cells[2]).toContain('Lille')
    expect(cells[2]).toContain('3 km')
    expect(wrapper.text()).toContain('1 mission à découvrir')
    // No details before a choice
    expect(wrapper.find('#open-mission-detail').exists()).toBe(false)
  })

  it('shows the details of a mission on click, and hides them on a second click', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    const wrapper = await mountWithDetail()

    const detail = wrapper.get('#open-mission-detail')
    expect(detail.text()).toContain('Porter les sacs')
    expect(buttonNamed(wrapper, PREVIEW.title).attributes('aria-expanded')).toBe('true')
    expect(document.activeElement.textContent).toBe('Détail de la mission')

    await wrapper.get('tbody tr').trigger('click')
    expect(wrapper.find('#open-mission-detail').exists()).toBe(false)
    wrapper.unmount()
  })

  it('filters by category from the first page', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await wrapper.get('#category-filter').setValue('GARDENING')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenLastCalledWith({
      category: 'GARDENING',
      excludeApplied: true,
      page: 0,
      size: 5,
    })
  })

  it('goes to the next page', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page({ totalItems: 12, totalPages: 3 }))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Suivante').trigger('click')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenLastCalledWith({ category: '', excludeApplied: true, page: 1, size: 5 })
    expect(wrapper.text()).toContain('Page 2 sur 3')
  })

  it('explains an empty area', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(emptyPage())

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune nouvelle mission dans votre zone ne demande vos compétences')
  })

  it('applies to a mission, which leaves the table', async () => {
    missionApi.fetchOpenMissions.mockResolvedValueOnce(page()).mockResolvedValueOnce(emptyPage())
    missionApi.applyToMission.mockResolvedValue({ missionId: PREVIEW.id, appliedAt: '2026-01-01T10:00:00Z' })
    const wrapper = await mountWithDetail()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(missionApi.applyToMission).toHaveBeenCalledWith(PREVIEW.id)
    expect(wrapper.text()).toContain('Votre candidature a été envoyée')
    expect(wrapper.find('#open-mission-detail').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.emitted('applications-changed')).toHaveLength(1)
    wrapper.unmount()
  })

  it('shows the previous page when the last mission of the last page is applied to', async () => {
    missionApi.fetchOpenMissions
      .mockResolvedValueOnce(page({ totalItems: 6, totalPages: 2 }))
      .mockResolvedValueOnce(page({ page: 1, totalItems: 6, totalPages: 2 }))
      .mockResolvedValueOnce(page({ items: [], page: 1, totalItems: 5, totalPages: 1 }))
      .mockResolvedValueOnce(page({ totalItems: 5, totalPages: 1 }))
    missionApi.applyToMission.mockResolvedValue({})
    const wrapper = mount(OpenMissionList, { attachTo: document.body })
    await flushPromises()
    await buttonNamed(wrapper, 'Suivante').trigger('click')
    await flushPromises()
    await buttonNamed(wrapper, PREVIEW.title).trigger('click')

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenLastCalledWith({ category: '', excludeApplied: true, page: 0, size: 5 })
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    wrapper.unmount()
  })

  it('explains that an unverified student cannot apply', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockRejectedValue(new ApiError(403, 'Forbidden', 'STUDENT_NOT_VERIFIED'))
    const wrapper = await mountWithDetail()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Votre compte étudiant doit être vérifié avant de pouvoir postuler.')
    expect(buttonNamed(wrapper, 'Postuler').exists()).toBe(true)
    wrapper.unmount()
  })

  it('explains that a mission is full', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockRejectedValue(new ApiError(409, 'Mission is full', 'MISSION_FULL'))
    const wrapper = await mountWithDetail()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Cette mission a déjà reçu le nombre maximum de candidatures.')
    wrapper.unmount()
  })

  it('removes a mission the student already applied to from another tab', async () => {
    missionApi.fetchOpenMissions.mockResolvedValueOnce(page()).mockResolvedValueOnce(emptyPage())
    missionApi.applyToMission.mockRejectedValue(new ApiError(409, 'Already applied', 'ALREADY_APPLIED'))
    const wrapper = await mountWithDetail()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Vous avez déjà postulé à cette mission')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.emitted('applications-changed')).toHaveLength(1)
    wrapper.unmount()
  })

  it('disables the button while an application is sent', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountWithDetail()

    await buttonNamed(wrapper, 'Postuler').trigger('click')

    expect(buttonNamed(wrapper, 'Envoi en cours…').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('reloads on demand, after an application is withdrawn', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await wrapper.vm.reload()

    expect(missionApi.fetchOpenMissions).toHaveBeenCalledTimes(2)
  })

  it('announces an error', async () => {
    missionApi.fetchOpenMissions.mockRejectedValue(new ApiError(0, 'Le serveur est injoignable.'))

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Le serveur est injoignable.')
  })

  it('opens the details right under their row, one mission at a time', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page({
      items: [{ ...PREVIEW, id: 'm1', title: 'Mission 1' }, { ...PREVIEW, id: 'm2', title: 'Mission 2' }],
      totalItems: 2,
    }))
    const wrapper = mount(OpenMissionList, { attachTo: document.body })
    await flushPromises()

    await buttonNamed(wrapper, 'Mission 1').trigger('click')
    await buttonNamed(wrapper, 'Mission 2').trigger('click')

    const rows = wrapper.findAll('tbody > tr')
    expect(rows.map((row) => row.attributes('id') ?? row.get('th').text())).toEqual(['Mission 1', 'Mission 2', 'open-mission-detail'])
    expect(wrapper.findAll('#open-mission-detail')).toHaveLength(1)
    wrapper.unmount()
  })
})
