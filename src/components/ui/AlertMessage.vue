<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value),
  },
})

const styles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
}

// Errors interrupt screen readers, other messages are announced politely
const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div :role="role" class="rounded-lg border px-4 py-3 text-sm sm:text-base" :class="styles[variant]">
    <slot />
  </div>
</template>
