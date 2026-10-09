<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppIcon from '@/components/ui/AppIcon.vue'

const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <!-- A switch: its name stays the same, its state is read as on / off -->
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    class="focus-ring inline-flex min-h-target items-center gap-3 rounded-full border-2 border-border bg-surface-raised py-1 pr-4 pl-1 text-lg font-bold text-ink transition-colors hover:bg-primary-soft"
    @click="toggleTheme"
  >
    <span class="relative inline-flex h-12 w-[5.5rem] shrink-0 items-center rounded-full bg-surface-sunken" aria-hidden="true">
      <span
        class="absolute top-1 left-1 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary transition-transform"
        :class="isDark ? 'translate-x-10' : 'translate-x-0'"
      >
        <AppIcon :name="isDark ? 'moon' : 'sun'" :size="24" />
      </span>
    </span>
    <span>Mode sombre</span>
  </button>
</template>
