<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS, ROLES } from '@/constants/roles'
import AppIcon from '@/components/ui/AppIcon.vue'
import ReceivedReviews from '@/components/reviews/ReceivedReviews.vue'

/** Burger menu at the top right of the header: profile, received reviews and logout. */
const auth = useAuthStore()
const { role, userId } = storeToRefs(auth)
const route = useRoute()

const root = ref(null)
const trigger = ref(null)
const isOpen = ref(false)
const firstName = ref('')
const roleLabel = computed(() => ROLE_LABELS[role.value] ?? role.value)

// The token only carries the id and the role: the first name comes with the user's own reputation
function onReputationsLoaded(reputations) {
  firstName.value = reputations.find((person) => person.userId === userId.value)?.firstName ?? ''
}

function open() {
  isOpen.value = true
  document.addEventListener('pointerdown', closeOnOutsideClick)
}

function close({ restoreFocus = true } = {}) {
  isOpen.value = false
  document.removeEventListener('pointerdown', closeOnOutsideClick)
  if (restoreFocus) {
    trigger.value?.focus()
  }
}

function closeOnOutsideClick(event) {
  if (!root.value?.contains(event.target)) {
    close({ restoreFocus: false })
  }
}

function closeOnEscape() {
  if (isOpen.value) {
    close()
  }
}

watch(() => route.fullPath, () => close({ restoreFocus: false }))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>

<template>
  <div ref="root" class="relative" @keydown.esc="closeOnEscape">
    <button
      ref="trigger"
      type="button"
      class="btn-secondary px-3"
      aria-controls="account-menu"
      :aria-expanded="isOpen"
      aria-label="Menu du compte"
      @click="isOpen ? close() : open()"
    >
      <AppIcon :name="isOpen ? 'close' : 'menu'" :size="24" />
    </button>

    <!-- v-show keeps the reviews loaded, so the first name is known before the first opening -->
    <div
      v-show="isOpen"
      id="account-menu"
      class="absolute top-full right-0 z-30 mt-2 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col divide-y divide-border-subtle rounded-2xl border-2 border-border bg-surface-raised shadow-card"
    >
      <section aria-label="Profil" class="flex items-center gap-3 p-5">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink" aria-hidden="true">
          <AppIcon name="user" :size="24" />
        </span>
        <div class="flex min-w-0 flex-col items-start gap-1">
          <p v-if="firstName" class="truncate text-xl font-bold">{{ firstName }}</p>
          <span class="rounded-full bg-accent-soft px-3 py-0.5 text-base font-bold text-ink">
            <span class="sr-only">Connecté en tant que </span>{{ roleLabel }}
          </span>
        </div>
      </section>

      <nav v-if="role === ROLES.STUDENT" aria-label="Compte" class="p-5">
        <RouterLink :to="{ name: 'profile' }" class="btn-secondary w-full">
          <AppIcon name="user" :size="20" />
          Mon profil
        </RouterLink>
      </nav>

      <div class="p-5">
        <ReceivedReviews :show-names="role === ROLES.CAREGIVER" @loaded="onReputationsLoaded" />
      </div>

      <div class="p-5">
        <button type="button" class="btn-secondary w-full" @click="auth.logout()">Se déconnecter</button>
      </div>
    </div>
  </div>
</template>
