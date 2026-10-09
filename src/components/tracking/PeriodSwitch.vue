<script setup>
import { PERIODS } from '@/missions/missionTracking'

const period = defineModel({ type: String, required: true })
</script>

<template>
  <div role="group" aria-label="Période" class="inline-flex rounded-lg border border-slate-300 bg-white p-1">
    <button
      v-for="option in PERIODS"
      :key="option.value"
      type="button"
      :aria-pressed="period === option.value"
      class="min-h-11 rounded-md px-4 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      :class="period === option.value ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'"
      @click="period = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
