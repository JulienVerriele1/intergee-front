<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const helpId = computed(() => `${props.id}-help`)
const errorId = computed(() => `${props.id}-error`)
// Passed to the slotted input so that the help and error texts are read with it
const describedBy = computed(
  () => [props.help && helpId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-lg leading-6 font-bold text-ink">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <p v-if="help" :id="helpId" class="text-base text-ink-muted">{{ help }}</p>
    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error) || undefined" />
    <p v-if="error" :id="errorId" class="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-base text-ink">
      <AppIcon name="alert" class="mt-0.5 text-danger" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>
