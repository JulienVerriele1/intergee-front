<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * A panel of the design system that opens on a click on its title (WAI-ARIA disclosure): the title is a button in a
 * heading, so that it is reached by the keyboard and announced as expanded or collapsed.
 */
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  /** Short status next to the title, e.g. "6 à déclarer" */
  badge: { type: String, default: '' },
  open: { type: Boolean, default: false },
})

const expanded = ref(props.open)
</script>

<template>
  <section :aria-labelledby="`${id}-title`" class="panel flex flex-col gap-4">
    <h2 :id="`${id}-title`" class="text-2xl font-bold">
      <button
        type="button"
        class="focus-ring flex min-h-target w-full items-center gap-3 rounded-lg text-left"
        :aria-expanded="expanded"
        :aria-controls="`${id}-content`"
        @click="expanded = !expanded"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
          aria-hidden="true"
        >
          <AppIcon name="chevron-down" :size="22" />
        </span>
        <span class="flex-1">{{ title }}</span>
        <span v-if="badge" class="tag bg-accent-soft pl-3 text-base">{{ badge }}</span>
      </button>
    </h2>
    <!-- Kept mounted while collapsed: its content may load data the title shows -->
    <div v-show="expanded" :id="`${id}-content`">
      <slot />
    </div>
  </section>
</template>
