<script setup>
import { computed } from 'vue'

/** Average rating out of 5: announced as text, the stars are decorative (spec 007). */
const props = defineProps({
  averageRating: { type: Number, default: null },
  reviewCount: { type: Number, required: true },
  /** False for a single review, shown without "(1 avis)" */
  showCount: { type: Boolean, default: true },
})

const formatted = computed(() =>
  props.averageRating === null ? null : props.averageRating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
)
const fullStars = computed(() => Math.round(props.averageRating ?? 0))
const label = computed(() =>
  props.reviewCount === 0
    ? 'Aucun avis'
    : `Note : ${formatted.value} sur 5${props.showCount ? ` (${props.reviewCount} avis)` : ''}`,
)
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-sm" role="img" :aria-label="label">
    <template v-if="reviewCount > 0">
      <span aria-hidden="true" class="tracking-tight text-amber-500">
        <span v-for="star in 5" :key="star" :class="star <= fullStars ? '' : 'text-slate-300'">★</span>
      </span>
      <span aria-hidden="true" class="font-semibold text-slate-800">{{ formatted }}</span>
      <span v-if="showCount" aria-hidden="true" class="text-slate-600">({{ reviewCount }} avis)</span>
    </template>
    <span v-else aria-hidden="true" class="text-slate-600">Aucun avis</span>
  </span>
</template>
