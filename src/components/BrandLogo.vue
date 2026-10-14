<script setup>
/**
 * The Intergee mark and name, as shown in the header. The mark is the heart of the site icon, made of two halves:
 * at launch they come towards each other and meet, then the heart beats once, while "Inter" and "gee" slide in from
 * either side to form the word: two generations coming together. About a second, played once when the page loads,
 * then still; skipped when reduced motion is asked.
 */
</script>

<template>
  <span class="brand inline-flex items-center gap-3">
    <svg viewBox="0 0 32 32" class="size-10 shrink-0" aria-hidden="true" focusable="false">
      <!-- Same tile and colours as public/favicon.svg, whatever the theme -->
      <rect width="32" height="32" rx="8" fill="#fbf7f0" />
      <g class="heart">
        <g transform="translate(16 16.6) scale(0.62) translate(-121 -92)">
          <path class="half half--left" d="M121 84c-3-6-14-14-20-6-5 7 2 14 20 26Z" fill="#f0a457" />
          <path class="half half--right" d="M121 84c3-6 14-14 20-6 5 7-2 14-20 26Z" fill="#0e6b62" />
        </g>
      </g>
    </svg>
    <!-- Read as one word; the two animated halves are hidden from assistive tech -->
    <span class="sr-only">Intergee</span>
    <span class="word" aria-hidden="true"><span class="word__part word__part--left">Inter</span><span class="word__part word__part--right">gee</span></span>
  </span>
</template>

<style scoped>
.half,
.word__part {
  animation-duration: 900ms;
  animation-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
  animation-fill-mode: both;
}

/* The halves start apart and meet in the middle (units of the heart drawing, scaled down in the tile) */
.half--left {
  animation-name: half-from-left;
}
.half--right {
  animation-name: half-from-right;
}

/* Once the halves have met, the heart beats once */
.heart {
  transform-box: fill-box;
  transform-origin: center;
  animation: heart-beat 450ms ease-in-out 850ms both;
}

/* The word: "Inter" from the left, "gee" from the right, slightly after the mark */
.word {
  display: inline-flex;
  /* Each half appears from the word's own edge, never over the mark */
  overflow: hidden;
  padding: 0.12em 0.08em;
}
.word__part {
  display: inline-block;
  animation-delay: 150ms;
}
.word__part--left {
  animation-name: word-from-left;
}
.word__part--right {
  animation-name: word-from-right;
}

@keyframes half-from-left {
  from {
    transform: translateX(-18px);
    opacity: 0;
  }
  30% {
    opacity: 1;
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
  30% {
    opacity: 1;
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
@keyframes word-from-left {
  from {
    transform: translateX(-0.75em);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes word-from-right {
  from {
    transform: translateX(0.75em);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* No movement when the visitor asks for less: the logo is shown directly in its final state */
@media (prefers-reduced-motion: reduce) {
  .half,
  .heart,
  .word__part {
    animation: none;
  }
}
</style>
