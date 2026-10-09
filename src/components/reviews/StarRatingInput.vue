<script setup>
import { useId } from 'vue'

/** Rating from 1 to 5 as a radio group: usable with the keyboard and screen readers (spec 007). */
const rating = defineModel({ type: Number, default: null })
defineProps({
  legend: { type: String, required: true },
})

const name = useId()
</script>

<template>
  <fieldset>
    <legend class="mb-2 font-semibold text-slate-800">{{ legend }}</legend>
    <div class="flex gap-1">
      <label v-for="value in 5" :key="value" class="cursor-pointer">
        <input v-model="rating" type="radio" :name="name" :value="value" class="peer sr-only" />
        <span class="sr-only">{{ value }} étoile{{ value > 1 ? 's' : '' }} sur 5</span>
        <span
          aria-hidden="true"
          class="block rounded px-1 text-4xl leading-none peer-focus-visible:outline-3 peer-focus-visible:outline-blue-700"
          :class="rating !== null && value <= rating ? 'text-amber-500' : 'text-slate-300'"
        >★</span>
      </label>
    </div>
  </fieldset>
</template>
