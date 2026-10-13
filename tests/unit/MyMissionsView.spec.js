import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import MyMissionsView from '@/views/MyMissionsView.vue'
import { useAuthStore } from '@/stores/auth'
import * as missionApi from '@/api/missionApi'
import { validToken } from './tokens'

vi.mock('@/api/missionApi')

const EMPTY_PAGE = { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 }

async function mountView(role) {
  useAuthStore().token = validToken({ role })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/missions', name: 'my-missions', component: MyMissionsView },
      { path: '/missions/publier', name: 'publish-mission', component: { template: '<p>publier</p>' } },
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
    missionApi.fetchMyApplications.mockResolvedValue(EMPTY_PAGE)
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
  })

  it('offers no mission to add to a student', async () => {
    const { wrapper } = await mountView('STUDENT')

    expect(wrapper.find('a[href="/missions/publier"]').exists()).toBe(false)
  })
})
