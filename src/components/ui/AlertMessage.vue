<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value),
  },
})

// Soft background, ink text, and an icon in the signal colour: the message never relies on colour alone
const styles = {
  info: { box: 'border-primary bg-primary-soft', icon: 'info', iconClass: 'text-primary-ink' },
  success: { box: 'border-success bg-success-soft', icon: 'check', iconClass: 'text-success' },
  error: { box: 'border-danger bg-danger-soft', icon: 'alert', iconClass: 'text-danger' },
}

// Errors interrupt screen readers, other messages are announced politely
const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div :role="role" class="flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-lg text-ink" :class="styles[variant].box">
    <AppIcon :name="styles[variant].icon" :size="24" class="mt-0.5" :class="styles[variant].iconClass" />
    <div class="min-w-0 flex-1"><slot /></div>
  </div>
</template>
