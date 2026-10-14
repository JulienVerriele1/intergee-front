<!--
  Decorative: the CESU form of a mission fills in line by line, a stamp checks it, then the two halves of the brand
  heart meet above it, as in the logo. About 1.6 s, played once; nothing moves when reduced motion is asked.
-->
<template>
  <svg viewBox="0 0 240 170" aria-hidden="true" focusable="false" class="declaration h-auto w-full">
    <!-- Shapes of the design system: a soft disc behind, a pill as the ground -->
    <circle cx="120" cy="88" r="70" fill="var(--ig-primary-soft)" />
    <rect x="44" y="150" width="152" height="10" rx="5" fill="var(--ig-accent-soft)" />

    <!-- The form of the declaration -->
    <g class="sheet">
      <rect x="66" y="30" width="108" height="122" rx="12" fill="var(--ig-surface-raised)" stroke="var(--ig-primary)" stroke-width="4" />
      <rect x="82" y="46" width="48" height="10" rx="5" fill="var(--ig-primary)" />
      <!-- Lines typed one after the other: employee, period, hours, wage -->
      <rect class="line line--1" x="82" y="68" width="76" height="8" rx="4" fill="var(--ig-border-subtle)" />
      <rect class="line line--2" x="82" y="84" width="60" height="8" rx="4" fill="var(--ig-border-subtle)" />
      <rect class="line line--3" x="82" y="100" width="68" height="8" rx="4" fill="var(--ig-border-subtle)" />
      <rect class="line line--4" x="82" y="116" width="40" height="8" rx="4" fill="var(--ig-accent)" />
    </g>

    <!-- The stamp: a disc, then its check drawn -->
    <g class="stamp">
      <circle cx="164" cy="124" r="22" fill="var(--ig-primary)" />
      <path class="check" d="M153 124l8 8 14-16" fill="none" stroke="var(--ig-on-primary)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- The heart of the brand: its two halves meet, then it beats once -->
    <g class="heart">
      <g transform="translate(120 15) scale(0.9) translate(-121 -84)">
        <path class="half half--left" d="M121 84c-3-6-14-14-20-6-5 7 2 14 20 26Z" fill="var(--ig-accent)" />
        <path class="half half--right" d="M121 84c3-6 14-14 20-6 5 7-2 14-20 26Z" fill="var(--ig-primary)" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.sheet {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: sheet-in 400ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.line {
  transform-box: fill-box;
  transform-origin: left center;
  animation: line-typed 260ms ease-out both;
}
.line--1 {
  animation-delay: 300ms;
}
.line--2 {
  animation-delay: 450ms;
}
.line--3 {
  animation-delay: 600ms;
}
.line--4 {
  animation-delay: 750ms;
}

.stamp {
  transform-box: fill-box;
  transform-origin: center;
  animation: stamp-in 300ms cubic-bezier(0.3, 1.4, 0.5, 1) 950ms both;
}
.check {
  stroke-dasharray: 40;
  animation: check-drawn 300ms ease-out 1150ms both;
}

.half {
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
  animation-delay: 1100ms;
  animation-fill-mode: both;
}
.half--left {
  animation-name: half-from-left;
}
.half--right {
  animation-name: half-from-right;
}
.heart {
  transform-box: fill-box;
  transform-origin: center;
  animation: heart-beat 450ms ease-in-out 1600ms both;
}

@keyframes sheet-in {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes line-typed {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes stamp-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
@keyframes check-drawn {
  from {
    stroke-dashoffset: 40;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes half-from-left {
  from {
    transform: translateX(-18px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes half-from-right {
  from {
    transform: translateX(18px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes heart-beat {
  0%,
  100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.18);
  }
}

/* No movement when the visitor asks for less: the illustration is shown directly in its final state */
@media (prefers-reduced-motion: reduce) {
  .sheet,
  .line,
  .stamp,
  .check,
  .half,
  .heart {
    animation: none;
  }
}
</style>
