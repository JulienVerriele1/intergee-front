<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

/**
 * Asks before an irreversible action (spec 009, RG-6). Render it with v-if: it opens as a modal when mounted, and gives
 * the focus back to the element that opened it when removed.
 */
defineProps({
  title: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmer' },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])

const dialog = ref(null)
const titleId = useId()
let opener = null

onMounted(() => {
  opener = document.activeElement
  // jsdom has no showModal: the open attribute keeps the dialog usable in tests
  if (typeof dialog.value.showModal === 'function') {
    dialog.value.showModal()
  } else {
    dialog.value.setAttribute('open', '')
  }
})

onBeforeUnmount(() => opener?.focus?.())
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    class="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border-subtle bg-surface-raised p-6 text-ink shadow-xl backdrop:bg-black/60"
    @cancel.prevent="emit('cancel')"
  >
    <h2 :id="titleId" class="text-2xl font-bold">{{ title }}</h2>
    <div class="mt-3 text-lg"><slot /></div>
    <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" class="btn-secondary" :disabled="busy" @click="emit('cancel')">Annuler</button>
      <button type="button" class="btn-primary" :disabled="busy" @click="emit('confirm')">
        {{ busy ? 'Envoi en cours…' : confirmLabel }}
      </button>
    </div>
  </dialog>
</template>
