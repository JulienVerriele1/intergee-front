import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import NotificationsView from '@/views/NotificationsView.vue'
import { router as appRouter } from '@/router'
import { resolveNavigation } from '@/router/guards'
import * as notificationApi from '@/api/notificationApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/notificationApi')

async function mountView() {
  const wrapper = mount(NotificationsView)
  await flushPromises()
  return wrapper
}

function switchFor(wrapper, label) {
  const id = wrapper.findAll('span[id^="channel-"]').find((span) => span.text() === label).attributes('id')
  return wrapper.get(`[role="switch"][aria-labelledby="${id}"]`)
}

describe('NotificationsView', () => {
  beforeEach(() => {
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

  it('is for beneficiaries and caregivers only', () => {
    const notifications = appRouter.resolve('/notifications')

    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'BENEFICIARY' })).toBe(true)
    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'CAREGIVER' })).toBe(true)
    expect(resolveNavigation(notifications, { isAuthenticated: true, role: 'STUDENT' })).toEqual({ name: 'forbidden' })
  })
})
