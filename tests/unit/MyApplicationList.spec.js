import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MyApplicationList from '@/components/tracking/MyApplicationList.vue'
import * as missionApi from '@/api/missionApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/missionApi')

function application(applicationStatus, missionOverrides = {}) {
  return {
    mission: {
      id: `mission-${applicationStatus}`,
      title: `Mission ${applicationStatus}`,
      category: 'GROCERIES',
      scheduledAt: '2026-12-06T08:00:00Z',
      durationMinutes: 90,
      postalCode: '59000',
      city: 'Lille',
      reward: 20,
      status: applicationStatus === 'PENDING' ? 'APPLIED' : 'ASSIGNED',
      ...missionOverrides,
    },
    applicationStatus,
    appliedAt: '2026-12-01T10:00:00Z',
  }
}

function page(items) {
  return { items, page: 0, size: 20, totalItems: items.length, totalPages: items.length > 0 ? 1 : 0 }
}

function buttonNamed(wrapper, name) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === name)
  if (!button) {
    throw new Error(`No button named "${name}"`)
  }
  return button
}

describe('MyApplicationList', () => {
  beforeEach(() => vi.resetAllMocks())

  it('lists the applications with their status', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([
      application('PENDING'), application('ACCEPTED'), application('REJECTED'),
    ]))

    const wrapper = mount(MyApplicationList)
    await flushPromises()

    expect(missionApi.fetchMyApplications).toHaveBeenCalledWith({ period: 'UPCOMING', page: 0, size: 20 })
    expect(wrapper.text()).toContain('En attente')
    expect(wrapper.text()).toContain('Retenue')
    expect(wrapper.text()).toContain('Non retenue')
    expect(wrapper.text()).toContain('Vous pouvez postuler à une autre mission sur ce créneau')
    expect(wrapper.text()).not.toContain('Refusée')
  })

  it('withdraws a pending application', async () => {
    missionApi.fetchMyApplications.mockResolvedValueOnce(page([application('PENDING')])).mockResolvedValueOnce(page([]))
    missionApi.withdrawApplication.mockResolvedValue()
    const wrapper = mount(MyApplicationList)
    await flushPromises()

    await buttonNamed(wrapper, 'Retirer ma candidature').trigger('click')
    await flushPromises()

    expect(missionApi.withdrawApplication).toHaveBeenCalledWith('mission-PENDING')
    expect(wrapper.text()).toContain('Votre candidature à « Mission PENDING » a été retirée.')
  })

  it('reveals the address and the beneficiary of an accepted application', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application('ACCEPTED')]))
    missionApi.fetchAssignment.mockResolvedValue({
      location: { street: '12 rue des Lilas', postalCode: '59000', city: 'Lille', latitude: 50.6292, longitude: 3.0573 },
      beneficiary: { firstName: 'Jeanne', lastName: 'Dupont', phone: '+33320123456' },
    })
    const wrapper = mount(MyApplicationList)
    await flushPromises()
    expect(wrapper.text()).not.toContain('12 rue des Lilas')

    await buttonNamed(wrapper, "Voir l'adresse et le contact").trigger('click')
    await flushPromises()

    expect(missionApi.fetchAssignment).toHaveBeenCalledWith('mission-ACCEPTED')
    expect(wrapper.text()).toContain('12 rue des Lilas, 59000 Lille')
    expect(wrapper.get('a[href="tel:+33320123456"]').text()).toBe('+33320123456')
    expect(wrapper.get('a[target="_blank"]').attributes('href')).toContain('mlat=50.6292')
  })

  it('offers no action on a rejected application', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application('REJECTED')]))

    const wrapper = mount(MyApplicationList)
    await flushPromises()

    expect(wrapper.findAll('article button')).toHaveLength(0)
  })

  it('explains a failed withdrawal', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application('PENDING')]))
    missionApi.withdrawApplication.mockRejectedValue(new ApiError(409, 'Closed', 'MISSION_CLOSED'))
    const wrapper = mount(MyApplicationList)
    await flushPromises()

    await buttonNamed(wrapper, 'Retirer ma candidature').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain("Cette mission n'accepte plus de changement")
  })
})
