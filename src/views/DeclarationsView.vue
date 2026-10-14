<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import { CESU_URL } from '@/api/wageApi'
import AppIcon from '@/components/ui/AppIcon.vue'
import DisclosurePanel from '@/components/ui/DisclosurePanel.vue'
import DeclarationIllustration from '@/components/declarations/DeclarationIllustration.vue'
import PendingDeclarations from '@/components/tracking/PendingDeclarations.vue'

/** The declarations to make first, then why and how an employer declares the students (spec 013): each opens on a click. */
const { role } = storeToRefs(useAuthStore())

// Shown next to the title while the panel is closed: null until loaded
const pendingCount = ref(null)
const pendingBadge = computed(() => {
  if (pendingCount.value === null) {
    return ''
  }
  return pendingCount.value === 0 ? 'À jour' : `${pendingCount.value} à déclarer`
})

const REASONS = [
  {
    icon: 'file-check',
    title: 'C’est obligatoire',
    text: 'L’étudiant que vous choisissez est votre salarié le temps de la mission. Ne pas le déclarer, c’est du travail non déclaré, que la loi sanctionne.',
  },
  {
    icon: 'user',
    title: 'L’étudiant est protégé',
    text: 'Déclaré, il est couvert s’il se blesse pendant la mission, ses heures comptent pour ses droits, et l’URSSAF lui remet une attestation d’emploi.',
  },
  {
    icon: 'shield',
    title: 'Vous êtes protégé',
    text: 'Si un accident arrive chez vous pendant la mission, il relève de la Sécurité sociale au titre des accidents du travail, et non de vous seul.',
  },
  {
    icon: 'check',
    title: 'Vous payez moins',
    text: 'Les sommes déclarées ouvrent droit à un crédit d’impôt de 50 %. Avec l’option CESU+ et l’avance immédiate, vous ne payez tout de suite que la moitié environ.',
  },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <section aria-labelledby="declarations-title" class="panel flex flex-col items-center gap-6 sm:flex-row">
      <div class="w-48 shrink-0 sm:w-56">
        <DeclarationIllustration />
      </div>
      <div class="flex flex-col gap-3 text-center sm:text-left">
        <h1 id="declarations-title" class="text-3xl font-bold">Déclaration CESU</h1>
        <p class="text-lg text-ink-muted">
          {{ role === ROLES.CAREGIVER
            ? 'La personne que vous accompagnez est l’employeur de l’étudiant : vous le déclarez pour elle au CESU, après chaque mission.'
            : 'Vous êtes l’employeur de l’étudiant : vous le déclarez au CESU après chaque mission. Geen prépare tout ce qu’il faut recopier.' }}
        </p>
      </div>
    </section>

    <DisclosurePanel id="pending" title="À déclarer au CESU" :badge="pendingBadge">
      <PendingDeclarations :is-caregiver="role === ROLES.CAREGIVER" @count="pendingCount = $event" />
    </DisclosurePanel>

    <DisclosurePanel id="why" title="Pourquoi déclarer ?">
      <ul role="list" class="grid gap-4 sm:grid-cols-2">
        <li v-for="reason in REASONS" :key="reason.title" class="card flex gap-4">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
            <AppIcon :name="reason.icon" :size="24" />
          </span>
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold">{{ reason.title }}</h3>
            <p class="text-base text-ink">{{ reason.text }}</p>
          </div>
        </li>
      </ul>
    </DisclosurePanel>

    <DisclosurePanel id="how" title="Comment faire ?">
      <ol role="list" class="flex flex-col gap-3">
        <li class="card flex items-start gap-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary" aria-hidden="true">1</span>
          <p class="text-lg">
            Inscrivez-vous une seule fois, gratuitement, sur
            <a :href="CESU_URL" target="_blank" rel="noopener noreferrer" class="link">
              cesu.urssaf.fr<span class="sr-only"> (nouvel onglet)</span></a>.
          </p>
        </li>
        <li class="card flex items-start gap-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary" aria-hidden="true">2</span>
          <p class="text-lg">Activez l’option CESU+ : l’URSSAF verse le salaire à l’étudiant pour vous.</p>
        </li>
        <li class="card flex items-start gap-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary" aria-hidden="true">3</span>
          <p class="text-lg">
            Après chaque mission, recopiez la fiche « À déclarer au CESU » sur cesu.urssaf.fr, puis choisissez
            « C’est déclaré » : l’étudiant verra que sa mission est déclarée.
          </p>
        </li>
      </ol>
    </DisclosurePanel>
  </div>
</template>
