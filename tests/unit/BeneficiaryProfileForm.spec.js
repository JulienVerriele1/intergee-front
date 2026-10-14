import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BeneficiaryProfileForm from '@/components/profile/BeneficiaryProfileForm.vue'
import ProfileView from '@/views/ProfileView.vue'
import { useAuthStore } from '@/stores/auth'
import * as profileApi from '@/api/profileApi'
import { validToken } from './tokens'

vi.mock('@/api/profileApi')
vi.mock('@/api/geocodingApi')

const PRESENTATION = 'Institutrice à la retraite, j’aime les livres et les longues conversations autour d’un thé. '.repeat(4).trim()

function profile(overrides = {}) {
  return {
    id: 'jeanne',
    firstName: 'Jeanne',
    lastName: 'Dupont',
    email: 'jeanne@example.fr',
    phone: '+33320123456',
    address: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille' },
    presentation: null,
    complete: false,
    ...overrides,
  }
}

async function mountForm() {
  const wrapper = mount(BeneficiaryProfileForm, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('BeneficiaryProfileForm', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows the identity and asks for the presentation needed to publish', async () => {
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue(profile())

    const wrapper = await mountForm()

    expect(wrapper.text()).toContain('Jeanne Dupont')
    expect(wrapper.text()).toContain('jeanne@example.fr')
    expect(wrapper.get('#phone').element.value).toBe('03 20 12 34 56')
    expect(wrapper.get('#city').element.value).toBe('Lille')
    expect(wrapper.text()).toContain('Ajoutez votre présentation pour pouvoir publier des missions.')
    expect(wrapper.text()).toContain("Seul l'étudiant que vous choisissez pour une mission la lit.")
    wrapper.unmount()
  })

  it('saves the phone, the address and the presentation', async () => {
    // Given
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue(profile())
    profileApi.updateMyBeneficiaryProfile.mockResolvedValue(profile({ presentation: PRESENTATION, complete: true }))
    const wrapper = await mountForm()

    // When
    await wrapper.get('#phone').setValue('06 12 34 56 78')
    await wrapper.get('#presentation').setValue(PRESENTATION)
    await wrapper.findAll('input[type="checkbox"]').find((box) => box.element.closest('label').textContent.includes('inscrit au CESU')).setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    // Then
    expect(profileApi.updateMyBeneficiaryProfile).toHaveBeenCalledWith({
      phone: '06 12 34 56 78',
      address: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille' },
      presentation: PRESENTATION,
      cesuRegistered: true,
    })
    expect(wrapper.text()).toContain('Votre profil est enregistré.')
    expect(wrapper.text()).not.toContain('Ajoutez votre présentation')
    wrapper.unmount()
  })

  it('points out the fields to correct before sending', async () => {
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue(profile())
    const wrapper = await mountForm()

    await wrapper.get('#phone').setValue('12')
    await wrapper.get('#presentation').setValue('Trop court.')
    await wrapper.get('form').trigger('submit')

    expect(profileApi.updateMyBeneficiaryProfile).not.toHaveBeenCalled()
    expect(wrapper.get('#phone').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#presentation').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Saisissez un numéro français')
    expect(wrapper.text()).toContain('il en manque 289')
    wrapper.unmount()
  })
})

describe('ProfileView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('shows the form of the beneficiary, or of the student', async () => {
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue(profile())
    profileApi.fetchStudentPhoto.mockRejectedValue(new Error('No photo'))
    profileApi.fetchMyProfile.mockResolvedValue({
      id: 'lea', firstName: 'Léa', lastName: 'Martin', school: 'Université de Lille', skills: [], sex: 'NOT_SPECIFIED',
      hasPhoto: false, complete: false, verified: true,
    })

    useAuthStore().token = validToken({ role: 'BENEFICIARY' })
    const beneficiaryView = mount(ProfileView)
    await flushPromises()
    expect(beneficiaryView.findComponent(BeneficiaryProfileForm).exists()).toBe(true)

    useAuthStore().token = validToken({ role: 'STUDENT' })
    const studentView = mount(ProfileView)
    await flushPromises()
    expect(studentView.findComponent(BeneficiaryProfileForm).exists()).toBe(false)
    expect(studentView.text()).toContain('Mes compétences')
  })
})
