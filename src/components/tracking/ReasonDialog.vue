<script setup>
import { ref } from 'vue'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

/**
 * Confirms a cancellation or a withdrawal with a reason chosen in a list, without free text (spec 017, Q3), and warns
 * when it comes late (RG-6). Render it with v-if, as ConfirmDialog.
 */
defineProps({
  title: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  reasons: { type: Array, required: true },
  /** Shown when the cancellation or the withdrawal comes late */
  warning: { type: String, default: '' },
  busy: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['confirm', 'cancel'])

const reason = ref('')
</script>

<template>
  <ConfirmDialog
    :title="title"
    :confirm-label="confirmLabel"
    :busy="busy"
    :confirm-disabled="!reason"
    @confirm="emit('confirm', reason)"
    @cancel="emit('cancel')"
  >
    <div class="flex flex-col gap-3">
      <slot />
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-1 font-bold">Pour quelle raison ?</legend>
        <label v-for="option in reasons" :key="option.value" class="flex min-h-11 items-center gap-3">
          <input v-model="reason" type="radio" name="reason" :value="option.value" class="size-5 accent-primary" />
          {{ option.label }}
        </label>
      </fieldset>
      <AlertMessage v-if="warning" variant="info">{{ warning }}</AlertMessage>
      <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
    </div>
  </ConfirmDialog>
</template>
