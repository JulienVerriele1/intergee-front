import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import * as authApi from '@/api/authApi'
import { ApiError } from '@/api/apiError'
import { validToken } from './tokens'

vi.mock('@/api/authApi')

async function mountLoginView(initialPath = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: LoginView },
      { path: '/', name: 'dashboard', component: { template: '<p>dashboard</p>' } },
      { path: '/elsewhere', component: { template: '<p>elsewhere</p>' } },
    ],
  })
  await router.push(initialPath)
  const wrapper = mount(LoginView, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('logs in and goes back to the requested page', async () => {
    authApi.login.mockResolvedValue({ accessToken: validToken() })
    const { wrapper, router } = await mountLoginView('/login?redirect=/elsewhere')

    await wrapper.get('#email').setValue('lea@univ.fr')
    await wrapper.get('#password').setValue('correct-horse-battery')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/elsewhere')
  })

  it('ignores an external redirect', async () => {
    authApi.login.mockResolvedValue({ accessToken: validToken() })
    const { wrapper, router } = await mountLoginView('/login?redirect=//evil.example')

    await wrapper.get('#email').setValue('lea@univ.fr')
    await wrapper.get('#password').setValue('correct-horse-battery')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('announces wrong credentials and clears the password', async () => {
    authApi.login.mockRejectedValue(new ApiError(401, 'Invalid credentials'))
    const { wrapper } = await mountLoginView()

    await wrapper.get('#email').setValue('lea@univ.fr')
    await wrapper.get('#password').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Adresse e-mail ou mot de passe incorrect.')
    expect(wrapper.get('#password').element.value).toBe('')
  })

  it('associates every input with a label', async () => {
    const { wrapper } = await mountLoginView()

    for (const id of ['email', 'password']) {
      expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
    }
  })
})
