import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import RegisterChoiceView from '@/views/RegisterChoiceView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
import * as geocodingApi from '@/api/geocodingApi'
import * as authApi from '@/api/authApi'
import { ApiError } from '@/api/apiError'
import { validateBeneficiary, validateStudent } from '@/registration/registrationForm'
import { validToken } from './tokens'

vi.mock('@/api/geocodingApi')
vi.mock('@/api/authApi')

const PAGE = { template: '<p>page</p>' }

async function mountWithRouter(component, props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: PAGE },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/inscription', name: 'register', component: RegisterChoiceView },
      { path: '/inscription/etudiant', name: 'register-student', component: PAGE },
      { path: '/inscription/beneficiaire', name: 'register-beneficiary', component: PAGE },
      { path: '/profil', name: 'profile', component: PAGE },
    ],
  })
  await router.push('/inscription')
  const wrapper = mount(component, { props, global: { plugins: [router] } })
  return { wrapper, router }
}

async function fill(wrapper, values) {
  for (const [id, value] of Object.entries(values)) {
    await wrapper.get(`#${id}`).setValue(value)
  }
}

const ACCOUNT = { 'first-name': 'Léa', 'last-name': 'Martin', email: 'lea@univ-lille.fr', password: 'mot-de-passe-solide' }

describe('registration rules', () => {
  it('requires every field of a student and a password of 12 characters', () => {
    expect(Object.keys(validateStudent({ firstName: '', lastName: '', email: 'lea', password: 'court', school: '', postalCode: '590', city: '' })))
      .toEqual(['firstName', 'lastName', 'email', 'password', 'postalCode', 'city', 'school'])
  })

  it('checks the French phone number of a beneficiary', () => {
    const beneficiary = { firstName: 'Jeanne', lastName: 'Dupont', email: 'jeanne@mail.fr', password: 'mot-de-passe-solide', street: '12 rue de Lens', postalCode: '59000', city: 'Lille' }

    expect(validateBeneficiary({ ...beneficiary, phone: '06 12 34 56 78' })).toEqual({})
    expect(validateBeneficiary({ ...beneficiary, phone: '+33 6 12 34 56 78' })).toEqual({})
    expect(validateBeneficiary({ ...beneficiary, phone: '12345' })).toHaveProperty('phone')
  })
})

describe('registration pages', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('offers to create an account from the login page', async () => {
    const { wrapper } = await mountWithRouter(LoginView)

    expect(wrapper.get('a[href="/inscription"]').text()).toBe('Créer un compte')
  })

  it('asks first whether one is a student or a beneficiary', async () => {
    const { wrapper } = await mountWithRouter(RegisterChoiceView)

    expect(wrapper.get('a[href="/inscription/etudiant"]').text()).toContain('Je suis étudiant')
    expect(wrapper.get('a[href="/inscription/beneficiaire"]').text()).toContain('Je suis bénéficiaire')
  })

  it('registers a student with the center of their city, then leads to their profile', async () => {
    // Given
    geocodingApi.geocodeCity.mockResolvedValue({ label: 'Lille', latitude: 50.6292, longitude: 3.0573 })
    authApi.register.mockResolvedValue({ id: 'lea', role: 'STUDENT', verified: false })
    authApi.login.mockResolvedValue({ accessToken: validToken({ role: 'STUDENT' }) })
    const { wrapper, router } = await mountWithRouter(RegisterView, { role: 'STUDENT' })
    expect(wrapper.find('#phone').exists()).toBe(false)

    // When
    await fill(wrapper, { ...ACCOUNT, school: 'Université de Lille', 'postal-code': '59000', city: 'Lille' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    // Then
    expect(geocodingApi.geocodeCity).toHaveBeenCalledWith(expect.objectContaining({ postalCode: '59000', city: 'Lille' }))
    expect(authApi.register).toHaveBeenCalledWith('STUDENT', {
      firstName: 'Léa', lastName: 'Martin', email: 'lea@univ-lille.fr', password: 'mot-de-passe-solide',
      school: 'Université de Lille', postalCode: '59000', city: 'Lille', radiusKm: 10, latitude: 50.6292, longitude: 3.0573,
    })
    expect(useAuthStore().isAuthenticated).toBe(true)
    expect(router.currentRoute.value.name).toBe('profile')
  })

  it('registers a beneficiary with their address and phone', async () => {
    authApi.register.mockResolvedValue({ id: 'jeanne', role: 'BENEFICIARY' })
    authApi.login.mockResolvedValue({ accessToken: validToken({ role: 'BENEFICIARY' }) })
    const { wrapper, router } = await mountWithRouter(RegisterView, { role: 'BENEFICIARY' })
    expect(wrapper.find('#school').exists()).toBe(false)

    await fill(wrapper, { ...ACCOUNT, phone: '03 20 12 34 56', street: '12 rue de Lens', 'postal-code': '59000', city: 'Lille' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authApi.register).toHaveBeenCalledWith('BENEFICIARY', {
      firstName: 'Léa', lastName: 'Martin', email: 'lea@univ-lille.fr', password: 'mot-de-passe-solide',
      phone: '03 20 12 34 56', address: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille' },
    })
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('shows the errors next to the fields without sending anything', async () => {
    const { wrapper } = await mountWithRouter(RegisterView, { role: 'BENEFICIARY' })

    await fill(wrapper, { ...ACCOUNT, password: 'court' })
    await wrapper.get('form').trigger('submit')

    expect(authApi.register).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Le mot de passe doit contenir au moins 12 caractères.')
    expect(wrapper.get('#password').attributes('aria-invalid')).toBe('true')
  })

  it('explains an e-mail already used', async () => {
    authApi.register.mockRejectedValue(new ApiError(409, 'Email already used'))
    const { wrapper } = await mountWithRouter(RegisterView, { role: 'BENEFICIARY' })

    await fill(wrapper, { ...ACCOUNT, phone: '0320123456', street: '12 rue de Lens', 'postal-code': '59000', city: 'Lille' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Un compte existe déjà avec cette adresse e-mail.')
  })

  it('explains a city that cannot be found', async () => {
    geocodingApi.geocodeCity.mockResolvedValue(null)
    const { wrapper } = await mountWithRouter(RegisterView, { role: 'STUDENT' })

    await fill(wrapper, { ...ACCOUNT, school: 'Université de Lille', 'postal-code': '59000', city: 'Lilel' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authApi.register).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Ville introuvable pour ce code postal')
  })
})
