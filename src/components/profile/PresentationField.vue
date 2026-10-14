<script setup>
import { computed } from 'vue'
import { PRESENTATION_MAX, PRESENTATION_MIN, presentationLength } from '@/profile/presentation'
import FormField from '@/components/ui/FormField.vue'

/**
 * Free text where a student or a beneficiary introduces themselves (spec 012, RG-1), with a character counter and the
 * reminder that no health information is to be given (spec 001, RG-7).
 */
const presentation = defineModel({ type: String, required: true })
const props = defineProps({
  id: { type: String, default: 'presentation' },
  /** What to talk about, depending on who writes */
  hint: { type: String, required: true },
  error: { type: String, default: '' },
})

const length = computed(() => presentationLength(presentation.value))
const counterId = computed(() => `${props.id}-count`)
const counter = computed(() => {
  if (length.value < PRESENTATION_MIN) {
    return `${length.value} caractères : encore ${PRESENTATION_MIN - length.value} au minimum`
  }
  return `${length.value} / 1 000 caractères`
})
</script>

<template>
  <FormField
    :id="id"
    label="Présentation"
    :help="`${hint} De 300 à 1 000 caractères. N'indiquez aucune information sur votre santé ou un handicap.`"
    :error="error"
    required
  >
    <template #default="{ id: fieldId, describedBy, invalid }">
      <textarea
        :id="fieldId"
        v-model="presentation"
        rows="7"
        class="form-input min-h-40 resize-y leading-7"
        :aria-describedby="[describedBy, counterId].filter(Boolean).join(' ')"
        :aria-invalid="invalid"
        required
      />
      <p
        :id="counterId"
        class="self-end text-base"
        :class="length > PRESENTATION_MAX ? 'font-bold text-danger' : length >= PRESENTATION_MIN ? 'text-success' : 'text-ink-muted'"
      >
        {{ counter }}
      </p>
    </template>
  </FormField>
</template>
