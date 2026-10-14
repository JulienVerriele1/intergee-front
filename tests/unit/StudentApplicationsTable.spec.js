import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StudentApplicationsTable from '@/components/tracking/StudentApplicationsTable.vue'
import * as missionApi from '@/api/missionApi'

vi.mock('@/api/missionApi')
vi.mock('@/api/reviewApi')

function application(title, scheduledAt, applicationStatus = 'ACCEPTED') {
  return {
    mission: {
      id: `mission-${title}`,
      title,
      category: 'GROCERIES',
      scheduledAt,
      durationMinutes: 90,
      postalCode: '59000',
      city: 'Lille',
      reward: 20,
      status: applicationStatus === 'ACCEPTED' ? 'ASSIGNED' : 'APPLIED',
      requiredSkills: ['GROCERY_SHOPPING', 'OUTING_ESCORT'],
    },
    applicationStatus,
    appliedAt: '2026-12-01T10:00:00Z',
    completedAt: null,
    reviewSubmitted: false,
  }
}

function page(items, { number = 0, totalItems = items.length } = {}) {
  return { items, page: number, size: 5, totalItems, totalPages: Math.ceil(totalItems / 5) }
}

function rowTitles(wrapper) {
  return wrapper.findAll('tbody th').map((cell) => cell.text())
}

describe('StudentApplicationsTable', () => {
  beforeEach(() => vi.resetAllMocks())

  it('lists the retained applications by default, 5 per page, in the order of the API', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([
      application('Courses', '2026-12-05T08:00:00Z'),
      application('Jardinage', '2026-12-10T08:00:00Z'),
    ]))

    const wrapper = mount(StudentApplicationsTable)
    await flushPromises()

    expect(missionApi.fetchMyApplications).toHaveBeenCalledWith({ period: 'RETAINED', page: 0, size: 5 })
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['Mission', 'Date', 'Statut'])
    expect(rowTitles(wrapper)).toEqual(['Courses', 'Jardinage'])
    expect(wrapper.get('tbody time').attributes('datetime')).toBe('2026-12-05T08:00:00Z')
  })

  it('pages through the applications', async () => {
    const firstPage = ['A', 'B', 'C', 'D', 'E'].map((title, index) => application(title, `2026-12-0${index + 1}T08:00:00Z`))
    missionApi.fetchMyApplications
      .mockResolvedValueOnce(page(firstPage, { totalItems: 10 }))
      .mockResolvedValueOnce(page([application('F', '2026-12-06T08:00:00Z')], { number: 1, totalItems: 10 }))
    const wrapper = mount(StudentApplicationsTable)
    await flushPromises()
    expect(wrapper.text()).toContain('Page 1 sur 2')

    await wrapper.findAll('button').find((button) => button.text() === 'Suivante').trigger('click')
    await flushPromises()

    expect(missionApi.fetchMyApplications).toHaveBeenLastCalledWith({ period: 'RETAINED', page: 1, size: 5 })
    expect(rowTitles(wrapper)).toEqual(['F'])
  })

  it('keeps the tabs small, on the line of the title', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([]))

    const wrapper = mount(StudentApplicationsTable)
    await flushPromises()

    expect(wrapper.findAll('[role="group"] button').every((button) => button.classes().includes('min-h-9'))).toBe(true)
    expect(wrapper.findAll('[role="group"] button').map((button) => button.text())).toEqual(['Retenues', 'À venir', 'Passées'])
  })

  it('shows the details of a mission when its row is clicked, and hides them on a second click', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application('Courses', '2026-12-05T08:00:00Z')]))
    const wrapper = mount(StudentApplicationsTable, { attachTo: document.body })
    await flushPromises()
    expect(wrapper.find('#application-detail').exists()).toBe(false)

    await wrapper.get('tbody tr').trigger('click')

    expect(wrapper.get('#application-detail').text()).toContain('Détail de la mission')
    expect(wrapper.get('#application-detail').text()).toContain('Courses')
    expect(wrapper.get('#application-detail').text()).toContain('Compétences demandées')
    expect(wrapper.findAll('#application-detail li').map((item) => item.text())).toEqual([
      'Faire les courses et porter les sacs',
      'Accompagner à un rendez-vous ou une sortie, à pied ou en transports en commun',
    ])
    expect(missionApi.fetchAssignment).toHaveBeenCalledWith('mission-Courses')
    expect(wrapper.get('tbody button').attributes('aria-expanded')).toBe('true')

    await wrapper.get('tbody button').trigger('click')
    expect(wrapper.find('#application-detail').exists()).toBe(false)
    wrapper.unmount()
  })

  it('explains an empty tab', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([]))

    const wrapper = mount(StudentApplicationsTable)
    await flushPromises()

    expect(wrapper.text()).toContain("Vous n'avez pas encore été retenu pour une mission.")
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('opens the details right under their row, one mission at a time', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([
      application('Courses', '2026-12-05T08:00:00Z', 'PENDING'),
      application('Jardinage', '2026-12-10T08:00:00Z', 'PENDING'),
    ]))
    const wrapper = mount(StudentApplicationsTable, { attachTo: document.body })
    await flushPromises()

    await wrapper.findAll('tbody th button')[1].trigger('click')
    await wrapper.findAll('tbody th button')[0].trigger('click')

    const rows = wrapper.findAll('tbody > tr')
    expect(rows.map((row) => row.attributes('id') ?? row.get('th').text())).toEqual(['Courses', 'application-detail', 'Jardinage'])
    expect(wrapper.get('#application-detail').text()).toContain('Courses')
    wrapper.unmount()
  })

  it('comes with a decorative illustration', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([]))

    const wrapper = mount(StudentApplicationsTable)
    await flushPromises()

    expect(wrapper.get('svg[viewBox="0 0 240 170"]').attributes('aria-hidden')).toBe('true')
  })

  it('shows the presentation of the beneficiary to the retained student', async () => {
    missionApi.fetchMyApplications.mockResolvedValue(page([application('Courses', '2026-12-05T08:00:00Z')]))
    missionApi.fetchAssignment.mockResolvedValue({
      location: { street: '1 place du Général de Gaulle', postalCode: '59000', city: 'Lille', latitude: 50.6, longitude: 3.06 },
      beneficiary: { firstName: 'Jeanne', lastName: 'Démo', phone: '+33320000000', presentation: 'Institutrice à la retraite.' },
    })
    const wrapper = mount(StudentApplicationsTable, { attachTo: document.body })
    await flushPromises()

    await wrapper.get('tbody tr').trigger('click')
    await flushPromises()

    const presentation = wrapper.get('#application-detail details')
    expect(presentation.get('summary').text()).toBe('Présentation de Jeanne')
    expect(presentation.text()).toContain('Institutrice à la retraite.')
    wrapper.unmount()
  })
})
