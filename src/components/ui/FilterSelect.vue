<script setup>
import AppIcon from './AppIcon.vue'

/**
 * Filter of a list or a table: a native select, so as to keep the keyboard and the screen readers of every platform,
 * shaped as a pill with its label on the same line. 44 px high: the minimum touch target of the design system.
 */
const model = defineModel({ type: String, required: true })
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  /** @type {{value: string, label: string}[]} */
  options: { type: Array, required: true },
  /** Option of the empty value: no filter */
  allLabel: { type: String, required: true },
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <label :for="id" class="text-base font-bold text-ink-muted">{{ label }}</label>
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        class="focus-ring min-h-11 max-w-full cursor-pointer appearance-none rounded-full border-2 bg-surface-raised py-1 pr-10 pl-4 text-base font-bold text-ink transition-colors hover:border-primary"
        :class="model ? 'border-primary' : 'border-border'"
      >
        <option value="">{{ allLabel }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <AppIcon
        name="chevron-down"
        :size="18"
        class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-primary-ink"
      />
    </div>
  </div>
</template>
