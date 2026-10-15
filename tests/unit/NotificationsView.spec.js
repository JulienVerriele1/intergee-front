import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import NotificationsView from '@/views/NotificationsView.vue'
import { router as appRouter } from '@/router'
import { resolveNavigation } from '@/router/guards'
import * as notificationApi from '@/api/notificationApi'
import * as profileApi from '@/api/profileApi'
import { useAuthStore } from '@/stores/auth'
import { validToken } from './tokens'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/notificationApi')
vi.mock('@/api/profileApi')

async function mountView(role = 'BENEFICIARY') {
  useAuthStore().token = validToken({ role })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'notifications', component: NotificationsView },
      { path: '/profil', name: 'profile', component: { template: '<p>profil</p>' } },
    ],
  })
  await router.push('/')
  const wrapper = mount(NotificationsView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

function switchFor(wrapper, label) {
  const id = wrapper.findAll('span[id^="channel-"]').find((span) => span.text() === label).attributes('id')
  return wrapper.get(`[role="switch"][aria-labelledby="${id}"]`)
}

describe('NotificationsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    notificationApi.fetchNotificationPreferences.mockResolvedValue({ email: true, sms: true })
  })

  it('shows the two channels as switches, and what is notified by which', async () => {
    const wrapper = await mountView()

    expect(switchFor(wrapper, 'Recevoir les e-mails').attributes('aria-checked')).toBe('true')
    expect(switchFor(wrapper, 'Recevoir les SMS').attributes('aria-checked')).toBe('true')
    expect(wrapper.findAll('tbody th').map((cell) => cell.text())).toContain('Un étudiant propose son aide')
    expect(wrapper.text()).toContain('Aucun SMS n’est envoyé entre 20 h et 8 h')
    expect(wrapper.text()).toContain('même si vous refusez les e-mails')
    expect(profileApi.fetchMyProfile).not.toHaveBeenCalled()
  })

  it('shows the events of a student, and invites them to give a phone to receive the SMS', async () => {
    profileApi.fetchMyProfile.mockResolvedValue({ phone: null })
    const wrapper = await mountView('STUDENT')

    expect(wrapper.findAll('tbody th').map((cell) => cell.text())).toEqual([
      'Missions disponibles près de chez vous',
      'Vous êtes choisi pour une mission',
      'Rappel de la mission',
    ])
    expect(wrapper.text()).toContain('La veille, à 18 h')
    expect(wrapper.text()).toContain('vous vous êtes engagé')
    expect(wrapper.text()).not.toContain('personne que vous accompagnez')
    expect(wrapper.get('a[href="/profil"]').text()).toBe('Ajouter un numéro dans « Mon profil »')
  })

  it('does not ask a student for the phone they already gave', async () => {
    profileApi.fetchMyProfile.mockResolvedValue({ phone: '+33611111111' })
    const wrapper = await mountView('STUDENT')

    expect(wrapper.find('a[href="/profil"]').exists()).toBe(false)
  })

  it('saves a switch as soon as it is flipped', async () => {
    notificationApi.updateNotificationPreferences.mockResolvedValue({ email: true, sms: false })
    const wrapper = await mountView()

    await switchFor(wrapper, 'Recevoir les SMS').trigger('click')
    await flushPromises()

    expect(notificationApi.updateNotificationPreferences).toHaveBeenCalledWith({ email: true, sms: false })
    expect(switchFor(wrapper, 'Recevoir les SMS').attributes('aria-checked')).toBe('false')
    expect(wrapper.text()).toContain('Vos réglages sont enregistrés.')
  })

  it('keeps the switch as it was when saving fails', async () => {
    notificationApi.updateNotificationPreferences.mockRejectedValue(new ApiError(0, 'Le serveur est injoignable.'))
    const wrapper = await mountView()

    await switchFor(wrapper, 'Recevoir les e-mails').trigger('click')
    await flushPromises()

    expect(switchFor(wrapper, 'Recevoir les e-mails').attributes('aria-checked')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toBe('Le serveur est injoignable.')
  })

  it('is for beneficiaries, caregivers and students', () => {
    const notifications = appRouter.resolve('/notifications')

    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'BENEFICIARY' })).toBe(true)
    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'CAREGIVER' })).toBe(true)
    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'STUDENT' })).toBe(true)
    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'MODERATOR' })).toEqual({ name: 'forbidden' })
  })
})
