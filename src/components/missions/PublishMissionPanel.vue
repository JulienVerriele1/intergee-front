<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import GenerationsIllustration from './GenerationsIllustration.vue'

/** Invitation to publish a mission, on the missions page of a beneficiary or a caregiver. */
defineProps({
  /** A caregiver publishes for a person they accompany */
  isCaregiver: { type: Boolean, default: false },
  /** False while a beneficiary has no presentation: they publish once it is given (spec 012, RG-3) */
  profileComplete: { type: Boolean, default: true },
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
      <template v-if="profileComplete">
        <RouterLink :to="{ name: 'publish-mission' }" class="btn-primary self-center sm:self-start">
          <AppIcon name="plus" :size="22" />
          Ajouter une mission
        </RouterLink>
      </template>
      <template v-else>
        <p class="text-lg font-bold text-ink">
          Avant votre première mission, présentez-vous : l'étudiant que vous choisirez lira votre présentation.
        </p>
        <RouterLink :to="{ name: 'profile' }" class="btn-primary self-center sm:self-start">
          <AppIcon name="user" :size="22" />
          Compléter mon profil
        </RouterLink>
      </template>
    </div>
  </section>
</template>
