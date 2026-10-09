<script setup>
import { TONE_CLASSES } from '@/missions/missionTracking'

defineProps({
  status: { type: Object, required: true },
})
</script>

<template>
  <span class="rounded-full px-3 py-1 text-sm font-medium" :class="TONE_CLASSES[status.tone]">
    <span class="sr-only">Statut : </span>{{ status.label }}
  </span>
</template>
