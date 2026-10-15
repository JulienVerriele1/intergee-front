import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES, PUBLISHER_ROLES, ROLES } from '@/constants/roles'
import { resolveNavigation } from './guards'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ALL_ROLES,
      title: 'Tableau de bord',
      // Those who publish missions land on their missions; publishing has its own page
      redirectByRole: { [ROLES.BENEFICIARY]: 'my-missions', [ROLES.CAREGIVER]: 'my-missions', [ROLES.MODERATOR]: 'moderation' },
    },
  },
  {
    path: '/missions',
    name: 'my-missions',
    component: () => import('@/views/MyMissionsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ALL_ROLES,
      title: 'Mes missions',
      // The applications of a student are a tab of their dashboard: an old link leads there
      redirectByRole: { [ROLES.STUDENT]: 'dashboard', [ROLES.MODERATOR]: 'moderation' },
    },
  },
  {
    path: '/profil',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STUDENT, ROLES.BENEFICIARY], title: 'Mon profil' },
  },
  {
    path: '/missions/publier',
    name: 'publish-mission',
    component: () => import('@/views/PublishMissionView.vue'),
    meta: { requiresAuth: true, roles: PUBLISHER_ROLES, title: 'Publier une mission' },
  },
  {
    path: '/missions/:id/modifier',
    name: 'edit-mission',
    component: () => import('@/views/EditMissionView.vue'),
    props: true,
    // Spec 017, UC-2
    meta: { requiresAuth: true, roles: PUBLISHER_ROLES, title: 'Modifier la mission' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Connexion' },
  },
  // Spec 018: opened from the login page or a link received by e-mail, logged in or not
  {
    path: '/mot-de-passe-oublie',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: 'Mot de passe oublié' },
  },
  {
    path: '/reinitialiser-mot-de-passe',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { title: 'Nouveau mot de passe' },
  },
  {
    path: '/verifier-email',
    name: 'verify-email',
    component: () => import('@/views/VerifyEmailView.vue'),
    meta: { title: 'Vérification de votre adresse' },
  },
  {
    path: '/inscription',
    name: 'register',
    component: () => import('@/views/RegisterChoiceView.vue'),
    meta: { guestOnly: true, title: 'Créer un compte' },
  },
  {
    path: '/inscription/etudiant',
    name: 'register-student',
    component: () => import('@/views/RegisterView.vue'),
    props: { role: ROLES.STUDENT },
    meta: { guestOnly: true, title: 'Inscription étudiant' },
  },
  {
    path: '/inscription/beneficiaire',
    name: 'register-beneficiary',
    component: () => import('@/views/RegisterView.vue'),
    props: { role: ROLES.BENEFICIARY },
    meta: { guestOnly: true, title: 'Inscription bénéficiaire' },
  },
  {
    path: '/moderation',
    name: 'moderation',
    component: () => import('@/views/ModerationView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.MODERATOR], title: 'Modération' },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationsView.vue'),
    // Specs 015 and 016
    meta: { requiresAuth: true, roles: [...PUBLISHER_ROLES, ROLES.STUDENT], title: 'Mes notifications' },
  },
  {
    path: '/declarations',
    name: 'declarations',
    component: () => import('@/views/DeclarationsView.vue'),
    meta: { requiresAuth: true, roles: PUBLISHER_ROLES, title: 'Déclaration CESU' },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { title: 'Questions fréquentes' },
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
  document.title = to.meta.title ? `${to.meta.title} · Geen` : 'Geen'
})
