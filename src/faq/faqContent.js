// Questions and answers for each kind of user, written from the business rules of the specifications 001 to 011
// of the API repository: to update with them.

export const FAQ_AUDIENCES = Object.freeze([
  { value: 'student', label: 'Je suis étudiant' },
  { value: 'beneficiary', label: 'Je suis bénéficiaire ou aidant' },
])

export const FAQ = Object.freeze({
  student: [
    {
      title: 'Commencer',
      questions: [
        {
          question: 'Comment créer mon compte ?',
          answer: [
            'Sur la page de connexion, choisissez « Créer un compte », puis « Je suis étudiant ».',
            'Indiquez votre établissement et votre zone d’intervention : la ville autour de laquelle vous acceptez de rendre service, et la distance maximale (de 2 à 50 km).',
          ],
        },
        {
          question: 'Pourquoi dois-je compléter mon profil ?',
          answer: [
            'Pour postuler, votre profil doit être complet : une photo de votre visage, au moins une compétence, votre date de naissance, votre adresse et votre niveau d’études. Le sexe est facultatif.',
            'Vous le complétez dans « Mon profil », depuis le menu en haut à droite.',
          ],
        },
        {
          question: 'Y a-t-il un âge minimum ?',
          answer: [
            'Oui, il faut avoir au moins 18 ans. Votre date de naissance ne se saisit qu’une fois : elle ne peut plus être modifiée ensuite.',
          ],
        },
        {
          question: 'Pourquoi mon compte doit-il être vérifié ?',
          answer: [
            'Les personnes que vous aidez sont souvent âgées ou en situation de handicap. Seuls les étudiants dont la carte étudiante a été vérifiée peuvent postuler. Vous pouvez consulter les missions avant cette vérification.',
          ],
        },
      ],
    },
    {
      title: 'Trouver une mission et postuler',
      questions: [
        {
          question: 'Quelles missions me sont proposées ?',
          answer: [
            'Les missions à venir dans votre zone d’intervention, qui demandent au moins une de vos compétences, et auxquelles vous n’avez pas encore postulé. Les compétences que vous avez sont mises en évidence sur chaque mission.',
            'Une fois votre candidature envoyée, la mission quitte cette liste et apparaît dans « Mes candidatures ».',
            'Si aucune mission ne s’affiche, ajoutez des compétences dans « Mon profil ».',
          ],
        },
        {
          question: 'Pourquoi l’adresse exacte n’est-elle pas affichée ?',
          answer: [
            'Pour protéger les bénéficiaires, vous ne voyez que le code postal, la ville et la distance. L’adresse et le téléphone sont communiqués uniquement à l’étudiant choisi.',
          ],
        },
        {
          question: 'Pourquoi ne puis-je pas postuler à une mission ?',
          answer: [
            'Plusieurs raisons sont possibles : votre compte n’est pas encore vérifié, votre profil est incomplet, la mission a déjà reçu 3 candidatures, elle a commencé, vous y avez déjà postulé, ou elle a lieu en même temps qu’une autre mission à laquelle vous avez postulé.',
          ],
        },
        {
          question: 'Puis-je retirer ma candidature ?',
          answer: [
            'Oui, tant que le bénéficiaire ne vous a pas choisi : dans « Mes candidatures », onglet « À venir », choisissez « Retirer ma candidature ».',
          ],
        },
      ],
    },
    {
      title: 'Après la candidature',
      questions: [
        {
          question: 'Comment savoir si j’ai été choisi ?',
          answer: [
            'La mission apparaît dans « Mes candidatures », onglet « Retenues ». Vous y trouvez l’adresse, le lien vers la carte et le téléphone du bénéficiaire.',
          ],
        },
        {
          question: 'Que signifie « Non retenue » ?',
          answer: [
            'Le bénéficiaire a choisi un autre étudiant. Votre créneau est libéré : vous pouvez postuler à une autre mission au même moment.',
          ],
        },
        {
          question: 'Et la compensation ?',
          answer: [
            'Son montant est indiqué sur chaque mission. Son versement n’est pas encore géré par Intergee.',
          ],
        },
        {
          question: 'Comment fonctionnent les avis ?',
          answer: [
            'Une fois la mission confirmée par le bénéficiaire, chacun peut noter l’autre de 1 à 5 étoiles pendant 14 jours. Une note reste cachée jusqu’à ce que l’autre ait noté aussi, ou jusqu’à la fin des 14 jours : personne ne note en réaction.',
            'Vos avis reçus sont dans le menu en haut à droite.',
          ],
        },
      ],
    },
    {
      title: 'Mes données',
      questions: [
        {
          question: 'Qui voit mes informations ?',
          answer: [
            'Les bénéficiaires et les aidants voient votre photo, votre prénom, votre âge, votre établissement, votre niveau d’études, vos compétences et votre note.',
            'Votre adresse, votre date de naissance et votre sexe ne sont jamais montrés. Votre nom et votre e-mail ne sont communiqués qu’au bénéficiaire qui vous choisit.',
          ],
        },
        {
          question: 'J’ai oublié mon mot de passe.',
          answer: ['La réinitialisation du mot de passe n’existe pas encore.'],
        },
      ],
    },
  ],
  beneficiary: [
    {
      title: 'Commencer',
      questions: [
        {
          question: 'Comment créer mon compte ?',
          answer: [
            'Sur la page de connexion, choisissez « Créer un compte », puis « Je suis bénéficiaire ». Indiquez votre adresse et votre téléphone.',
          ],
        },
        {
          question: 'Je suis aidant : comment agir pour la personne que j’accompagne ?',
          answer: [
            'Vous publiez les missions en son nom, avec l’identifiant qui vous a été communiqué à la création de son compte. Dans « Mes missions », vous voyez les missions de toutes les personnes que vous accompagnez : vous pouvez choisir un étudiant, confirmer la mission et l’évaluer à sa place.',
          ],
        },
        {
          question: 'Quelles informations sur ma santé dois-je donner ?',
          answer: [
            'Aucune. Intergee ne demande jamais d’information sur la santé ou le handicap : décrivez seulement la tâche à réaliser.',
          ],
        },
      ],
    },
    {
      title: 'Publier une mission',
      questions: [
        {
          question: 'Comment publier une mission ?',
          answer: [
            'Dans « Mes missions », choisissez « Ajouter une mission ». Indiquez la catégorie, les compétences nécessaires, la date et l’heure, la durée (de 15 minutes à 4 heures), l’adresse et la compensation.',
          ],
        },
        {
          question: 'Quels types d’aide puis-je demander ?',
          answer: [
            'Cinq catégories : aide aux courses, compagnie, aide informatique, petits travaux de jardinage, et accessibilité (langue des signes, lecture du courrier). Aucun soin ni aucune aide à la toilette ou aux médicaments : ces actes sont réservés aux professionnels.',
          ],
        },
        {
          question: 'À quoi servent les compétences nécessaires ?',
          answer: [
            'Seuls les étudiants qui possèdent au moins une de ces compétences voient votre mission. Choisissez-en au moins une.',
          ],
        },
        {
          question: 'Mon adresse est-elle visible ?',
          answer: [
            'Non. Les étudiants ne voient que le code postal, la ville et la distance. Votre adresse et votre téléphone sont communiqués uniquement à l’étudiant que vous choisissez.',
          ],
        },
      ],
    },
    {
      title: 'Choisir un étudiant',
      questions: [
        {
          question: 'Combien d’étudiants peuvent postuler ?',
          answer: [
            'Jusqu’à 3 par mission. La mission reste visible des autres étudiants jusqu’à la troisième candidature.',
          ],
        },
        {
          question: 'Comment choisir un étudiant ?',
          answer: [
            'Dans « Mes missions », choisissez « Voir les candidats ». Pour chacun, vous voyez sa photo, son prénom, son âge, son établissement, son niveau d’études, sa note et les compétences demandées qu’il possède.',
            'Votre choix est définitif : les autres candidatures sont refusées, et l’étudiant choisi reçoit votre adresse.',
          ],
        },
        {
          question: 'Les étudiants sont-ils vérifiés ?',
          answer: [
            'Seuls les étudiants dont la carte étudiante a été vérifiée peuvent postuler. Le badge « Étudiant vérifié » l’indique dans la liste des candidats.',
          ],
        },
      ],
    },
    {
      title: 'Après la mission',
      questions: [
        {
          question: 'Pourquoi confirmer que la mission a eu lieu ?',
          answer: [
            'Une fois l’heure de fin passée, choisissez « Confirmer que la mission a eu lieu » dans « Mes missions ». Cette confirmation est définitive, et elle ouvre les avis.',
          ],
        },
        {
          question: 'Comment fonctionnent les avis ?',
          answer: [
            'Pendant 14 jours après la confirmation, vous pouvez noter l’étudiant de 1 à 5 étoiles, et il peut vous noter. Une note reste cachée jusqu’à ce que l’autre ait noté aussi, ou jusqu’à la fin des 14 jours.',
          ],
        },
        {
          question: 'Puis-je annuler ou modifier une mission ?',
          answer: ['Pas encore : ces fonctions sont prévues dans une prochaine version.'],
        },
        {
          question: 'J’ai oublié mon mot de passe.',
          answer: ['La réinitialisation du mot de passe n’existe pas encore.'],
        },
      ],
    },
  ],
})
