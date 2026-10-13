<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { fetchStudentPhoto } from '@/api/profileApi'
import AppIcon from './AppIcon.vue'

/** Photo of a student, loaded with the access token (ADR 0007); a placeholder without photo. */
const props = defineProps({
  studentId: { type: String, required: true },
  firstName: { type: String, required: true },
  size: { type: Number, default: 64 },
  /** False skips the request when the student is known to have no photo */
  hasPhoto: { type: Boolean, default: true },
  /** Changes to reload the photo after an upload */
  version: { type: Number, default: 0 },
})

const url = ref(null)

function release() {
  if (url.value) {
    URL.revokeObjectURL(url.value)
    url.value = null
  }
}

async function load() {
  release()
  if (!props.hasPhoto) {
    return
  }
  try {
    url.value = URL.createObjectURL(await fetchStudentPhoto(props.studentId))
  } catch {
    // No photo, or not visible: the placeholder stays
  }
}

watch(() => [props.studentId, props.hasPhoto, props.version], load, { immediate: true })
onBeforeUnmount(release)
</script>

<template>
  <img
    v-if="url"
    :src="url"
    :alt="`Photo de ${firstName}`"
    :width="size"
    :height="size"
    class="shrink-0 rounded-full border-2 border-border-subtle object-cover"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
  <span
    v-else
    role="img"
    :aria-label="`${firstName} n'a pas encore de photo`"
    class="flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <AppIcon name="user" :size="Math.round(size / 2)" />
  </span>
</template>
