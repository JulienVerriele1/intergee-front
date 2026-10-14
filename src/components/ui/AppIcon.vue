<script setup>
/**
 * Line icons of the Geen design system: 24px grid, 2px rounded stroke, coloured by currentColor.
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
  calendar: ['M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z', 'M3.5 10h17M8 3.5v4M16 3.5v4'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3.5 2'],
  dot: [],
  shield: ['M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6Z', 'M8.5 12l2.5 2.5 4.5-5'],
  'chevron-left': ['M15 5l-7 7 7 7'],
  'chevron-right': ['M9 5l7 7-7 7'],
  'chevron-down': ['M5 9l7 7 7-7'],
  'file-check': ['M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z', 'M14 3v5h5', 'M9.5 14.5l2 2 4-4'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  plus: ['M12 5v14M5 12h14'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20.5a7.5 7.5 0 0 1 15 0'],
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
