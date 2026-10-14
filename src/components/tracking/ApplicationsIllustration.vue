<!-- Decorative: a student next to the clipboard of their applications, one retained (heart), one done, one waiting -->
<template>
  <svg viewBox="0 0 240 170" aria-hidden="true" focusable="false" class="h-auto w-full">
    <!-- Ground -->
    <ellipse cx="120" cy="156" rx="104" ry="10" fill="var(--ig-primary-soft)" />

    <!-- Clipboard of the applications -->
    <g>
      <rect x="128" y="22" width="88" height="128" rx="10" fill="var(--ig-surface-raised)" stroke="var(--ig-primary)" stroke-width="4" />
      <rect x="152" y="14" width="40" height="16" rx="6" fill="var(--ig-accent)" />
      <!-- Retained: the heart of the brand -->
      <g transform="translate(149 54) scale(0.5) translate(-121 -92)">
        <path d="M121 84c-3-6-14-14-20-6-5 7 2 14 20 26Z" fill="var(--ig-accent)" />
        <path d="M121 84c3-6 14-14 20-6 5 7-2 14-20 26Z" fill="var(--ig-primary)" />
      </g>
      <path d="M166 54h36" stroke="var(--ig-primary)" stroke-width="5" stroke-linecap="round" />
      <!-- Done -->
      <circle cx="149" cy="88" r="10" fill="var(--ig-primary-soft)" />
      <path d="M144 88l4 4 7-8" fill="none" stroke="var(--ig-primary)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M166 88h30" stroke="var(--ig-border)" stroke-width="5" stroke-linecap="round" />
      <!-- Waiting -->
      <circle cx="149" cy="121" r="10" fill="none" stroke="var(--ig-accent)" stroke-width="3.5" />
      <path d="M149 115v6l4 3" fill="none" stroke="var(--ig-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M166 121h24" stroke="var(--ig-border)" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- Student with a backpack, holding the clipboard -->
    <g>
      <rect x="34" y="80" width="18" height="40" rx="6" fill="var(--ig-primary-ink)" />
      <path d="M48 88c0-14 10-22 22-22s22 8 22 22v62a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6Z" fill="var(--ig-primary)" />
      <circle cx="70" cy="44" r="15" fill="var(--ig-primary-soft)" stroke="var(--ig-primary)" stroke-width="4" />
      <path d="M90 100q18 4 36-6" fill="none" stroke="var(--ig-primary)" stroke-width="8" stroke-linecap="round" />
    </g>
  </svg>
</template>
