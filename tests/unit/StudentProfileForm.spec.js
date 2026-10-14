import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StudentProfileForm from '@/components/profile/StudentProfileForm.vue'
import * as profileApi from '@/api/profileApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/profileApi')

const PRESENTATION = 'Étudiante en lettres, j’aime discuter, lire à voix haute et jouer aux cartes. '.repeat(4).trim()

function profile(overrides = {}) {
  return {
    id: 'lea',
    firstName: 'Léa',
    lastName: 'Martin',
    age: null,
    birthDate: null,
    address: null,
    sex: 'NOT_SPECIFIED',
    studyLevel: null,
    school: 'Université de Lille',
    skills: [],
    hasPhoto: false,
    complete: false,
    verified: true,
    ...overrides,
  }
}

const COMPLETE = profile({
  age: 21,
  birthDate: '2005-03-15',
  address: { street: '10 rue Solférino', postalCode: '59000', city: 'Lille' },
  sex: 'FEMALE',
  studyLevel: 'BAC_3',
  skills: ['CONVERSATION', 'WALK'],
  hasPhoto: true,
  complete: true,
  presentation: PRESENTATION,
})

async function mountView() {
  const wrapper = mount(StudentProfileForm)
  await flushPromises()
  return wrapper
}

function checkbox(wrapper, label) {
  return wrapper.findAll('label').find((candidate) => candidate.text() === label).get('input')
}

describe('StudentProfileForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    profileApi.fetchStudentPhoto.mockRejectedValue(new ApiError(404, 'No photo'))
  })

  it('lists what is missing to apply', async () => {
    profileApi.fetchMyProfile.mockResolvedValue(profile())

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Léa Martin')
    expect(wrapper.text()).toContain('il manque votre photo, au moins une compétence, votre date de naissance, votre adresse, votre niveau d’études, votre présentation')
    expect(wrapper.find('#birth-date').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ajouter ma photo')
  })

  it('saves the profile with the birth date the first time', async () => {
    // Given
    profileApi.fetchMyProfile.mockResolvedValue(profile())
    profileApi.updateMyProfile.mockResolvedValue({ ...COMPLETE, hasPhoto: false, complete: false })
    const wrapper = await mountView()

    // When
    await wrapper.get('#birth-date').setValue('2005-03-15')
    await wrapper.get('#study-level').setValue('BAC_3')
    await wrapper.get('#sex').setValue('FEMALE')
    await wrapper.get('#street').setValue('10 rue Solférino')
    await wrapper.get('#postal-code').setValue('59000')
    await wrapper.get('#city').setValue('Lille')
    await checkbox(wrapper, 'Conversation et compagnie').setValue(true)
    await checkbox(wrapper, 'Promenade, y compris en poussant un fauteuil roulant').setValue(true)
    await wrapper.get('#presentation').setValue(`  ${PRESENTATION}  `)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    // Then
    expect(profileApi.updateMyProfile).toHaveBeenCalledWith({
      birthDate: '2005-03-15',
      address: { street: '10 rue Solférino', postalCode: '59000', city: 'Lille' },
      sex: 'FEMALE',
      studyLevel: 'BAC_3',
      skills: ['CONVERSATION', 'WALK'],
      presentation: PRESENTATION,
    })
    expect(wrapper.text()).toContain('Votre profil est enregistré.')
    expect(wrapper.text()).toContain('21 ans')
    expect(wrapper.find('#birth-date').exists()).toBe(false)
  })

  it('never sends the birth date again once known', async () => {
    profileApi.fetchMyProfile.mockResolvedValue(COMPLETE)
    profileApi.updateMyProfile.mockResolvedValue(COMPLETE)
    const wrapper = await mountView()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(profileApi.updateMyProfile.mock.calls[0][0]).not.toHaveProperty('birthDate')
    expect(wrapper.text()).not.toContain('il manque')
  })

  it('asks for at least one skill before sending', async () => {
    profileApi.fetchMyProfile.mockResolvedValue({ ...COMPLETE, skills: [] })
    const wrapper = await mountView()

    await wrapper.get('form').trigger('submit')

    expect(profileApi.updateMyProfile).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toBe('Choisissez au moins une compétence.')
  })

  it('explains a refused birth date', async () => {
    profileApi.fetchMyProfile.mockResolvedValue(profile({ skills: ['CONVERSATION'], presentation: PRESENTATION }))
    profileApi.updateMyProfile.mockRejectedValue(new ApiError(400, 'Too young', 'UNDERAGE'))
    const wrapper = await mountView()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Il faut avoir au moins 18 ans pour proposer son aide sur Geen.')
  })

  it('uploads a photo and refuses another format or a too large file', async () => {
    // Given
    profileApi.fetchMyProfile.mockResolvedValueOnce(profile()).mockResolvedValueOnce(profile({ hasPhoto: true }))
    profileApi.uploadMyPhoto.mockResolvedValue()
    const wrapper = await mountView()
    const input = wrapper.get('input[type="file"]')

    // When: a PDF, then a 6 MB JPEG, then a valid PNG
    for (const file of [
      new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }),
      new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' }),
      new File(['png'], 'lea.png', { type: 'image/png' }),
    ]) {
      Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
      await input.trigger('change')
      await flushPromises()
      if (file.name === 'cv.pdf') {
        expect(wrapper.text()).toContain('La photo doit être au format JPEG ou PNG.')
      }
      if (file.name === 'big.jpg') {
        expect(wrapper.text()).toContain('La photo ne doit pas dépasser 5 Mo.')
      }
    }

    // Then
    expect(profileApi.uploadMyPhoto).toHaveBeenCalledTimes(1)
    expect(profileApi.uploadMyPhoto.mock.calls[0][0].name).toBe('lea.png')
    expect(wrapper.text()).toContain('Votre photo est enregistrée.')
    expect(wrapper.text()).toContain('Changer ma photo')
  })

  it('asks for a presentation of 300 characters at least, with a counter', async () => {
    // Given
    profileApi.fetchMyProfile.mockResolvedValue({ ...COMPLETE, presentation: null })
    const wrapper = await mountView()
    const field = wrapper.get('#presentation')
    expect(field.attributes('aria-describedby')).toContain('presentation-count')
    expect(wrapper.text()).toContain("N'indiquez aucune information sur votre santé ou un handicap.")

    // When
    await field.setValue('Bonjour, je suis Léa.')
    await wrapper.get('form').trigger('submit')

    // Then
    expect(profileApi.updateMyProfile).not.toHaveBeenCalled()
    expect(wrapper.get('#presentation-count').text()).toBe('21 caractères : encore 279 au minimum')
    expect(wrapper.text()).toContain('Votre présentation doit faire au moins 300 caractères : il en manque 279.')
    expect(field.attributes('aria-invalid')).toBe('true')
  })
})
