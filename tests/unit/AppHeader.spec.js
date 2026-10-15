import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { router as appRouter } from '@/router'
import { resolveNavigation } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import * as reviewApi from '@/api/reviewApi'
import { validToken } from './tokens'

vi.mock('@/api/reviewApi')

async function mountHeader(role) {
  useAuthStore().token = validToken({ role })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<p>dashboard</p>' } },
      { path: '/missions', name: 'my-missions', component: { template: '<p>missions</p>' } },
      { path: '/profil', name: 'profile', component: { template: '<p>profil</p>' } },
      { path: '/faq', name: 'faq', component: { template: '<p>faq</p>' } },
      { path: '/declarations', name: 'declarations', component: { template: '<p>declarations</p>' } },
      { path: '/notifications', name: 'notifications', component: { template: '<p>notifications</p>' } },
    ],
  })
  await router.push('/')
  const wrapper = mount(AppHeader, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

// Links to a list of missions, outside the account menu
function missionLinks(wrapper) {
  return wrapper.findAll('a[href="/missions"]').map((link) => link.text())
}

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    reviewApi.fetchMyReputations.mockResolvedValue([])
  })

  it('offers no link to the missions, whatever the role: the logo leads to them', async () => {
    for (const role of ['STUDENT', 'BENEFICIARY', 'CAREGIVER']) {
      expect(missionLinks(await mountHeader(role))).toEqual([])
    }
  })

  it('sends a student who opens the missions page to the dashboard', () => {
    const missions = appRouter.resolve('/missions')

    expect(resolveNavigation(missions, { isAuthenticated: true, role: 'STUDENT' })).toEqual({ name: 'dashboard' })
    expect(resolveNavigation(missions, { isAuthenticated: true, role: 'BENEFICIARY' })).toBe(true)
  })

  it('shows the CESU declarations next to the theme toggle, to employers only', async () => {
    for (const [role, expected] of [['BENEFICIARY', true], ['CAREGIVER', true], ['STUDENT', false]]) {
      const wrapper = await mountHeader(role)
      const link = wrapper.find('a[href="/declarations"]')
      expect(link.exists()).toBe(expected)
      if (expected) {
        expect(link.text()).toBe('Déclaration CESU')
        // Right before the theme toggle, outside the burger menu
        expect(link.element.nextElementSibling.getAttribute('aria-label')).toMatch(/thème|mode/i)
        expect(wrapper.find('[aria-label="Compte"] a[href="/declarations"]').exists()).toBe(false)
      }
    }
  })
})
