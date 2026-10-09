<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS, ROLES } from '@/constants/roles'

const auth = useAuthStore()
const { isAuthenticated, role } = storeToRefs(auth)
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <RouterLink
        to="/"
        class="flex items-center gap-2 rounded text-lg font-bold text-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <img src="/favicon.svg" alt="" class="size-8" />
        Intergee
      </RouterLink>
      <nav v-if="isAuthenticated" aria-label="Compte" class="flex flex-wrap items-center gap-3">
        <RouterLink
          :to="{ name: 'my-missions' }"
          class="rounded font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          active-class="underline"
        >
          {{ role === ROLES.STUDENT ? 'Mes candidatures' : 'Mes missions' }}
        </RouterLink>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-900">
          <span class="sr-only">Connecté en tant que </span>{{ ROLE_LABELS[role] ?? role }}
        </span>
        <button type="button" class="btn-secondary" @click="auth.logout()">Se déconnecter</button>
      </nav>
    </div>
  </header>
</template>
