import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import EmailVerificationBanner from '@/components/EmailVerificationBanner.vue'
import * as authApi from '@/api/authApi'
import { ApiError } from '@/api/apiError'
import { useAuthStore } from '@/stores/auth'
import { useEmailVerification } from '@/composables/useEmailVerification'
import { validToken } from './tokens'

vi.mock('@/api/authApi')

// Spec 018
async function mountAt(component, path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<p>tableau</p>' } },
      { path: '/login', name: 'login', component: { template: '<p>connexion</p>' } },
      { path: '/mot-de-passe-oublie', name: 'forgot-password', component: ForgotPasswordView },
      { path: '/reinitialiser-mot-de-passe', name: 'reset-password', component: ResetPasswordView },
      { path: '/verifier-email', name: 'verify-email', component: VerifyEmailView },
    ],
  })
  await router.push(path)
  const wrapper = mount(component, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('account recovery', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    useEmailVerification().forget()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('asks for a reset link and tells nothing about the account', async () => {
    authApi.requestPasswordReset.mockResolvedValue()
    const wrapper = await mountAt(ForgotPasswordView, '/mot-de-passe-oublie')

    await wrapper.get('#email').setValue(' lea@example.fr ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authApi.requestPasswordReset).toHaveBeenCalledWith('lea@example.fr')
    expect(wrapper.text()).toContain('Si un compte existe pour cette adresse, un e-mail vient de partir.')
  })

  it('chooses a new password with the token of the link, 12 characters at least', async () => {
    authApi.resetPassword.mockResolvedValue()
    const wrapper = await mountAt(ResetPasswordView, '/reinitialiser-mot-de-passe?token=abc')

    await wrapper.get('#password').setValue('court')
    await wrapper.get('form').trigger('submit')
    expect(authApi.resetPassword).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('au moins 12 caractères')

    await wrapper.get('#password').setValue('un-nouveau-mot-de-passe')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authApi.resetPassword).toHaveBeenCalledWith('abc', 'un-nouveau-mot-de-passe')
    expect(wrapper.text()).toContain('Votre mot de passe est changé.')
  })

  it('explains a link used or expired', async () => {
    authApi.resetPassword.mockRejectedValue(new ApiError(400, 'Invalid', 'INVALID_LINK'))
    const wrapper = await mountAt(ResetPasswordView, '/reinitialiser-mot-de-passe?token=abc')

    await wrapper.get('#password').setValue('un-nouveau-mot-de-passe')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Ce lien n’est plus valable')
    expect(wrapper.find('a[href="/mot-de-passe-oublie"]').exists()).toBe(true)
  })

  it('verifies the address with the link and hides the banner', async () => {
    useAuthStore().token = validToken({ role: 'STUDENT' })
    authApi.fetchEmailVerification
      .mockResolvedValueOnce({ email: 'tom@example.fr', verified: false })
      .mockResolvedValueOnce({ email: 'tom@example.fr', verified: true })
    authApi.confirmEmail.mockResolvedValue()
    const banner = await mountAt(EmailVerificationBanner, '/')
    expect(banner.text()).toContain('Vérifiez votre adresse e-mail pour proposer votre aide')

    await mountAt(VerifyEmailView, '/verifier-email?token=xyz')
    await flushPromises()

    expect(authApi.confirmEmail).toHaveBeenCalledWith('xyz')
    expect(banner.text()).toBe('')
  })

  it('sends the verification again from the banner', async () => {
    useAuthStore().token = validToken({ role: 'BENEFICIARY' })
    authApi.fetchEmailVerification.mockResolvedValue({ email: 'jeanne@example.fr', verified: false })
    authApi.resendEmailVerification.mockResolvedValue()
    const banner = await mountAt(EmailVerificationBanner, '/')

    expect(banner.text()).toContain('pour publier une mission')
    await banner.get('button').trigger('click')
    await flushPromises()

    expect(authApi.resendEmailVerification).toHaveBeenCalled()
    expect(banner.text()).toContain('E-mail renvoyé.')
  })

  it('shows nothing to a moderator', async () => {
    useAuthStore().token = validToken({ role: 'MODERATOR' })
    const banner = await mountAt(EmailVerificationBanner, '/')

    expect(authApi.fetchEmailVerification).not.toHaveBeenCalled()
    expect(banner.text()).toBe('')
  })
})
