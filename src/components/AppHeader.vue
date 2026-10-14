<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import AccountMenu from '@/components/AccountMenu.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BrandLogo from '@/components/BrandLogo.vue'

const { isAuthenticated } = storeToRefs(useAuthStore())
</script>

<template>
  <header class="border-b border-border-subtle bg-surface-raised">
    <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
      <RouterLink to="/" class="focus-ring flex min-h-target items-center gap-3 rounded-lg text-2xl font-bold text-ink">
        <BrandLogo />
      </RouterLink>
      <!-- No link to the missions: the logo leads every role to them (dashboard, or « Mes missions » by redirection) -->
      <ThemeToggle class="ml-auto" />
      <nav v-if="isAuthenticated" aria-label="Compte" class="flex items-center">
        <!-- Burger menu: role, profile (students), received reviews and logout (spec 010) -->
        <AccountMenu />
      </nav>
    </div>
  </header>
</template>
