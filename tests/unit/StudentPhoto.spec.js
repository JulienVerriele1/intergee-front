import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StudentPhoto from '@/components/ui/StudentPhoto.vue'
import * as profileApi from '@/api/profileApi'
import { ApiError } from '@/api/apiError'

vi.mock('@/api/profileApi')

describe('StudentPhoto', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:photo-lea')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    delete URL.createObjectURL
    delete URL.revokeObjectURL
  })

  it('shows the photo loaded with the access token, with an alternative text', async () => {
    profileApi.fetchStudentPhoto.mockResolvedValue(new Blob(['jpeg']))

    const wrapper = mount(StudentPhoto, { props: { studentId: 'lea', firstName: 'Léa' } })
    await flushPromises()

    expect(profileApi.fetchStudentPhoto).toHaveBeenCalledWith('lea')
    expect(wrapper.get('img').attributes('src')).toBe('blob:photo-lea')
    expect(wrapper.get('img').attributes('alt')).toBe('Photo de Léa')
    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-lea')
  })

  it('shows a placeholder without photo', async () => {
    profileApi.fetchStudentPhoto.mockRejectedValue(new ApiError(404, 'No photo'))

    const wrapper = mount(StudentPhoto, { props: { studentId: 'lea', firstName: 'Léa' } })
    await flushPromises()

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe("Léa n'a pas encore de photo")
  })

  it('does not ask for a photo known to be missing', async () => {
    mount(StudentPhoto, { props: { studentId: 'lea', firstName: 'Léa', hasPhoto: false } })
    await flushPromises()

    expect(profileApi.fetchStudentPhoto).not.toHaveBeenCalled()
  })
})
