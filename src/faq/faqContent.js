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
            'Pour postuler, votre profil doit être complet : une photo de votre visage, au moins une compétence, votre date de naissance, votre adresse, votre niveau d’études et une présentation de 300 à 1 000 caractères. Le sexe est facultatif.',
            'Votre présentation est lue par les bénéficiaires et les aidants qui choisissent parmi les candidats. N’y indiquez aucune information sur votre santé.',
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
          question: 'Comment suis-je payé ?',
          answer: [
            'Pour chaque mission, vous êtes le salarié du bénéficiaire, qui vous déclare au CESU (Chèque emploi service universel) après la mission. Le salaire horaire net est indiqué sur chaque mission : jamais moins que le SMIC net, congés payés compris.',
            'Avec l’option CESU+, c’est l’URSSAF qui vous verse le salaire. Dans « Mes candidatures », chaque mission passée indique si elle a été déclarée.',
            'Le bénéficiaire vous demandera votre numéro de sécurité sociale pour vous déclarer : donnez-le-lui directement, Geen ne le demande jamais. Jusqu’à 25 ans, vos salaires d’étudiant sont exonérés d’impôt sur le revenu, dans une certaine limite.',
          ],
        },
        {
          question: 'Comment fonctionnent les avis ?',
          answer: [
            'Une fois la mission confirmée par le bénéficiaire, chacun peut noter l’autre de 1 à 5 étoiles pendant 14 jours. Une note reste cachée jusqu’à ce que l’autre ait noté aussi, ou jusqu’à la fin des 14 jours : personne ne note en réaction.',
            'Vous pouvez ajouter un commentaire de 500 caractères au plus, publié avec votre prénom. Restez factuel et bienveillant : aucune information de santé, aucun nom.',
            'Vos avis reçus sont dans le menu en haut à droite. Un commentaire vous semble injurieux ou indiscret ? Choisissez « Signaler ce commentaire » : il est masqué aussitôt, puis vérifié par l’équipe Geen.',
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
            'Avant votre première mission, présentez-vous dans « Mon profil », depuis le menu en haut à droite : de 300 à 1 000 caractères. Seul l’étudiant que vous choisissez lit votre présentation.',
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
            'Aucune. Geen ne demande jamais d’information sur la santé ou le handicap : décrivez seulement la tâche à réaliser.',
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
            'Dans « Mes missions », choisissez « Ajouter une mission ». Indiquez la catégorie, les compétences nécessaires, la date et l’heure, la durée (de 15 minutes à 4 heures), l’adresse et le salaire horaire net.',
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
            'Non. Les étudiants ne voient que le code postal, la ville et la distance. Votre adresse, votre téléphone et votre présentation sont communiqués uniquement à l’étudiant que vous choisissez.',
          ],
        },
      ],
    },
    {
      title: 'Rémunérer l’étudiant',
      questions: [
        {
          question: 'Comment rémunérer l’étudiant ?',
          answer: [
            'Vous êtes son employeur, et vous le déclarez au CESU, sur cesu.urssaf.fr : inscription gratuite, une seule fois. Le salaire horaire net est au moins le SMIC net, congés payés compris ; Geen vous montre ce que la mission vous coûtera vraiment.',
            'Choisissez l’option CESU+ : l’URSSAF verse le salaire à l’étudiant pour vous, et l’avance immédiate du crédit d’impôt vous évite d’avancer la moitié de la somme.',
          ],
        },
        {
          question: 'Comment déclarer une mission ?',
          answer: [
            'Une fois la mission confirmée, la page « Déclaration CESU », en haut de l’écran, affiche une fiche « À déclarer » par étudiant et par mois : recopiez-la sur cesu.urssaf.fr, puis choisissez « C’est déclaré ». L’étudiant voit alors que sa mission est déclarée.',
          ],
        },
        {
          question: 'Ai-je droit à un crédit d’impôt ?',
          answer: [
            'Oui, en principe : 50 % des sommes versées pour des services à la personne à domicile. Les conditions exactes sont sur impots.gouv.fr et cesu.urssaf.fr.',
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
            'Vous pouvez ajouter un commentaire de 500 caractères au plus, publié avec votre prénom. Avant de choisir un candidat, « Lire les avis » montre ce que d’autres en ont dit. Un commentaire reçu vous semble injurieux ou indiscret ? Signalez-le depuis vos avis reçus : il est masqué aussitôt, puis vérifié par l’équipe Geen.',
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
