import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import LocalModePanel from '@/dev/LocalModePanel.vue'
import DevRoleSwitch from '@/dev/DevRoleSwitch.vue'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/authApi'
import { ApiError } from '@/api/apiError'
import { validToken } from './tokens'

vi.mock('@/api/authApi')

async function mountWithRouter(component) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<p>dashboard</p>' } },
      { path: '/login', name: 'login', component: { template: '<p>login</p>' } },
    ],
  })
  await router.push('/login')
  const wrapper = mount(component, { global: { plugins: [router] } })
  return { wrapper, router }
}

function buttonContaining(wrapper, text) {
  return wrapper.findAll('button').find((button) => button.text().includes(text))
}

describe('local mode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('continues as the demo student without typing credentials', async () => {
    authApi.login.mockResolvedValue({ accessToken: validToken({ role: 'STUDENT' }) })
    const { wrapper, router } = await mountWithRouter(LocalModePanel)

    await buttonContaining(wrapper, 'étudiant').trigger('click')
    await flushPromises()

    expect(authApi.login).toHaveBeenCalledWith('etudiant@demo.intergee.fr', 'demo-intergee-local')
    expect(useAuthStore().role).toBe('STUDENT')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('continues as the demo beneficiary', async () => {
    authApi.login.mockResolvedValue({ accessToken: validToken({ role: 'BENEFICIARY' }) })
    const { wrapper } = await mountWithRouter(LocalModePanel)

    await buttonContaining(wrapper, 'bénéficiaire').trigger('click')
    await flushPromises()

    expect(authApi.login).toHaveBeenCalledWith('beneficiaire@demo.intergee.fr', 'demo-intergee-local')
  })

  it('explains that the API must run with the local profile', async () => {
    authApi.login.mockRejectedValue(new ApiError(401, 'Unauthorized'))
    const { wrapper } = await mountWithRouter(LocalModePanel)

    await buttonContaining(wrapper, 'bénéficiaire').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('démarrez le back avec le profil local')
  })

  it('switches from the student to the beneficiary', async () => {
    useAuthStore().token = validToken({ role: 'STUDENT' })
    authApi.login.mockResolvedValue({ accessToken: validToken({ role: 'BENEFICIARY' }) })
    const { wrapper, router } = await mountWithRouter(DevRoleSwitch)

    await buttonContaining(wrapper, 'Passer en bénéficiaire').trigger('click')
    await flushPromises()

    expect(authApi.login).toHaveBeenCalledWith('beneficiaire@demo.intergee.fr', 'demo-intergee-local')
    expect(useAuthStore().role).toBe('BENEFICIARY')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
