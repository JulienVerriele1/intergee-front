<script setup>
/**
 * Decorative background of every page: the design system's shapes (facing half-discs, discs, pills) in the soft
 * brand colours, on a transparent ground. Purely decorative: hidden from assistive tech, never clickable, not printed.
 * Text stays legible over it: ink is above 11:1 and ink-muted above 6:1 on primary-soft and accent-soft, in both themes.
 */
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 overflow-hidden print:hidden">
    <!-- Top right: a large disc bled off the edge, two half-discs meeting across it, one apricot dot -->
    <svg
      viewBox="0 0 400 400"
      class="absolute -top-10 -right-28 w-56 sm:-right-16 sm:w-[26rem] lg:w-[30rem]"
      focusable="false"
    >
      <circle cx="290" cy="110" r="190" class="fill-primary-soft" />
      <path d="M134 84a46 46 0 0 0 0 92Z" class="fill-accent-soft" />
      <path d="M146 84a46 46 0 0 1 0 92Z" class="fill-accent-soft" />
      <circle cx="252" cy="330" r="12" class="fill-accent" />
    </svg>

    <!-- Bottom left: three pills of unequal length and a half-disc rising from the edge -->
    <svg
      viewBox="0 0 400 320"
      class="absolute -bottom-2 -left-24 w-56 sm:-left-12 sm:w-[24rem] lg:w-[28rem]"
      focusable="false"
    >
      <rect x="-40" y="120" width="220" height="48" rx="24" class="fill-primary-soft" />
      <rect x="-40" y="184" width="300" height="48" rx="24" class="fill-primary-soft" />
      <rect x="-40" y="248" width="160" height="48" rx="24" class="fill-accent-soft" />
      <path d="M210 330a90 90 0 0 1 180 0Z" class="fill-accent-soft" />
      <circle cx="316" cy="190" r="10" class="fill-primary" />
    </svg>
  </div>
</template>
