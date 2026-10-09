import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StarRating from '@/components/reviews/StarRating.vue'
import StarRatingInput from '@/components/reviews/StarRatingInput.vue'
import ReviewDialog from '@/components/reviews/ReviewDialog.vue'
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

    expect(reviewApi.submitReview).toHaveBeenCalledWith('mission-1', 5)
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
