import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import MyMissionsView from '@/views/MyMissionsView.vue'
import { useAuthStore } from '@/stores/auth'
import * as missionApi from '@/api/missionApi'
import * as profileApi from '@/api/profileApi'
import { validToken } from './tokens'

vi.mock('@/api/missionApi')
vi.mock('@/api/profileApi')

const EMPTY_PAGE = { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 }

async function mountView(role) {
  useAuthStore().token = validToken({ role })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/missions', name: 'my-missions', component: MyMissionsView },
      { path: '/missions/publier', name: 'publish-mission', component: { template: '<p>publier</p>' } },
      { path: '/profil', name: 'profile', component: { template: '<p>profil</p>' } },
    ],
  })
  await router.push('/missions')
  const wrapper = mount(MyMissionsView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('MyMissionsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    missionApi.fetchMyMissions.mockResolvedValue(EMPTY_PAGE)
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue({ complete: true })
  })

  it('lets a beneficiary add a mission', async () => {
    const { wrapper, router } = await mountView('BENEFICIARY')

    await wrapper.get('a[href="/missions/publier"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('publish-mission')
  })

  it('lets a caregiver add a mission for a person they accompany', async () => {
    const { wrapper } = await mountView('CAREGIVER')

    expect(wrapper.get('a[href="/missions/publier"]').text()).toBe('Ajouter une mission')
    expect(wrapper.get('#publish-mission-title').text()).toBe('Un coup de main pour la personne que vous accompagnez ?')
  })

  it('invites the beneficiary to publish in a panel with a decorative illustration', async () => {
    const { wrapper } = await mountView('BENEFICIARY')

    const panel = wrapper.get('section[aria-labelledby="publish-mission-title"]')
    expect(panel.classes()).toContain('panel')
    expect(panel.get('h2').text()).toBe('Besoin d’un coup de main ?')
    expect(panel.get('svg').attributes('aria-hidden')).toBe('true')
    expect(panel.find('a[href="/missions/publier"]').exists()).toBe(true)
  })

  it('leads a beneficiary without presentation to their profile before publishing', async () => {
    profileApi.fetchMyBeneficiaryProfile.mockResolvedValue({ complete: false })

    const { wrapper } = await mountView('BENEFICIARY')

    const panel = wrapper.get('section[aria-labelledby="publish-mission-title"]')
    expect(panel.find('a[href="/missions/publier"]').exists()).toBe(false)
    expect(panel.get('a[href="/profil"]').text()).toBe('Compléter mon profil')
    expect(panel.text()).toContain('l\'étudiant que vous choisirez lira votre présentation')
  })

  it('reads no profile for a caregiver, who publishes without presentation', async () => {
    const { wrapper } = await mountView('CAREGIVER')

    expect(profileApi.fetchMyBeneficiaryProfile).not.toHaveBeenCalled()
    expect(wrapper.find('a[href="/missions/publier"]').exists()).toBe(true)
  })
})
