<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import AccountMenu from '@/components/AccountMenu.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BrandLogo from '@/components/BrandLogo.vue'

const { isAuthenticated, role } = storeToRefs(useAuthStore())
// Employers declare their students (spec 013): the beneficiary, or a caregiver for the person they accompany
const isEmployer = computed(() => role.value === ROLES.BENEFICIARY || role.value === ROLES.CAREGIVER)
</script>

<template>
  <header class="border-b border-border-subtle bg-surface-raised">
    <div class="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
      <RouterLink to="/" class="focus-ring flex min-h-target items-center gap-3 rounded-lg text-2xl font-bold text-ink">
        <BrandLogo />
      </RouterLink>
      <!-- No link to the missions: the logo leads every role to them (dashboard, or « Mes missions » by redirection) -->
      <!-- On phones the CESU link keeps its icon only, its name stays for screen readers -->
      <RouterLink
        v-if="isAuthenticated && isEmployer"
        :to="{ name: 'declarations' }"
        class="focus-ring ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 border-primary px-3 text-base font-bold text-primary-ink transition-colors hover:bg-primary-soft"
        active-class="bg-primary-soft"
      >
        <AppIcon name="file-check" :size="20" />
        <span class="sr-only sm:not-sr-only">Déclaration CESU</span>
      </RouterLink>
      <ThemeToggle :class="{ 'ml-auto': !(isAuthenticated && isEmployer) }" />
      <nav v-if="isAuthenticated" aria-label="Compte" class="flex items-center">
        <!-- Burger menu: role, profile, received reviews and logout (specs 010 and 012) -->
        <AccountMenu />
      </nav>
    </div>
  </header>
</template>
