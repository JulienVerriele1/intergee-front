<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

/** First step of the registration: who registers (spec 001). */
const CHOICES = [
  {
    to: { name: 'register-student' },
    title: 'Je suis étudiant',
    description: 'Je propose mon aide à des personnes âgées ou en situation de handicap près de chez moi.',
  },
  {
    to: { name: 'register-beneficiary' },
    title: 'Je suis bénéficiaire',
    description: "J'ai besoin d'un coup de main : courses, compagnie, aide numérique, jardinage.",
  },
]
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Créer un compte</h1>
      <p class="mt-1 text-lg text-ink-muted">Vous êtes…</p>
    </div>
    <ul role="list" class="grid gap-4 sm:grid-cols-2">
      <li v-for="choice in CHOICES" :key="choice.title">
        <RouterLink
          :to="choice.to"
          class="card focus-ring flex h-full flex-col gap-3 transition-colors hover:border-primary hover:bg-primary-soft"
        >
          <span class="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-ink" aria-hidden="true">
            <AppIcon name="user" :size="24" />
          </span>
          <span class="text-xl font-bold text-ink">{{ choice.title }}</span>
          <span class="text-ink-muted">{{ choice.description }}</span>
        </RouterLink>
      </li>
    </ul>
    <p class="text-lg">
      Déjà inscrit ?
      <RouterLink :to="{ name: 'login' }" class="link">Se connecter</RouterLink>
    </p>
  </div>
</template>
