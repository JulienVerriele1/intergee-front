<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { suggestAddresses } from '@/api/geocodingApi'

/**
 * "Numéro et rue" field proposing matching addresses as soon as a few characters are typed (ARIA 1.2 combobox).
 * Choosing one emits `select` with the street, postal code, city and coordinates.
 */
const props = defineProps({
  id: { type: String, required: true },
  describedBy: { type: String, default: undefined },
  invalid: { type: Boolean, default: undefined },
  required: { type: Boolean, default: false },
})
const street = defineModel({ type: String, required: true })
const emit = defineEmits(['select'])

const MIN_CHARACTERS = 3
const DEBOUNCE_MS = 250

const suggestions = ref([])
const open = ref(false)
const activeIndex = ref(-1)
const listboxId = computed(() => `${props.id}-suggestions`)
const activeOptionId = computed(() => (activeIndex.value >= 0 ? `${props.id}-option-${activeIndex.value}` : undefined))
const announcement = computed(() => {
  if (!open.value) {
    return ''
  }
  const count = suggestions.value.length
  return `${count} adresse${count > 1 ? 's' : ''} proposée${count > 1 ? 's' : ''}. Flèches haut et bas pour choisir.`
})

let debounceTimer = null
// Only the answer to the last request is shown: a slower previous answer must not replace it
let lastRequest = 0

function onInput(event) {
  // The model is updated by the parent on the next tick: the typed text is read from the event
  const text = event.target.value.trim()
  street.value = event.target.value
  clearTimeout(debounceTimer)
  if (text.length < MIN_CHARACTERS) {
    close()
    return
  }
  debounceTimer = setTimeout(() => search(text), DEBOUNCE_MS)
}

async function search(text) {
  const request = ++lastRequest
  try {
    const found = await suggestAddresses(text)
    if (request !== lastRequest) {
      return
    }
    suggestions.value = found
    activeIndex.value = -1
    open.value = found.length > 0
  } catch {
    // Service unavailable: the address can still be typed by hand
    close()
  }
}

function choose(suggestion) {
  street.value = suggestion.street
  emit('select', suggestion)
  close()
}

function close() {
  open.value = false
  activeIndex.value = -1
}

function onKeydown(event) {
  if (!open.value) {
    return
  }
  const last = suggestions.value.length - 1
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = activeIndex.value >= last ? 0 : activeIndex.value + 1
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = activeIndex.value <= 0 ? last : activeIndex.value - 1
      break
    case 'Enter':
      if (activeIndex.value >= 0) {
        event.preventDefault()
        choose(suggestions.value[activeIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

onBeforeUnmount(() => clearTimeout(debounceTimer))
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      :value="street"
      type="text"
      role="combobox"
      class="form-input"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="activeOptionId"
      :aria-describedby="describedBy"
      :aria-invalid="invalid"
      :required="required"
      @input="onInput"
      @keydown="onKeydown"
      @blur="close"
    />
    <ul
      v-show="open"
      :id="listboxId"
      role="listbox"
      aria-label="Adresses proposées"
      class="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border-2 border-border bg-surface-raised py-1 shadow-card"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${id}-option-${index}`"
        :key="suggestion.label"
        role="option"
        :aria-selected="index === activeIndex"
        class="cursor-pointer px-4 py-3 text-lg text-ink"
        :class="index === activeIndex ? 'bg-primary-soft' : 'hover:bg-primary-soft'"
        @mousedown.prevent="choose(suggestion)"
      >
        {{ suggestion.label }}
      </li>
    </ul>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>
