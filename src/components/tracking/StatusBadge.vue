<script setup>
import { TONE_CLASSES, TONE_ICONS } from '@/missions/missionTracking'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  status: { type: Object, required: true },
})
</script>

<template>
  <span class="tag" :class="TONE_CLASSES[status.tone]">
    <AppIcon :name="TONE_ICONS[status.tone]" />
    <span><span class="sr-only">Statut : </span>{{ status.label }}</span>
  </span>
</template>
