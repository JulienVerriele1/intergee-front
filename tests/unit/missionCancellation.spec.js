import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'
import StudentApplicationsTable from '@/components/tracking/StudentApplicationsTable.vue'
import ReviewList from '@/components/reviews/ReviewList.vue'
import * as missionApi from '@/api/missionApi'
import * as reviewApi from '@/api/reviewApi'
import * as profileApi from '@/api/profileApi'
import { isLateCancellation, isLateWithdrawal, isLive, lateReviewOpen } from '@/missions/cancellation'

vi.mock('@/api/missionApi')
vi.mock('@/api/reviewApi')
vi.mock('@/api/profileApi')

// Spec 017: cancellation, change and withdrawal
const NOW = new Date('2026-12-05T12:00:00Z')

function published(overrides = {}) {
  return {
    id: 'mission-1',
    title: 'Courses au marché',
    category: 'GROCERIES',
    scheduledAt: '2026-12-06T08:00:00Z',
    durationMinutes: 90,
    postalCode: '59000',
    city: 'Lille',
    hourlyNetWage: 12, netWage: 18,
    status: 'OPEN',
    applicationCount: 0,
    assignedStudentFirstName: null,
    completedAt: null,
    beneficiary: { id: 'jeanne', firstName: 'Jeanne' },
    reviewSubmitted: false,
    cancellation: null,
    lateWithdrawals: [],
    ...overrides,
  }
}

function application(overrides = {}, missionOverrides = {}) {
  return {
    mission: { ...published({ status: 'ASSIGNED' }), requiredSkills: ['GROCERY_SHOPPING'], ...missionOverrides },
    applicationStatus: 'ACCEPTED',
    appliedAt: '2026-12-01T10:00:00Z',
    completedAt: null,
    reviewSubmitted: false,
    declared: false,
    cancellation: null,
    ...overrides,
  }
}

function page(items) {
  return { items, page: 0, size: 5, totalItems: items.length, totalPages: 1 }
}

function router() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'my-missions', component: { template: '<p>missions</p>' } },
      { path: '/missions/:id/modifier', name: 'edit-mission', component: { template: '<p>modifier</p>' } },
    ],
  })
}

function buttonNamed(wrapper, name) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === name)
  if (!button) {
    throw new Error(`No button named "${name}"`)
  }
  return button
}

async function openFirst(component) {
  const wrapper = mount(component, { attachTo: document.body, global: { plugins: [router()] } })
  await flushPromises()
  await wrapper.findAll('tbody tr')[0].trigger('click')
  await flushPromises()
  return wrapper
}

describe('cancellation helpers', () => {
  it('tells a late cancellation, 2 hours before, and a late withdrawal, 8 hours before', () => {
    const now = new Date('2026-12-06T07:00:00Z').getTime()
    expect(isLateCancellation(published({ status: 'ASSIGNED' }), now)).toBe(true)
    expect(isLateCancellation(published({ status: 'APPLIED' }), now)).toBe(false)
    expect(isLateCancellation(published({ status: 'ASSIGNED' }), new Date('2026-12-06T06:00:00Z').getTime())).toBe(false)
    expect(isLateWithdrawal(published(), new Date('2026-12-06T00:30:00Z').getTime())).toBe(true)
    expect(isLateWithdrawal(published(), new Date('2026-12-05T23:00:00Z').getTime())).toBe(false)
    expect(isLive(published({ status: 'CANCELLED' }), now)).toBe(false)
    expect(isLive(published(), new Date('2026-12-06T08:00:00Z').getTime())).toBe(false)
    expect(lateReviewOpen('2026-12-20T00:00:00Z', false, now)).toBe(true)
    expect(lateReviewOpen('2026-12-20T00:00:00Z', true, now)).toBe(false)
    expect(lateReviewOpen(null, false, now)).toBe(false)
  })
})

describe('the beneficiary side', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    profileApi.fetchStudentPhoto.mockRejectedValue(new Error('No photo'))
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('changes a mission to come and cancels it with a reason from the list', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([published()]))
    missionApi.cancelMission.mockResolvedValue({ late: false })
    const wrapper = await openFirst(PublishedMissionList)

    expect(wrapper.get('a[href="/missions/mission-1/modifier"]').text()).toBe('Modifier')
    await buttonNamed(wrapper, 'Annuler la mission').trigger('click')
    const dialog = wrapper.get('dialog')
    expect(dialog.text()).toContain('Cette annulation est définitive.')
    expect(dialog.findAll('button').find((button) => button.text() === 'Annuler la mission').attributes('disabled')).toBeDefined()
    await dialog.get('input[value="NO_LONGER_NEEDED"]').setValue(true)
    await dialog.findAll('button').find((button) => button.text() === 'Annuler la mission').trigger('click')
    await flushPromises()

    expect(missionApi.cancelMission).toHaveBeenCalledWith('mission-1', 'NO_LONGER_NEEDED')
  })

  it('warns that a late cancellation may be reviewed by the chosen student', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ status: 'ASSIGNED', assignedStudentFirstName: 'Léa', scheduledAt: '2026-12-05T13:30:00Z' }),
    ]))
    missionApi.fetchAssignment.mockResolvedValue({ student: { id: 'lea', firstName: 'Léa', lastName: 'Martin', school: 'Lille', email: 'lea@example.fr' } })
    const wrapper = await openFirst(PublishedMissionList)

    await buttonNamed(wrapper, 'Annuler la mission').trigger('click')

    expect(wrapper.get('dialog').text()).toContain('Léa sera prévenu par e-mail et SMS, et pourra vous laisser un avis.')
  })

  it('shows a cancelled mission with its reason, without actions', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({ status: 'CANCELLED', cancellation: { reason: 'OTHER_SOLUTION_FOUND', cancelledAt: '2026-12-04T10:00:00Z', late: false } }),
    ]))
    const wrapper = await openFirst(PublishedMissionList)

    expect(wrapper.text()).toContain('Annulée')
    expect(wrapper.text()).toContain('Motif : « J’ai trouvé une autre solution »')
    expect(wrapper.find('a[href="/missions/mission-1/modifier"]').exists()).toBe(false)
  })

  it('reviews a student who withdrew late, published at once', async () => {
    missionApi.fetchMyMissions.mockResolvedValue(page([
      published({
        status: 'OPEN',
        lateWithdrawals: [{ studentId: 'lea', firstName: 'Léa', withdrawnAt: '2026-12-05T10:00:00Z', reviewOpenUntil: '2026-12-19T10:00:00Z', reviewSubmitted: false }],
      }),
    ]))
    reviewApi.submitReview.mockResolvedValue({})
    const wrapper = await openFirst(PublishedMissionList)

    expect(wrapper.text()).toContain('Léa s’est désisté moins de 8 h avant la mission')
    await buttonNamed(wrapper, 'Évaluer Léa').trigger('click')
    await wrapper.get('dialog input[type="radio"][value="2"]').setValue(true)
    await wrapper.get('dialog').findAll('button').find((button) => button.text() === 'Envoyer mon avis').trigger('click')
    await flushPromises()

    expect(reviewApi.submitReview).toHaveBeenCalledWith('mission-1', 2, '', 'lea')
  })
})

describe('the student side', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    missionApi.fetchAssignment.mockResolvedValue({
      location: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille', latitude: 50.6, longitude: 3.0 },
      beneficiary: { firstName: 'Jeanne', lastName: 'Dupont', phone: '+33320000000' },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('withdraws from a mission late, warned that the beneficiary may review them', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application({}, { scheduledAt: '2026-12-05T18:00:00Z' })]))
    missionApi.withdrawFromAssignment.mockResolvedValue({ late: true })
    const wrapper = await openFirst(StudentApplicationsTable)

    await buttonNamed(wrapper, 'Me désister').trigger('click')
    const dialog = wrapper.get('dialog')
    expect(dialog.text()).toContain('moins de 8 h')
    await dialog.get('input[value="UNAVAILABLE"]').setValue(true)
    await dialog.findAll('button').find((button) => button.text() === 'Me désister').trigger('click')
    await flushPromises()

    expect(missionApi.withdrawFromAssignment).toHaveBeenCalledWith('mission-1', 'UNAVAILABLE')
  })

  it('shows a mission cancelled late, which the chosen student may review', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application(
      { cancellation: { reason: 'UNAVAILABLE', cancelledAt: '2026-12-05T07:00:00Z', reviewOpenUntil: '2026-12-19T07:00:00Z' } },
      { status: 'CANCELLED' },
    )]))
    const wrapper = await openFirst(StudentApplicationsTable)

    expect(wrapper.text()).toContain('Mission annulée')
    expect(wrapper.text()).toContain('Motif : « Je suis indisponible »')
    expect(wrapper.find('button').exists()).toBe(true)
    expect(buttonNamed(wrapper, 'Laisser un avis sur cette annulation tardive').exists()).toBe(true)
    expect(wrapper.findAll('button').some((button) => button.text() === 'Me désister')).toBe(false)
    expect(missionApi.fetchAssignment).not.toHaveBeenCalled()
  })
})

describe('the reviews', () => {
  it('show a late cancellation or withdrawal instead of the category', () => {
    const wrapper = mount(ReviewList, {
      props: {
        reviews: [{ id: 'r1', rating: 1, missionCategory: 'GROCERIES', createdAt: '2026-12-05T10:00:00Z', authorFirstName: 'Jeanne', occasion: 'LATE_WITHDRAWAL' }],
      },
    })

    expect(wrapper.text()).toContain('Désistement tardif')
    expect(wrapper.text()).not.toContain('Courses')
  })
})
