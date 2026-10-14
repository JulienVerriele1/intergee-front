<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import { FAQ, FAQ_AUDIENCES } from '@/faq/faqContent'

/** Questions and answers for students and for beneficiaries or caregivers, readable before registering. */
const route = useRoute()
const router = useRouter()
const { role } = storeToRefs(useAuthStore())

function defaultAudience() {
  if (FAQ_AUDIENCES.some((audience) => audience.value === route.query.pour)) {
    return route.query.pour
  }
  return role.value && role.value !== ROLES.STUDENT ? 'beneficiary' : 'student'
}

const audience = ref(defaultAudience())
const sections = computed(() => FAQ[audience.value])

// The chosen audience goes into the address, so that a link opens the right tab
watch(audience, (value) => router.replace({ query: { ...route.query, pour: value } }))
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Questions fréquentes</h1>
      <p class="mt-1 text-lg text-ink-muted">Tout ce qu’il faut savoir pour s’entraider sur Intergee.</p>
    </div>

    <div role="group" aria-label="Je suis" class="inline-flex flex-wrap gap-1 self-start rounded-full border-2 border-border bg-surface-raised p-1">
      <button
        v-for="option in FAQ_AUDIENCES"
        :key="option.value"
        type="button"
        :aria-pressed="audience === option.value"
        class="focus-ring min-h-target rounded-full px-6 text-lg font-bold transition-colors"
        :class="audience === option.value ? 'bg-primary text-on-primary' : 'text-ink hover:bg-primary-soft'"
        @click="audience = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-for="section in sections" :key="section.title" :aria-labelledby="`faq-${section.title}`" class="flex flex-col gap-3">
      <h2 :id="`faq-${section.title}`" class="text-2xl font-bold">{{ section.title }}</h2>
      <details v-for="item in section.questions" :key="item.question" class="card group py-0">
        <summary class="focus-ring flex min-h-target cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold">
          {{ item.question }}
          <span aria-hidden="true" class="text-2xl text-primary-ink transition-transform group-open:rotate-45">+</span>
        </summary>
        <div class="flex flex-col gap-2 pb-5 text-lg text-ink">
          <p v-for="paragraph in item.answer" :key="paragraph">{{ paragraph }}</p>
        </div>
      </details>
    </section>
  </div>
</template>
