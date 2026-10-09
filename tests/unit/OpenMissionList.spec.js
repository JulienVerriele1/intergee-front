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
}

// Items are copied: the component updates `alreadyApplied` in place
function page(overrides = {}) {
  return { items: [{ ...PREVIEW }], page: 0, size: 20, totalItems: 1, totalPages: 1, ...overrides }
}

function findButton(wrapper, name) {
  return wrapper.findAll('button').find((button) => button.text() === name)
}

function buttonNamed(wrapper, name) {
  const button = findButton(wrapper, name)
  if (!button) {
    throw new Error(`No button named "${name}"`)
  }
  return button
}

describe('OpenMissionList', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows the missions of the area with their distance', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    expect(wrapper.text()).toContain('1 mission dans votre zone')
    expect(wrapper.text()).toContain('Aide pour faire les courses')
    expect(wrapper.text()).toContain('59000 Lille')
    expect(wrapper.text()).toContain('3 km')
  })

  it('filters by category from the first page', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await wrapper.get('#category-filter').setValue('GARDENING')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenLastCalledWith({ category: 'GARDENING', page: 0, size: 20 })
  })

  it('goes to the next page', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page({ totalItems: 41, totalPages: 3 }))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await wrapper.get('nav[aria-label="Pagination des missions"] button:last-child').trigger('click')
    await flushPromises()

    expect(missionApi.fetchOpenMissions).toHaveBeenLastCalledWith({ category: '', page: 1, size: 20 })
    expect(wrapper.text()).toContain('Page 2 sur 3')
  })

  it('explains an empty area', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page({ items: [], totalItems: 0, totalPages: 0 }))

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune mission ouverte dans votre zone')
  })

  it('applies to a mission and offers to withdraw', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockResolvedValue({ missionId: PREVIEW.id, appliedAt: '2026-01-01T10:00:00Z' })
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(missionApi.applyToMission).toHaveBeenCalledWith(PREVIEW.id)
    expect(wrapper.get('[role="status"].rounded-lg').text()).toContain('Votre candidature a été envoyée')
    expect(wrapper.text()).toContain('Candidature envoyée')
    expect(findButton(wrapper, 'Retirer ma candidature')).toBeDefined()
  })

  it('withdraws an application', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page({ items: [{ ...PREVIEW, alreadyApplied: true }] }))
    missionApi.withdrawApplication.mockResolvedValue()
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Retirer ma candidature').trigger('click')
    await flushPromises()

    expect(missionApi.withdrawApplication).toHaveBeenCalledWith(PREVIEW.id)
    expect(wrapper.text()).toContain('Votre candidature a été retirée.')
    expect(wrapper.text()).not.toContain('Candidature envoyée')
    expect(findButton(wrapper, 'Postuler')).toBeDefined()
  })

  it('explains that an unverified student cannot apply', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockRejectedValue(new ApiError(403, 'Forbidden', 'STUDENT_NOT_VERIFIED'))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Votre compte étudiant doit être vérifié avant de pouvoir postuler.')
    expect(findButton(wrapper, 'Postuler')).toBeDefined()
  })

  it('explains that a mission is full', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockRejectedValue(new ApiError(409, 'Mission is full', 'MISSION_FULL'))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Cette mission a déjà reçu le nombre maximum de candidatures.')
  })

  it('shows the application of a student who already applied elsewhere', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockRejectedValue(new ApiError(409, 'Already applied', 'ALREADY_APPLIED'))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Postuler').trigger('click')
    await flushPromises()

    expect(findButton(wrapper, 'Retirer ma candidature')).toBeDefined()
  })

  it('disables the buttons while an application is sent', async () => {
    missionApi.fetchOpenMissions.mockResolvedValue(page())
    missionApi.applyToMission.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(OpenMissionList)
    await flushPromises()

    await buttonNamed(wrapper, 'Postuler').trigger('click')

    expect(buttonNamed(wrapper, 'Envoi en cours…').attributes('disabled')).toBeDefined()
  })

  it('announces an error', async () => {
    missionApi.fetchOpenMissions.mockRejectedValue(new ApiError(0, 'Le serveur est injoignable.'))

    const wrapper = mount(OpenMissionList)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Le serveur est injoignable.')
  })
})
