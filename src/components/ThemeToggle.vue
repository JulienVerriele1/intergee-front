<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppIcon from '@/components/ui/AppIcon.vue'

const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <!-- A compact switch: its name stays the same, its state is read as on / off -->
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    aria-label="Mode sombre"
    title="Mode sombre"
    class="focus-ring inline-flex shrink-0 items-center rounded-full p-1"
    @click="toggleTheme"
  >
    <span class="relative inline-flex h-8 w-14 items-center rounded-full border-2 border-border bg-surface-sunken transition-colors hover:bg-primary-soft" aria-hidden="true">
      <span
        class="absolute left-0.5 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary transition-transform"
        :class="isDark ? 'translate-x-6' : 'translate-x-0'"
      >
        <AppIcon :name="isDark ? 'moon' : 'sun'" :size="16" />
      </span>
    </span>
  </button>
</template>
