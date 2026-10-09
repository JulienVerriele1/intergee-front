<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS, ROLES } from '@/constants/roles'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth = useAuthStore()
const { isAuthenticated, role } = storeToRefs(auth)
</script>

<template>
  <header class="border-b border-border-subtle bg-surface-raised">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <RouterLink
        to="/"
        class="order-1 focus-ring flex min-h-target items-center gap-3 rounded-lg text-2xl font-bold text-ink"
      >
        <img src="/favicon.svg" alt="" class="size-10" />
        Intergee
      </RouterLink>
      <!-- On phones the toggle stays top right, beside the name, and the account links go below -->
      <ThemeToggle class="order-2 md:order-3" />
      <nav
        v-if="isAuthenticated"
        aria-label="Compte"
        class="order-3 flex w-full flex-wrap items-center gap-3 md:order-2 md:ml-auto md:w-auto"
      >
        <RouterLink
          :to="{ name: 'my-missions' }"
          class="focus-ring inline-flex min-h-target items-center rounded-full px-4 text-lg font-bold text-primary-ink underline-offset-4 hover:bg-primary-soft"
          active-class="bg-primary-soft underline"
        >
          {{ role === ROLES.STUDENT ? 'Mes candidatures' : 'Mes missions' }}
        </RouterLink>
        <span class="rounded-full bg-accent-soft px-4 py-1 text-base font-bold text-ink">
          <span class="sr-only">Connecté en tant que </span>{{ ROLE_LABELS[role] ?? role }}
        </span>
        <button type="button" class="btn-secondary" @click="auth.logout()">Se déconnecter</button>
      </nav>
    </div>
  </header>
</template>
