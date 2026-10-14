// Local development only (npm run dev): accounts created by the API in its local profile (LocalDemoAccounts).
// Never imported by the production build: see LocalModePanel and DevRoleSwitch, loaded under import.meta.env.DEV.
export const DEV_ACCOUNTS = Object.freeze([
  {
    role: 'STUDENT',
    label: 'Étudiant',
    description: 'Léa, étudiante vérifiée avec un profil complet',
    email: 'etudiant@demo.intergee.fr',
    password: 'demo-intergee-local',
  },
  {
    role: 'BENEFICIARY',
    label: 'Bénéficiaire',
    description: 'Jeanne, qui publie des missions à Lille',
    email: 'beneficiaire@demo.intergee.fr',
    password: 'demo-intergee-local',
  },
  {
    role: 'MODERATOR',
    label: 'Modérateur',
    description: 'Max, de l’équipe Geen, qui modère les commentaires signalés',
    email: 'moderateur@demo.intergee.fr',
    password: 'demo-intergee-local',
  },
])

export const DEV_ACCOUNTS_MISSING =
  'Comptes de démo introuvables : démarrez le back avec le profil local (./mvnw spring-boot:run -Dspring-boot.run.profiles=local).'
