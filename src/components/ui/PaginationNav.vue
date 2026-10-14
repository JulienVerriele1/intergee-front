<script setup>
import AppIcon from './AppIcon.vue'

/** "Précédente" / "Suivante" under a list or a table: small, so as not to compete with the actions of the page. */
defineProps({
  /** Current page, from 0 */
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  /** Accessible name of the navigation, e.g. "Pagination des missions" */
  label: { type: String, required: true },
})
const emit = defineEmits(['go'])

// 44 px high: the minimum touch target of the design system
const BUTTON =
  'focus-ring inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-primary bg-surface-raised px-3 ' +
  'text-base font-bold text-primary-ink transition-colors hover:bg-primary-soft ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-surface-raised'
</script>

<template>
  <nav v-if="totalPages > 1" :aria-label="label" class="flex items-center justify-between gap-3">
    <button type="button" :class="BUTTON" :disabled="page === 0" @click="emit('go', page - 1)">
      <AppIcon name="chevron-left" :size="18" />
      Précédente
    </button>
    <span class="text-base text-ink">Page {{ page + 1 }} sur {{ totalPages }}</span>
    <button type="button" :class="BUTTON" :disabled="page + 1 >= totalPages" @click="emit('go', page + 1)">
      Suivante
      <AppIcon name="chevron-right" :size="18" />
    </button>
  </nav>
</template>
