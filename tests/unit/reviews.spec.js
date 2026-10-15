import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StarRating from '@/components/reviews/StarRating.vue'
import StarRatingInput from '@/components/reviews/StarRatingInput.vue'
import ReviewDialog from '@/components/reviews/ReviewDialog.vue'
import ReviewList from '@/components/reviews/ReviewList.vue'
import CandidateReviews from '@/components/reviews/CandidateReviews.vue'
import ModerationView from '@/views/ModerationView.vue'
import { router as appRouter } from '@/router'
import { resolveNavigation } from '@/router/guards'
import ReceivedReviews from '@/components/reviews/ReceivedReviews.vue'
import * as reviewApi from '@/api/reviewApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/reviewApi')

describe('StarRating', () => {
  it('announces the average rating and the number of reviews', () => {
    const wrapper = mount(StarRating, { props: { averageRating: 4.3, reviewCount: 12 } })

    expect(wrapper.attributes('aria-label')).toBe('Note : 4,3 sur 5 (12 avis)')
    expect(wrapper.text()).toContain('4,3')
  })

  it('says "Aucun avis" rather than 0', () => {
    const wrapper = mount(StarRating, { props: { averageRating: null, reviewCount: 0 } })

    expect(wrapper.attributes('aria-label')).toBe('Aucun avis')
    expect(wrapper.text()).toBe('Aucun avis')
  })

  it('shows a single review without its count', () => {
    const wrapper = mount(StarRating, { props: { averageRating: 5, reviewCount: 1, showCount: false } })

    expect(wrapper.attributes('aria-label')).toBe('Note : 5,0 sur 5')
  })
})

describe('StarRatingInput', () => {
  it('is a group of 5 radio buttons labelled for screen readers', async () => {
    const wrapper = mount(StarRatingInput, { props: { legend: 'Votre note', modelValue: null } })

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(5)
    expect(wrapper.text()).toContain('1 étoile sur 5')
    expect(wrapper.text()).toContain('5 étoiles sur 5')

    await radios.at(3).setValue()
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([4])
  })
})

describe('ReviewDialog', () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function sendButton(wrapper) {
    return wrapper.findAll('button').find((button) => button.text() === 'Envoyer mon avis')
  }

  it('sends the chosen rating', async () => {
    reviewApi.submitReview.mockResolvedValue({})
    const wrapper = mount(ReviewDialog, { props: { missionId: 'mission-1', subject: 'Léa' }, attachTo: document.body })
    expect(sendButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.findAll('input[type="radio"]').at(4).setValue()
    await sendButton(wrapper).trigger('click')
    await flushPromises()

    expect(reviewApi.submitReview).toHaveBeenCalledWith('mission-1', 5, '', null)
    expect(wrapper.emitted('submitted')[0][0]).toContain('Merci pour votre avis')
  })

  it('explains a refused review', async () => {
    reviewApi.submitReview.mockRejectedValue(new ApiError(409, 'Over', 'REVIEW_PERIOD_OVER'))
    const wrapper = mount(ReviewDialog, { props: { missionId: 'mission-1', subject: 'Léa' }, attachTo: document.body })

    await wrapper.findAll('input[type="radio"]').at(2).setValue()
    await sendButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Le délai de 14 jours pour évaluer cette mission est dépassé.')
    expect(wrapper.emitted('submitted')).toBeUndefined()
  })
})

describe('ReceivedReviews', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows the reputation of each beneficiary of a caregiver, with the reviews on demand', async () => {
    reviewApi.fetchMyReputations.mockResolvedValue([
      { userId: 'jeanne', firstName: 'Jeanne', averageRating: 4.5, reviewCount: 2 },
      { userId: 'marcel', firstName: 'Marcel', averageRating: null, reviewCount: 0 },
    ])
    reviewApi.fetchUserReviews.mockResolvedValue({
      items: [{ rating: 5, missionCategory: 'GROCERIES', createdAt: '2026-12-05T12:00:00Z' }],
    })
    const wrapper = mount(ReceivedReviews, { props: { showNames: true } })
    await flushPromises()

    expect(wrapper.text()).toContain('Jeanne')
    expect(wrapper.text()).toContain('Aucun avis')
    await wrapper.get('button[aria-expanded="false"]').trigger('click')
    await flushPromises()

    expect(reviewApi.fetchUserReviews).toHaveBeenCalledWith('jeanne')
    expect(wrapper.text()).toContain('Aide aux courses')
  })

  it('stays hidden without anybody to show', async () => {
    reviewApi.fetchMyReputations.mockResolvedValue([])

    const wrapper = mount(ReceivedReviews)
    await flushPromises()

    expect(wrapper.find('section').exists()).toBe(false)
  })
})

describe('comments of the reviews', () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function buttonNamed(wrapper, name) {
    return wrapper.findAll('button').find((button) => button.text() === name)
  }

  it('sends an optional comment, 500 characters at most', async () => {
    reviewApi.submitReview.mockResolvedValue({})
    const wrapper = mount(ReviewDialog, { props: { missionId: 'mission-1', subject: 'Léa' }, attachTo: document.body })
    await wrapper.findAll('input[type="radio"]').at(4).setValue()
    expect(wrapper.text()).toContain("N'indiquez aucune information sur la santé ni aucun nom.")

    await wrapper.get('#review-comment').setValue('a'.repeat(501))
    expect(wrapper.get('#review-comment-count').text()).toBe('501 / 500')
    expect(buttonNamed(wrapper, 'Envoyer mon avis').attributes('disabled')).toBeDefined()

    await wrapper.get('#review-comment').setValue('Très patiente')
    await buttonNamed(wrapper, 'Envoyer mon avis').trigger('click')
    await flushPromises()

    expect(reviewApi.submitReview).toHaveBeenCalledWith('mission-1', 5, 'Très patiente', null)
  })

  const REVIEWS = [
    { id: 'r1', rating: 5, missionCategory: 'GROCERIES', createdAt: '2026-11-03T10:00:00Z', authorFirstName: 'Jeanne', comment: 'Très patiente', commentRemoved: false, reportable: true },
    { id: 'r2', rating: 3, missionCategory: 'GARDENING', createdAt: '2026-10-03T10:00:00Z', authorFirstName: 'Marcel', comment: null, commentRemoved: true, reportable: false },
  ]

  it('shows the first name of the author, the comment, or that it was removed', () => {
    const wrapper = mount(ReviewList, { props: { reviews: REVIEWS } })

    const items = wrapper.findAll('li')
    expect(items[0].text()).toContain('Jeanne')
    expect(items[0].text()).toContain('novembre 2026')
    expect(items[0].text()).toContain('« Très patiente »')
    expect(items[1].text()).toContain('Commentaire retiré')
    expect(items[1].text()).not.toContain('Signaler')
  })

  it('reports a comment with a reason', async () => {
    reviewApi.reportComment.mockResolvedValue()
    const wrapper = mount(ReviewList, { props: { reviews: REVIEWS }, attachTo: document.body })

    await buttonNamed(wrapper, 'Signaler ce commentaire').trigger('click')
    expect(buttonNamed(wrapper, 'Signaler').attributes('disabled')).toBeDefined()
    await wrapper.find('input[value="HEALTH_INFORMATION"]').setValue()
    await buttonNamed(wrapper, 'Signaler').trigger('click')
    await flushPromises()

    expect(reviewApi.reportComment).toHaveBeenCalledWith('r1', 'HEALTH_INFORMATION')
    expect(wrapper.text()).toContain('le commentaire est masqué')
    expect(wrapper.emitted('reported')).toHaveLength(1)
  })

  it('loads the reviews of a candidate on demand', async () => {
    reviewApi.fetchUserReviews.mockResolvedValue({ items: REVIEWS })
    const wrapper = mount(CandidateReviews, { props: { studentId: 'lea', firstName: 'Léa', reviewCount: 2 } })
    expect(reviewApi.fetchUserReviews).not.toHaveBeenCalled()

    await buttonNamed(wrapper, 'Lire les avis sur Léa (2)').trigger('click')
    await flushPromises()

    expect(reviewApi.fetchUserReviews).toHaveBeenCalledWith('lea')
    expect(wrapper.text()).toContain('Très patiente')
  })
})

describe('ModerationView', () => {
  const REPORTED = {
    reviewId: 'r1', rating: 2, comment: 'Elle a oublié mes médicaments', reason: 'HEALTH_INFORMATION',
    reportedAt: '2026-11-04T10:00:00Z', missionCategory: 'GROCERIES', authorFirstName: 'Jeanne', reviewedFirstName: 'Léa',
  }

  beforeEach(() => vi.resetAllMocks())
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function buttonNamed(wrapper, name) {
    return wrapper.findAll('button').filter((button) => button.text() === name).at(-1)
  }

  it('lists the reported comments with their reason', async () => {
    reviewApi.fetchReportedComments.mockResolvedValue([REPORTED])

    const wrapper = mount(ModerationView)
    await flushPromises()

    expect(wrapper.get('article h2').text()).toBe('Avis de Jeanne sur Léa')
    expect(wrapper.text()).toContain('Elle a oublié mes médicaments')
    expect(wrapper.text()).toContain('Motif : Information sur la santé')
  })

  it('removes a comment after a confirmation', async () => {
    reviewApi.fetchReportedComments.mockResolvedValueOnce([REPORTED]).mockResolvedValueOnce([])
    reviewApi.removeComment.mockResolvedValue()
    const wrapper = mount(ModerationView, { attachTo: document.body })
    await flushPromises()

    await buttonNamed(wrapper, 'Supprimer').trigger('click')
    expect(wrapper.text()).toContain('Supprimer ce commentaire ?')
    await buttonNamed(wrapper, 'Supprimer').trigger('click')
    await flushPromises()

    expect(reviewApi.removeComment).toHaveBeenCalledWith('r1')
    expect(wrapper.text()).toContain('Commentaire supprimé.')
    expect(wrapper.text()).toContain('Aucun commentaire signalé')
  })

  it('restores a comment', async () => {
    reviewApi.fetchReportedComments.mockResolvedValueOnce([REPORTED]).mockResolvedValueOnce([])
    reviewApi.restoreComment.mockResolvedValue()
    const wrapper = mount(ModerationView, { attachTo: document.body })
    await flushPromises()

    await buttonNamed(wrapper, 'Rétablir').trigger('click')
    await buttonNamed(wrapper, 'Rétablir').trigger('click')
    await flushPromises()

    expect(reviewApi.restoreComment).toHaveBeenCalledWith('r1')
  })

  it('leads a moderator to the moderation and keeps others out', () => {
    expect(resolveNavigation(appRouter.resolve('/'), { isAuthenticated: true, role: 'MODERATOR' })).toEqual({ name: 'moderation' })
    expect(resolveNavigation(appRouter.resolve('/missions'), { isAuthenticated: true, role: 'MODERATOR' })).toEqual({ name: 'moderation' })
    expect(resolveNavigation(appRouter.resolve('/moderation'), { isAuthenticated: true, role: 'MODERATOR' })).toBe(true)
    expect(resolveNavigation(appRouter.resolve('/moderation'), { isAuthenticated: true, role: 'BENEFICIARY' })).toEqual({ name: 'forbidden' })
  })
})

