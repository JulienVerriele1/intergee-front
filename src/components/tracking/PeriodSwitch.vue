<script setup>
import { computed } from 'vue'
import { PERIODS, RETAINED_LABELS } from '@/missions/missionTracking'

const period = defineModel({ type: String, required: true })
const props = defineProps({
  /** Smaller, to sit on the same line as a section title */
  compact: { type: Boolean, default: false },
  /** Wording of the first tab: "Retenues" for a student, "Attribuées" for a beneficiary or a caregiver */
  audience: { type: String, default: 'student', validator: (value) => value in RETAINED_LABELS },
})

const options = computed(() =>
  PERIODS.map((option) => (option.value === 'RETAINED' ? { ...option, label: RETAINED_LABELS[props.audience] } : option)),
)
</script>

<template>
  <div role="group" aria-label="Période" class="inline-flex gap-1 rounded-full border-2 border-border bg-surface-raised p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="period === option.value"
      class="focus-ring rounded-full font-bold transition-colors"
      :class="[
        // Compact: 36 px high, above the 24 px minimum target size of WCAG 2.2
        compact ? 'min-h-9 px-3 text-base' : 'min-h-target px-6 text-lg',
        period === option.value
          ? 'bg-primary text-on-primary'
          : option.muted ? 'text-ink-muted hover:bg-primary-soft hover:text-ink' : 'text-ink hover:bg-primary-soft',
      ]"
      @click="period = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
