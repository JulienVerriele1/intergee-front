import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DeclarationsView from '@/views/DeclarationsView.vue'
import { router as appRouter } from '@/router'
import { resolveNavigation } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import * as wageApi from '@/api/wageApi'
import { validToken } from './tokens'

vi.mock('@/api/wageApi', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPendingDeclarations: vi.fn(),
}))

const DECLARATION = {
  employer: { id: 'jeanne', firstName: 'Jeanne', lastName: 'Dupont' },
  employee: { id: 'lea', firstName: 'Léa', lastName: 'Martin' },
  month: '2026-11',
  totalMinutes: 90,
  netWage: 18,
  missions: [{ id: 'm1', title: 'Courses', scheduledAt: '2026-11-03T09:00:00Z', durationMinutes: 90, hourlyNetWage: 12, netWage: 18 }],
}

async function mountView(role) {
  useAuthStore().token = validToken({ role })
  const wrapper = mount(DeclarationsView, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

function toggle(wrapper, id) {
  return wrapper.get(`#${id}-title button`)
}

describe('DeclarationsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([DECLARATION])
  })

  it('lists the declarations first, then why and how, each closed until clicked', async () => {
    const wrapper = await mountView('BENEFICIARY')

    expect(wrapper.get('h1').text()).toBe('Déclaration CESU')
    expect(wrapper.findAll('h2 button').map((button) => button.text())).toEqual([
      'À déclarer au CESU1 à déclarer',
      'Pourquoi déclarer ?',
      'Comment faire ?',
    ])
    for (const id of ['pending', 'why', 'how']) {
      expect(toggle(wrapper, id).attributes('aria-expanded')).toBe('false')
      expect(wrapper.get(`#${id}-content`).isVisible()).toBe(false)
    }
    expect(wrapper.get('section[aria-labelledby="declarations-title"] svg').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('opens the declarations on a click on their title, and closes them on a second', async () => {
    const wrapper = await mountView('BENEFICIARY')

    await toggle(wrapper, 'pending').trigger('click')

    expect(toggle(wrapper, 'pending').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#pending-content').isVisible()).toBe(true)
    expect(wrapper.get('#pending-content').text()).toContain('Léa Martin')
    await toggle(wrapper, 'pending').trigger('click')
    expect(wrapper.get('#pending-content').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('opens why and how to declare the same way', async () => {
    const wrapper = await mountView('BENEFICIARY')

    await toggle(wrapper, 'why').trigger('click')
    await toggle(wrapper, 'how').trigger('click')

    expect(wrapper.findAll('#why-content h3').map((title) => title.text())).toEqual([
      'C’est obligatoire',
      'L’étudiant est protégé',
      'Vous êtes protégé',
      'Vous payez moins',
    ])
    expect(wrapper.findAll('#how-content ol > li')).toHaveLength(3)
    wrapper.unmount()
  })

  it('says when everything is declared', async () => {
    vi.mocked(wageApi.fetchPendingDeclarations).mockResolvedValue([])

    const wrapper = await mountView('BENEFICIARY')

    expect(toggle(wrapper, 'pending').text()).toContain('À jour')
    expect(wrapper.get('#pending-content').text()).toContain('Rien à déclarer pour le moment')
    wrapper.unmount()
  })

  it('speaks to a caregiver about the person they accompany', async () => {
    const wrapper = await mountView('CAREGIVER')

    expect(wrapper.text()).toContain('La personne que vous accompagnez est l’employeur de l’étudiant')
    wrapper.unmount()
  })

  it('is for employers only', () => {
    const declarations = appRouter.resolve('/declarations')

    expect(resolveNavigation(declarations, { isAuthenticated: true, role: 'BENEFICIARY' })).toBe(true)
    expect(resolveNavigation(declarations, { isAuthenticated: true, role: 'CAREGIVER' })).toBe(true)
    expect(resolveNavigation(declarations, { isAuthenticated: true, role: 'STUDENT' })).toEqual({ name: 'forbidden' })
  })
})
