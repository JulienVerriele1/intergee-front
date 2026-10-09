import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'
import * as missionApi from '@/api/missionApi'
import * as reviewApi from '@/api/reviewApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/missionApi')
vi.mock('@/api/reviewApi')

const NOW = new Date('2026-12-05T12:00:00Z')

function published(overrides = {}) {
  return {
    id: 'd5fe8e5a-11f7-416b-a299-a5682649bb04',
    title: 'Aide pour faire les courses',
    category: 'GROCERIES',
    scheduledAt: '2026-12-06T08:00:00Z',
    durationMinutes: 90,
    postalCode: '59000',
    city: 'Lille',
    reward: 20,
    status: 'APPLIED',
    applicationCount: 2,
    assignedStudentFirstName: null,
    completedAt: null,
    beneficiary: { id: 'jeanne', firstName: 'Jeanne' },
    reviewSubmitted: false,
    ...overrides,
  }
}

function page(items) {
  return { items, page: 0, size: 20, totalItems: items.length, totalPages: items.length > 0 ? 1 : 0 }
}

const CANDIDATES = [
  { applicantId: 'lea', firstName: 'Léa', school: 'Université de Lille', verified: true, appliedAt: '2026-12-01T10:00:00Z', status: 'PENDING', averageRating: 4.5, reviewCount: 2 },
  { applicantId: 'tom', firstName: 'Tom', school: 'IUT de Lille', verified: true, appliedAt: '2026-12-01T11:00:00Z', status: 'PENDING', averageRating: null, reviewCount: 0 },
]

function buttonNamed(wrapper, name) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === name)
  if (!button) {
    throw new Error(`No button named "${name}"`)
  }
  return button
}

function hasButton(wrapper, name) {
  return wrapper.findAll('button').some((button) => button.text() === name)
}

async function mountList(props = {}) {
  const wrapper = mount(PublishedMissionList, { props, attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('PublishedMissionList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('lists the upcoming missions with their status', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))

    const wrapper = await mountList()

    expect(missionApi.fetchMyMissions).toHaveBeenCalledWith({ period: 'UPCOMING', page: 0, size: 20 })
    expect(wrapper.text()).toContain('Aide pour faire les courses')
    expect(wrapper.text()).toContain('2 candidatures')
    expect(wrapper.text()).not.toContain('Pour Jeanne')
  })

  it('switches to the past missions', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([]))
    const wrapper = await mountList()

    await buttonNamed(wrapper, 'Passées').trigger('click')
    await flushPromises()

    expect(missionApi.fetchMyMissions).toHaveBeenLastCalledWith({ period: 'PAST', page: 0, size: 20 })
    expect(wrapper.text()).toContain('Aucune mission passée.')
  })

  it('chooses a candidate after a confirmation', async () => {
    // Given
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))
    missionApi.fetchApplications.mockResolvedValue(CANDIDATES)
    missionApi.assignMission.mockResolvedValue({})
    const wrapper = await mountList()
    await buttonNamed(wrapper, 'Voir les candidats').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Université de Lille')
    expect(wrapper.find('[aria-label="Note : 4,5 sur 5 (2 avis)"]').exists()).toBe(true)

    // When: the beneficiary chooses Léa, then confirms
    await buttonNamed(wrapper, 'Choisir Léa').trigger('click')
    expect(wrapper.get('dialog').text()).toContain('Ce choix est définitif')
    expect(missionApi.assignMission).not.toHaveBeenCalled()
    await wrapper.get('dialog').findAll('button').at(1).trigger('click')
    await flushPromises()

    // Then
    expect(missionApi.assignMission).toHaveBeenCalledWith(published().id, 'lea')
    expect(wrapper.text()).toContain('Léa réalisera la mission')
    expect(missionApi.fetchMyMissions).toHaveBeenCalledTimes(2)
  })

  it('cancels the choice of a candidate', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))
    missionApi.fetchApplications.mockResolvedValue(CANDIDATES)
    const wrapper = await mountList()
    await buttonNamed(wrapper, 'Voir les candidats').trigger('click')
    await flushPromises()

    await buttonNamed(wrapper, 'Choisir Tom').trigger('click')
    await buttonNamed(wrapper, 'Annuler').trigger('click')

    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(missionApi.assignMission).not.toHaveBeenCalled()
  })

  it('explains why a candidate could not be chosen', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))
    missionApi.fetchApplications.mockResolvedValue(CANDIDATES)
    missionApi.assignMission.mockRejectedValue(new ApiError(409, 'Already assigned', 'MISSION_ALREADY_ASSIGNED'))
    const wrapper = await mountList()
    await buttonNamed(wrapper, 'Voir les candidats').trigger('click')
    await flushPromises()

    await buttonNamed(wrapper, 'Choisir Léa').trigger('click')
    await wrapper.get('dialog').findAll('button').at(1).trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Un étudiant a déjà été choisi pour cette mission.')
  })

  it('shows the contact of the assigned student', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published({ status: 'ASSIGNED', assignedStudentFirstName: 'Léa' })]))
    missionApi.fetchAssignment.mockResolvedValue({
      student: { firstName: 'Léa', lastName: 'Martin', school: 'Université de Lille', email: 'lea@univ-lille.fr' },
    })
    const wrapper = await mountList()

    expect(wrapper.text()).toContain('Attribuée à Léa')
    expect(hasButton(wrapper, 'Confirmer que la mission a eu lieu')).toBe(false)
    await buttonNamed(wrapper, 'Voir le contact de Léa').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Léa Martin')
    expect(wrapper.get('a[href="mailto:lea@univ-lille.fr"]').exists()).toBe(true)
  })

  it('confirms a mission once its slot is over', async () => {
    // Given: assigned, from 8:00 to 9:30 this morning
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ status: 'ASSIGNED', assignedStudentFirstName: 'Léa', scheduledAt: '2026-12-05T08:00:00Z' }),
    ]))
    missionApi.completeMission.mockResolvedValue({})
    const wrapper = await mountList()
    expect(wrapper.text()).toContain('À confirmer')

    // When
    await buttonNamed(wrapper, 'Confirmer que la mission a eu lieu').trigger('click')
    await buttonNamed(wrapper, 'Oui, la mission a eu lieu').trigger('click')
    await flushPromises()

    // Then
    expect(missionApi.completeMission).toHaveBeenCalledWith(published().id)
    expect(wrapper.text()).toContain('est terminée')
  })

  it('reviews the student of a mission completed less than 14 days ago', async () => {
    // Given
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ status: 'COMPLETED', assignedStudentFirstName: 'Léa', scheduledAt: '2026-12-04T08:00:00Z', completedAt: '2026-12-04T12:00:00Z' }),
    ]))
    reviewApi.submitReview.mockResolvedValue({})
    const wrapper = await mountList()

    // When
    await buttonNamed(wrapper, 'Évaluer Léa').trigger('click')
    await wrapper.findAll('dialog input[type="radio"]').at(3).setValue()
    await buttonNamed(wrapper, 'Envoyer mon avis').trigger('click')
    await flushPromises()

    // Then
    expect(reviewApi.submitReview).toHaveBeenCalledWith(published().id, 4)
    expect(wrapper.text()).toContain('Merci pour votre avis')
  })

  it('offers no review once sent, nor after 14 days', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ id: 'm1', status: 'COMPLETED', assignedStudentFirstName: 'Léa', completedAt: '2026-12-04T12:00:00Z', reviewSubmitted: true }),
      published({ id: 'm2', status: 'COMPLETED', assignedStudentFirstName: 'Tom', completedAt: '2026-11-01T12:00:00Z' }),
    ]))

    const wrapper = await mountList()

    expect(wrapper.text()).toContain('Avis envoyé')
    expect(hasButton(wrapper, 'Évaluer Léa')).toBe(false)
    expect(hasButton(wrapper, 'Évaluer Tom')).toBe(false)
  })

  it('names the beneficiary and filters by beneficiary for a caregiver', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ id: 'm1', title: 'Courses de Jeanne' }),
      published({ id: 'm2', title: 'Jardin de Marcel', beneficiary: { id: 'marcel', firstName: 'Marcel' } }),
    ]))
    const wrapper = await mountList({ isCaregiver: true })
    expect(wrapper.text()).toContain('Pour Jeanne')

    await wrapper.get('#beneficiary-filter').setValue('marcel')

    expect(wrapper.text()).toContain('Jardin de Marcel')
    expect(wrapper.text()).not.toContain('Courses de Jeanne')
  })
})
