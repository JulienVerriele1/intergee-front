<script setup>
import { computed } from 'vue'
import { pageWindow } from '@/utils/pagination'
import AppIcon from './AppIcon.vue'

/**
 * Pagination of the design system, under a list or a table. Every target is 44 px, the minimum touch target; the
 * current page is filled with the primary colour and announced by aria-current. On phones, where the numbers do not
 * fit, "Page 2 sur 5" between two round arrows.
 */
const props = defineProps({
  /** Current page, from 0 */
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  /** Accessible name of the navigation, e.g. "Pagination des missions" */
  label: { type: String, required: true },
})
const emit = defineEmits(['go'])

const items = computed(() => pageWindow(props.page, props.totalPages))
const isFirst = computed(() => props.page === 0)
const isLast = computed(() => props.page + 1 >= props.totalPages)

const STEP =
  'focus-ring inline-flex size-11 items-center justify-center gap-1 rounded-full border-2 border-primary bg-surface-raised ' +
  'text-base font-bold text-primary-ink transition-colors hover:bg-primary-soft sm:w-auto sm:px-3 ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted disabled:opacity-60 disabled:hover:bg-surface-raised'
const NUMBER = 'focus-ring inline-flex size-11 items-center justify-center rounded-full text-base font-bold transition-colors'
</script>

<template>
  <nav v-if="totalPages > 1" :aria-label="label" class="flex items-center justify-between gap-2">
    <button type="button" :class="STEP" :disabled="isFirst" @click="emit('go', page - 1)">
      <AppIcon name="chevron-left" :size="18" />
      <span class="sr-only sm:not-sr-only">Précédente</span>
    </button>

    <p class="text-base text-ink sm:hidden">Page {{ page + 1 }} sur {{ totalPages }}</p>
    <ul role="list" class="hidden items-center gap-1 sm:flex">
      <li v-for="(item, position) in items" :key="item === 'gap' ? `gap-${position}` : item">
        <span v-if="item === 'gap'" class="inline-flex size-11 items-center justify-center text-ink-muted" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          :class="[NUMBER, item === page ? 'bg-primary text-on-primary' : 'text-ink hover:bg-primary-soft']"
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="`Page ${item + 1}`"
          @click="item !== page && emit('go', item)"
        >
          {{ item + 1 }}
        </button>
      </li>
    </ul>

    <button type="button" :class="STEP" :disabled="isLast" @click="emit('go', page + 1)">
      <span class="sr-only sm:not-sr-only">Suivante</span>
      <AppIcon name="chevron-right" :size="18" />
    </button>
  </nav>
</template>
