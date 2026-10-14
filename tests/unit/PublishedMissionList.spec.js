import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'
import * as missionApi from '@/api/missionApi'
import * as reviewApi from '@/api/reviewApi'
import * as profileApi from '@/api/profileApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/missionApi')
vi.mock('@/api/reviewApi')
vi.mock('@/api/profileApi')

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

function page(items, { number = 0, totalItems = items.length } = {}) {
  return { items, page: number, size: 5, totalItems, totalPages: Math.ceil(totalItems / 5) }
}

const CANDIDATES = [
  { applicantId: 'lea', firstName: 'Léa', school: 'Université de Lille', verified: true, appliedAt: '2026-12-01T10:00:00Z', status: 'PENDING', averageRating: 4.5, reviewCount: 2, age: 21, studyLevel: 'BAC_3', skills: ['CONVERSATION', 'SMARTPHONE_TABLET'], hasPhoto: true, matchingSkills: ['SMARTPHONE_TABLET'] },
  { applicantId: 'tom', firstName: 'Tom', school: 'IUT de Lille', verified: true, appliedAt: '2026-12-01T11:00:00Z', status: 'PENDING', averageRating: null, reviewCount: 0, age: 19, studyLevel: 'BAC_1', skills: ['GARDENING'], hasPhoto: false, matchingSkills: [] },
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

/** Shows the details of a mission, by clicking its row */
async function openDetail(wrapper, index = 0) {
  await wrapper.findAll('tbody tr')[index].trigger('click')
  await flushPromises()
}

describe('PublishedMissionList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    profileApi.fetchStudentPhoto.mockRejectedValue(new Error('No photo in these tests'))
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('lists the retained missions by default, with their status', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))

    const wrapper = await mountList()

    expect(missionApi.fetchMyMissions).toHaveBeenCalledWith({ period: 'RETAINED', page: 0, size: 5 })
    expect(buttonNamed(wrapper, 'Attribuées').attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['Mission', 'Date', 'Statut'])
    expect(wrapper.get('tbody th').text()).toBe('Aide pour faire les courses')
    expect(wrapper.get('tbody').text()).toContain('2 candidatures')
    expect(wrapper.find('#mission-detail').exists()).toBe(false)
    expect(wrapper.findAll('[role="group"] button').every((button) => button.classes().includes('min-h-9'))).toBe(true)
  })

  it('pages through the missions, 5 at a time', async () => {
    missionApi.fetchMyMissions
      .mockResolvedValueOnce(page([1, 2, 3, 4, 5].map((index) => published({ id: `m${index}`, title: `Mission ${index}` })), { totalItems: 7 }))
      .mockResolvedValueOnce(page([published({ id: 'm6', title: 'Mission 6' })], { number: 1, totalItems: 7 }))
    const wrapper = await mountList()
    expect(wrapper.text()).toContain('Page 1 sur 2')

    await buttonNamed(wrapper, 'Suivante').trigger('click')
    await flushPromises()

    expect(missionApi.fetchMyMissions).toHaveBeenLastCalledWith({ period: 'RETAINED', page: 1, size: 5 })
    expect(wrapper.findAll('tbody th').map((cell) => cell.text())).toEqual(['Mission 6'])
  })

  it('switches to the past missions', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([]))
    const wrapper = await mountList()

    await buttonNamed(wrapper, 'Passées').trigger('click')
    await flushPromises()

    expect(missionApi.fetchMyMissions).toHaveBeenLastCalledWith({ period: 'PAST', page: 0, size: 5 })
    expect(wrapper.text()).toContain('Aucune mission passée.')
  })

  it('greys the past tab until it is selected', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([]))
    const wrapper = await mountList()

    expect(buttonNamed(wrapper, 'Passées').classes()).toContain('text-ink-muted')
    expect(buttonNamed(wrapper, 'À venir').classes()).not.toContain('text-ink-muted')
    await buttonNamed(wrapper, 'Passées').trigger('click')

    expect(buttonNamed(wrapper, 'Passées').classes()).not.toContain('text-ink-muted')
  })

  it('switches to the upcoming missions', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([]))
    const wrapper = await mountList()

    await buttonNamed(wrapper, 'À venir').trigger('click')
    await flushPromises()

    expect(missionApi.fetchMyMissions).toHaveBeenLastCalledWith({ period: 'UPCOMING', page: 0, size: 5 })
    expect(wrapper.text()).toContain('Aucune mission à venir.')
  })

  it('chooses a candidate after a confirmation', async () => {
    // Given
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))
    missionApi.fetchApplications.mockResolvedValue(CANDIDATES)
    missionApi.assignMission.mockResolvedValue({})
    const wrapper = await mountList()
    await openDetail(wrapper)
    expect(hasButton(wrapper, 'Voir les candidats')).toBe(false)
    expect(wrapper.text()).toContain('Université de Lille')
    expect(wrapper.find('[aria-label="Note : 4,5 sur 5 (2 avis)"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Léa, 21 ans')
    expect(wrapper.text()).toContain('Bac +3')
    expect(wrapper.get('[aria-label="Compétences de Léa"]').text()).toContain('Utiliser un smartphone ou une tablette')
    expect(wrapper.get('[aria-label="Compétences de Léa"]').text()).toContain('(demandée pour la mission)')
    expect(wrapper.text()).toContain('1 compétence demandée pour cette mission')
    expect(wrapper.find('[aria-label="Tom n\'a pas encore de photo"]').exists()).toBe(true)

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
    await openDetail(wrapper)

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
    await openDetail(wrapper)

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
    expect(wrapper.get('tbody').text()).toContain('Attribuée à Léa')

    await openDetail(wrapper)

    expect(hasButton(wrapper, 'Confirmer que la mission a eu lieu')).toBe(false)
    expect(hasButton(wrapper, 'Voir le contact de Léa')).toBe(false)
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
    expect(wrapper.get('tbody').text()).toContain('À confirmer')
    await openDetail(wrapper)

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
    await openDetail(wrapper)

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

    await openDetail(wrapper, 0)
    expect(wrapper.text()).toContain('Avis envoyé')
    expect(hasButton(wrapper, 'Évaluer Léa')).toBe(false)
    await openDetail(wrapper, 1)
    expect(hasButton(wrapper, 'Évaluer Tom')).toBe(false)
  })

  it('names the beneficiary and filters by beneficiary for a caregiver', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ id: 'm1', title: 'Courses de Jeanne' }),
      published({ id: 'm2', title: 'Jardin de Marcel', beneficiary: { id: 'marcel', firstName: 'Marcel' } }),
    ]))
    const wrapper = await mountList({ isCaregiver: true })
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['Mission', 'Pour', 'Date', 'Statut'])
    expect(wrapper.findAll('tbody td')[0].text()).toBe('Jeanne')

    await wrapper.get('#beneficiary-filter').setValue('marcel')

    expect(wrapper.findAll('tbody th').map((cell) => cell.text())).toEqual(['Jardin de Marcel'])
  })

  it('opens the details right under their row, one mission at a time', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ id: 'm1', title: 'Mission 1' }),
      published({ id: 'm2', title: 'Mission 2' }),
    ]))
    missionApi.fetchApplications.mockResolvedValue(CANDIDATES)
    const wrapper = mount(PublishedMissionList, { attachTo: document.body })
    await flushPromises()

    await buttonNamed(wrapper, 'Mission 1').trigger('click')
    await buttonNamed(wrapper, 'Mission 2').trigger('click')
    await flushPromises()

    const rows = wrapper.findAll('tbody > tr')
    expect(rows.map((row) => row.attributes('id') ?? row.get('th').text())).toEqual(['Mission 1', 'Mission 2', 'mission-detail'])
    expect(buttonNamed(wrapper, 'Mission 1').attributes('aria-expanded')).toBe('false')
    expect(buttonNamed(wrapper, 'Mission 2').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })
})
