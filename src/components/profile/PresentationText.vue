<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

/**
 * Presentation of a student or a beneficiary (spec 012), in a native disclosure: keyboard and screen readers handle
 * it. Collapsed in a list of candidates, open in a contact.
 */
defineProps({
  text: { type: String, required: true },
  /** e.g. "Présentation de Léa" */
  title: { type: String, required: true },
  open: { type: Boolean, default: false },
})
</script>

<template>
  <details class="group rounded-lg bg-surface-sunken" :open="open">
    <summary
      class="focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 font-bold text-primary-ink [&::-webkit-details-marker]:hidden"
    >
      <AppIcon name="chevron-right" :size="18" class="transition-transform group-open:rotate-90" />
      {{ title }}
    </summary>
    <p class="px-3 pb-3 text-base leading-7 whitespace-pre-line text-ink">{{ text }}</p>
  </details>
</template>
