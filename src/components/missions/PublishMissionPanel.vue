<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import GenerationsIllustration from './GenerationsIllustration.vue'

/** Invitation to publish a mission, on the missions page of a beneficiary or a caregiver. */
defineProps({
  /** A caregiver publishes for a person they accompany */
  isCaregiver: { type: Boolean, default: false },
})
</script>

<template>
  <section aria-labelledby="publish-mission-title" class="panel flex flex-col items-center gap-6 sm:flex-row">
    <div class="w-48 shrink-0 sm:w-56">
      <GenerationsIllustration />
    </div>
    <div class="flex flex-col gap-3 text-center sm:text-left">
      <h2 id="publish-mission-title" class="text-2xl font-bold">
        {{ isCaregiver ? 'Un coup de main pour la personne que vous accompagnez ?' : 'Besoin d’un coup de main ?' }}
      </h2>
      <p class="text-lg text-ink-muted">
        Courses, compagnie, aide numérique, jardinage : publiez une mission, un étudiant près de chez
        {{ isCaregiver ? 'elle' : 'vous' }} pourra proposer son aide.
      </p>
      <RouterLink :to="{ name: 'publish-mission' }" class="btn-primary self-center sm:self-start">
        <AppIcon name="plus" :size="22" />
        Ajouter une mission
      </RouterLink>
    </div>
  </section>
</template>
