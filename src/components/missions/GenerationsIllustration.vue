<!-- Decorative: an older person and a student join hands under a heart made of the two halves of the brand mark -->
<template>
  <svg viewBox="0 0 240 170" aria-hidden="true" focusable="false" class="h-auto w-full">
    <!-- Ground -->
    <ellipse cx="120" cy="156" rx="104" ry="10" fill="var(--ig-primary-soft)" />

    <!-- Older person: slightly shorter, with a walking stick -->
    <g>
      <line x1="44" y1="104" x2="40" y2="154" stroke="var(--ig-ink-muted)" stroke-width="5" stroke-linecap="round" />
      <path d="M58 96c0-14 10-22 22-22s22 8 22 22v54a6 6 0 0 1-6 6H64a6 6 0 0 1-6-6Z" fill="var(--ig-accent)" />
      <circle cx="80" cy="56" r="15" fill="var(--ig-accent-soft)" stroke="var(--ig-accent)" stroke-width="4" />
      <!-- Grey hair -->
      <path d="M66 52a15 15 0 0 1 28 0" fill="none" stroke="var(--ig-border)" stroke-width="5" stroke-linecap="round" />
      <path d="M60 104q-12 2-16 0" fill="none" stroke="var(--ig-accent)" stroke-width="8" stroke-linecap="round" />
      <path d="M100 100q12 6 20 4" fill="none" stroke="var(--ig-accent)" stroke-width="8" stroke-linecap="round" />
    </g>

    <!-- Student: taller, with a backpack -->
    <g>
      <rect x="170" y="80" width="18" height="40" rx="6" fill="var(--ig-primary-ink)" />
      <path d="M140 88c0-14 10-22 22-22s22 8 22 22v62a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6Z" fill="var(--ig-primary)" />
      <circle cx="162" cy="44" r="15" fill="var(--ig-primary-soft)" stroke="var(--ig-primary)" stroke-width="4" />
      <path d="M142 100q-12 6-20 4" fill="none" stroke="var(--ig-primary)" stroke-width="8" stroke-linecap="round" />
    </g>

    <!-- Joined hands -->
    <circle cx="121" cy="104" r="6" fill="var(--ig-surface-raised)" stroke="var(--ig-ink-muted)" stroke-width="2" />

    <!-- Heart above the joined hands: the two halves of the brand mark meet -->
    <g transform="translate(0 -50)">
      <path d="M121 84c-3-6-14-14-20-6-5 7 2 14 20 26Z" fill="var(--ig-accent)" />
      <path d="M121 84c3-6 14-14 20-6 5 7-2 14-20 26Z" fill="var(--ig-primary)" />
    </g>
  </svg>
</template>
