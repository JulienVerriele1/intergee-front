<script setup>
import { computed } from 'vue'

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
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-semibold text-slate-800 sm:text-base">
      {{ label }}
      <span v-if="required" class="text-red-700" aria-hidden="true">*</span>
    </label>
    <p v-if="help" :id="helpId" class="text-sm text-slate-600">{{ help }}</p>
    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error) || undefined" />
    <p v-if="error" :id="errorId" class="text-sm font-medium text-red-700">{{ error }}</p>
  </div>
</template>
