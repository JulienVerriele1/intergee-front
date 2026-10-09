import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/constants/roles'
import { resolveNavigation } from './guards'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ALL_ROLES, title: 'Tableau de bord' },
  },
  {
    path: '/missions',
    name: 'my-missions',
    component: () => import('@/views/MyMissionsView.vue'),
    meta: { requiresAuth: true, roles: ALL_ROLES, title: 'Mes missions' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Connexion' },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { requiresAuth: true, title: 'Accès refusé' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page introuvable' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => resolveNavigation(to, useAuthStore()))

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Intergee` : 'Intergee'
})
