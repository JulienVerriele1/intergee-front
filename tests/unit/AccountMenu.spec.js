import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AccountMenu from '@/components/AccountMenu.vue'
import { useAuthStore } from '@/stores/auth'
import * as reviewApi from '@/api/reviewApi'
import { validToken } from './tokens'

vi.mock('@/api/reviewApi')

const LEA = '5a1d3c2b-4e6f-4a8b-9c0d-1e2f3a4b5c6d'

async function mountMenu(role) {
  useAuthStore().token = validToken({ role, sub: LEA })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<p>dashboard</p>' } },
      { path: '/profil', name: 'profile', component: { template: '<p>profil</p>' } },
      { path: '/faq', name: 'faq', component: { template: '<p>faq</p>' } },
      { path: '/declarations', name: 'declarations', component: { template: '<p>declarations</p>' } },
    ],
  })
  await router.push('/')
  const wrapper = mount(AccountMenu, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

describe('AccountMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    reviewApi.fetchMyReputations.mockResolvedValue([{ userId: LEA, firstName: 'Léa', averageRating: 4.5, reviewCount: 2 }])
  })

  it('opens on the burger button with the profile link, the received reviews and the logout of a student', async () => {
    // Given
    const { wrapper } = await mountMenu('STUDENT')
    const trigger = wrapper.get('button[aria-label="Menu du compte"]')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    // When
    await trigger.trigger('click')

    // Then
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Léa')
    expect(wrapper.get('a[href="/profil"]').text()).toContain('Mon profil')
    expect(wrapper.text()).toContain('Avis reçus')
    expect(wrapper.text()).toContain('Se déconnecter')
    wrapper.unmount()
  })

  it('offers their profile to a beneficiary, not to a caregiver', async () => {
    const { wrapper } = await mountMenu('BENEFICIARY')
    await wrapper.get('button[aria-label="Menu du compte"]').trigger('click')
    expect(wrapper.find('a[href="/profil"]').exists()).toBe(true)
    wrapper.unmount()

    const { wrapper: caregiverMenu } = await mountMenu('CAREGIVER')
    await caregiverMenu.get('button[aria-label="Menu du compte"]').trigger('click')
    expect(caregiverMenu.find('a[href="/profil"]').exists()).toBe(false)
    caregiverMenu.unmount()
  })

  it('offers to log out', async () => {
    const { wrapper } = await mountMenu('BENEFICIARY')

    await wrapper.get('button[aria-label="Menu du compte"]').trigger('click')

    expect(wrapper.text()).toContain('Se déconnecter')
    wrapper.unmount()
  })

  it('logs out', async () => {
    const { wrapper } = await mountMenu('STUDENT')
    await wrapper.get('button[aria-label="Menu du compte"]').trigger('click')

    await wrapper.findAll('button').find((button) => button.text() === 'Se déconnecter').trigger('click')

    expect(useAuthStore().isAuthenticated).toBe(false)
    wrapper.unmount()
  })

  it('shows no reviews to a moderator, who is never reviewed', async () => {
    const { wrapper } = await mountMenu('MODERATOR')
    await wrapper.get('button[aria-label="Menu du compte"]').trigger('click')

    expect(wrapper.text()).toContain('Modérateur')
    expect(reviewApi.fetchMyReputations).not.toHaveBeenCalled()
    expect(wrapper.find('a[href="/profil"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
