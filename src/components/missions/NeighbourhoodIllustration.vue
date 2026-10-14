<!-- Decorative: a student next to a map pin holding the heart of the brand, above the houses of the neighbourhood -->
<template>
  <svg viewBox="0 0 240 170" aria-hidden="true" focusable="false" class="h-auto w-full">
    <!-- Ground -->
    <ellipse cx="120" cy="156" rx="104" ry="10" fill="var(--ig-primary-soft)" />

    <!-- Houses of the neighbourhood -->
    <g>
      <path d="M150 118l17-14 17 14v34h-34Z" fill="var(--ig-accent-soft)" stroke="var(--ig-accent)" stroke-width="3" stroke-linejoin="round" />
      <rect x="161" y="132" width="12" height="20" rx="2" fill="var(--ig-accent)" />
      <path d="M186 126l14-11 14 11v26h-28Z" fill="var(--ig-surface-raised)" stroke="var(--ig-border)" stroke-width="3" stroke-linejoin="round" />
      <rect x="195" y="136" width="10" height="16" rx="2" fill="var(--ig-border)" />
    </g>

    <!-- Map pin holding the heart -->
    <g>
      <path d="M182 14c-17 0-30 13-30 29 0 22 30 50 30 50s30-28 30-50c0-16-13-29-30-29Z" fill="var(--ig-surface-raised)" stroke="var(--ig-primary)" stroke-width="4" />
      <g transform="translate(182 44) scale(0.62) translate(-121 -92)">
        <path d="M121 84c-3-6-14-14-20-6-5 7 2 14 20 26Z" fill="var(--ig-accent)" />
        <path d="M121 84c3-6 14-14 20-6 5 7-2 14-20 26Z" fill="var(--ig-primary)" />
      </g>
    </g>

    <!-- Student with a backpack, heading to the pin -->
    <g>
      <rect x="54" y="80" width="18" height="40" rx="6" fill="var(--ig-primary-ink)" />
      <path d="M68 88c0-14 10-22 22-22s22 8 22 22v62a6 6 0 0 1-6 6H74a6 6 0 0 1-6-6Z" fill="var(--ig-primary)" />
      <circle cx="90" cy="44" r="15" fill="var(--ig-primary-soft)" stroke="var(--ig-primary)" stroke-width="4" />
      <!-- Arm pointing to the pin -->
      <path d="M110 96q16-10 30-24" fill="none" stroke="var(--ig-primary)" stroke-width="8" stroke-linecap="round" />
    </g>
  </svg>
</template>
