<script setup>
import { PERIODS } from '@/missions/missionTracking'

const period = defineModel({ type: String, required: true })
</script>

<template>
  <div role="group" aria-label="Période" class="inline-flex gap-1 rounded-full border-2 border-border bg-surface-raised p-1">
    <button
      v-for="option in PERIODS"
      :key="option.value"
      type="button"
      :aria-pressed="period === option.value"
      class="focus-ring min-h-target rounded-full px-6 text-lg font-bold transition-colors"
      :class="period === option.value ? 'bg-primary text-on-primary' : 'text-ink hover:bg-primary-soft'"
      @click="period = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
