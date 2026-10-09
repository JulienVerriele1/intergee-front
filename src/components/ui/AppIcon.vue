<script setup>
/**
 * Line icons of the Intergee design system: 24px grid, 2px rounded stroke, coloured by currentColor.
 * Decorative only (aria-hidden): an icon always comes with a text label.
 */
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => Object.keys(PATHS).includes(value),
  },
  /** Rendered size in px: 20 inside tags and fields, 24 next to body text */
  size: { type: Number, default: 20 },
})
</script>

<script>
const PATHS = {
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  close: ['M6.5 6.5l11 11M17.5 6.5l-11 11'],
  alert: ['M12 3.5 2.5 20h19Z', 'M12 10v4.5M12 17.2v.1'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v5M12 7.8v.1'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3.5 2'],
  dot: [],
  shield: ['M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6Z', 'M8.5 12l2.5 2.5 4.5-5'],
  'chevron-left': ['M15 5l-7 7 7 7'],
  'chevron-right': ['M9 5l7 7-7 7'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z'],
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    :width="size"
    :height="size"
    class="shrink-0"
  >
    <circle v-if="name === 'dot'" cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <path v-for="path in PATHS[name]" :key="path" :d="path" />
  </svg>
</template>
