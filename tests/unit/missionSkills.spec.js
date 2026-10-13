import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'
import MissionCard from '@/components/missions/MissionCard.vue'
import { skillFamiliesForCategory } from '@/constants/profileOptions'

vi.mock('@/api/missionApi')
vi.mock('@/api/geocodingApi')

describe('skills of a mission', () => {
  it('offers the skills of the category only', () => {
    expect(skillFamiliesForCategory('IT_HELP').map((family) => family.value)).toEqual(['IT_HELP'])
    expect(skillFamiliesForCategory('ACCESSIBILITY')[0].skills.map((skill) => skill.value)).toEqual(['FRENCH_SIGN_LANGUAGE', 'MAIL_READING'])
  })

  describe('publication form', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(MissionPublishForm, { attachTo: document.body })
    })

    afterEach(() => wrapper.unmount())

    function skillsFieldset() {
      return wrapper.findAll('fieldset').find((fieldset) => fieldset.find('legend').text().includes('Compétences nécessaires'))
    }

    function skillLabels() {
      return skillsFieldset().findAll('label').map((label) => label.text())
    }

    it('asks for the skills once a category is chosen', async () => {
      expect(skillsFieldset()).toBeUndefined()

      await wrapper.get('#category').setValue('IT_HELP')

      expect(skillsFieldset()).toBeDefined()
      expect(skillLabels()).toContain('Utiliser un smartphone ou une tablette')
      expect(skillLabels()).not.toContain('Langue des signes française (LSF)')
      expect(skillLabels()).not.toContain('Petits travaux de jardinage')
    })

    it('offers the accessibility skills for the accessibility category', async () => {
      await wrapper.get('#category').setValue('ACCESSIBILITY')

      expect(skillLabels()).toEqual(['Langue des signes française (LSF)', 'Lecture et tri du courrier'])
    })

    it('drops the skills the new category does not allow', async () => {
      await wrapper.get('#category').setValue('IT_HELP')
      const checkbox = (label) => skillsFieldset().findAll('label').find((candidate) => candidate.text() === label).get('input')
      await checkbox('Utiliser un smartphone ou une tablette').setValue(true)

      await wrapper.get('#category').setValue('GARDENING')
      await flushPromises()

      expect(skillsFieldset().findAll('input:checked')).toHaveLength(0)
    })
  })

  describe('mission card', () => {
    const mission = {
      id: 'mission-1',
      title: 'Aide numérique',
      category: 'IT_HELP',
      description: 'Apprendre à faire des appels vidéo',
      scheduledAt: '2026-12-05T08:00:00Z',
      durationMinutes: 60,
      postalCode: '59000',
      city: 'Lille',
      distanceKm: 2,
      reward: 15,
      alreadyApplied: false,
      requiredSkills: ['SMARTPHONE_TABLET', 'VIDEO_CALLS'],
      matchingSkills: ['VIDEO_CALLS'],
    }

    it('shows the required skills, those of the student first', () => {
      const card = mount(MissionCard, { props: { mission } })

      const skills = card.findAll('li').map((item) => item.text())
      expect(skills[0]).toContain('Appels vidéo avec les proches')
      expect(skills[0]).toContain('(vous avez cette compétence)')
      expect(skills[1]).toBe('Utiliser un smartphone ou une tablette')
      expect(card.text()).toContain('Correspond à vos compétences')
    })

    it('shows no skill section for a mission published before the skills', () => {
      const card = mount(MissionCard, { props: { mission: { ...mission, requiredSkills: [], matchingSkills: [] } } })

      expect(card.text()).not.toContain('Compétences demandées')
    })
  })
})
