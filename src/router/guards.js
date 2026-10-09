/**
 * Pure navigation rule, kept separate from the router to be unit-tested.
 * Route meta: requiresAuth (boolean), roles (allowed roles), guestOnly (login page).
 *
 * @returns {true | import('vue-router').RouteLocationRaw}
 */
export function resolveNavigation(to, auth) {
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'forbidden' }
  }
  return true
}
