import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import FaqView from '@/views/FaqView.vue'
import { useAuthStore } from '@/stores/auth'
import { FAQ } from '@/faq/faqContent'
import { validToken } from './tokens'

async function mountFaq(path = '/faq') {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/faq', name: 'faq', component: FaqView }] })
  await router.push(path)
  const wrapper = mount(FaqView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

function pressed(wrapper) {
  return wrapper.get('button[aria-pressed="true"]').text()
}

describe('FaqView', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the student questions to a visitor', async () => {
    const { wrapper } = await mountFaq()

    expect(pressed(wrapper)).toBe('Je suis étudiant')
    expect(wrapper.text()).toContain('Pourquoi dois-je compléter mon profil ?')
    expect(wrapper.findAll('details')).toHaveLength(FAQ.student.flatMap((section) => section.questions).length)
  })

  it('shows the beneficiary questions to a caregiver', async () => {
    useAuthStore().token = validToken({ role: 'CAREGIVER' })

    const { wrapper } = await mountFaq()

    expect(pressed(wrapper)).toBe('Je suis bénéficiaire ou aidant')
    expect(wrapper.text()).toContain('Je suis aidant : comment agir pour la personne que j’accompagne ?')
  })

  it('opens the tab given in the address, and keeps the chosen one in it', async () => {
    const { wrapper, router } = await mountFaq('/faq?pour=beneficiary')
    expect(pressed(wrapper)).toBe('Je suis bénéficiaire ou aidant')

    await wrapper.findAll('button').find((button) => button.text() === 'Je suis étudiant').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.pour).toBe('student')
    expect(wrapper.text()).toContain('Quelles missions me sont proposées ?')
  })

  it('answers in collapsible questions, readable with the keyboard', async () => {
    const { wrapper } = await mountFaq()

    const first = wrapper.get('details')
    expect(first.get('summary').text()).toContain('Comment créer mon compte ?')
    expect(first.text()).toContain('Je suis étudiant')
  })
})
