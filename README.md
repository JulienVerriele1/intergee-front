# Intergee — Front-end

SPA Vue 3 de la plateforme Intergee, qui met en relation des étudiants et des personnes âgées ou en situation
de handicap. Elle consomme l'API Spring Boot du dépôt [`intergee`](../intergee).

Stack : Vue 3 (`<script setup>`), Vite, Vue Router, Pinia, Tailwind CSS 4, Axios, Vitest.

## Démarrage

Prérequis : Node 20.19+ (testé avec Node 24) et le backend lancé en profil `local`
(`./mvnw spring-boot:run -Dspring-boot.run.profiles=local` dans `../intergee`).

```bash
npm install
npm run dev        # https://localhost:5173 (certificat auto-signé à accepter une fois)
npm test           # tests unitaires (Vitest)
npm run build      # build de production dans dist/
npm run preview    # sert dist/ en HTTPS sur https://localhost:4173
```

Le fichier `.npmrc` du projet pointe vers le registre npm public, indépendamment du `~/.npmrc` global.

## HTTPS et appels API

- En dev et en preview, Vite sert l'application en **HTTPS** (`@vitejs/plugin-basic-ssl`).
- Le navigateur appelle `/api/...` sur la même origine. Vite fait suivre ces appels au backend en retirant le
  préfixe `/api`, par exemple `/api/auth/login` → `http://localhost:8080/auth/login`. Le backend n'a donc
  pas besoin de CORS. Pour changer la cible, utilisez `API_PROXY_TARGET` (cf. `.env.example`).
- En production, le reverse proxy TLS reproduit ce comportement. Exemple nginx :

```nginx
server {
    listen 443 ssl http2;
    server_name intergee.example.org;
    # ssl_certificate / ssl_certificate_key : Let's Encrypt par exemple
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    root /var/www/intergee-front/dist;

    location /api/ {
        proxy_pass http://backend:8080/;   # le / final retire le préfixe /api
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        try_files $uri /index.html;        # routes de la SPA
    }
}
```

## Structure

```
src/
├── main.js                  # Pinia, restauration de session, routeur
├── App.vue                  # Layout, lien d'évitement, redirection en fin de session
├── api/                     # Accès réseau (seule couche qui parle HTTP)
│   ├── http.js              #   Instance Axios + intercepteurs (JWT, 401)
│   ├── apiError.js          #   Normalisation des erreurs (problem details RFC 9457)
│   ├── authApi.js           #   Login, inscription par rôle
│   ├── missionApi.js        #   Publication, missions ouvertes
│   └── geocodingApi.js      #   Géocodage d'adresse (Géoplateforme IGN), sans JWT
├── stores/auth.js           # Store Pinia : session, rôle, persistance, expiration
├── router/
│   ├── index.js             # Routes + guard global
│   └── guards.js            # Règle de navigation pure (testée)
├── views/                   # Pages routées : Login, Dashboard, Forbidden, NotFound
├── components/
│   ├── AppHeader.vue
│   ├── ui/                  # Composants génériques (FormField, AlertMessage)
│   └── missions/            # Composants métier (formulaire, liste, carte)
├── missions/missionForm.js  # Règles et mapping du formulaire de mission (JS pur, testé)
├── constants/               # Rôles, catégories de missions
└── utils/                   # JWT, formatage, redirection sûre
tests/unit/                  # Tests Vitest
```

Principes : les vues assemblent, les composants affichent, `api/` parle au serveur, `stores/` porte l'état
partagé, et la logique métier testable vit dans des modules JS purs (`missions/`, `router/guards.js`).

## Authentification

- `POST /auth/login` renvoie un JWT. Le rôle (`role`), l'identifiant (`sub`) et l'expiration (`exp`) sont lus
  dans le jeton, **sans vérifier la signature** : seul le backend fait foi, le front adapte seulement l'interface.
- Le jeton est conservé dans `localStorage` (persistance demandée), restauré au chargement s'il n'a pas expiré,
  et la session se ferme automatiquement à son expiration (1 h).
- Un 401 de l'API ferme la session et renvoie vers `/login?redirect=…`. Seuls les chemins internes sont
  acceptés comme redirection.
- Compromis : `localStorage` est lisible par un script injecté (XSS). Pour durcir la sécurité, il faudra un
  cookie `HttpOnly` émis par le backend.

## Routes et rôles

| Route        | Accès                       | Contenu |
|--------------|-----------------------------|---------|
| `/login`     | invités uniquement          | Connexion |
| `/`          | `STUDENT`, `BENEFICIARY`, `CAREGIVER` | Étudiant : missions ouvertes de sa zone (filtre, pagination). Bénéficiaire ou aidant : publier une mission |
| `/forbidden` | connecté                    | Rôle non autorisé |

Les routes déclarent `meta.requiresAuth`, `meta.roles` et `meta.guestOnly` ; `router/guards.js` applique ces règles.

## Design system

L'interface applique le design system **Intergee** (lisible, facile à toucher, chaleureux). Les jetons vivent dans
`src/assets/main.css` : chaque valeur est une variable `--ig-*` (thème clair, et thème sombre via
`prefers-color-scheme`), exposée à Tailwind par `@theme`.

- Couleurs : `bg-surface`, `bg-surface-raised`, `bg-surface-sunken`, `text-ink`, `text-ink-muted`, `border-border`,
  `primary` / `on-primary` / `primary-ink` / `primary-soft`, `accent` / `accent-soft`, `success(-soft)`,
  `danger(-soft)`, `outline-focus`. N'utilisez plus les palettes Tailwind (`slate`, `blue`…).
- Typographie : Atkinson Hyperlegible Next (Google Fonts), texte courant à 18px, jamais moins de 16px.
- Zones cliquables : `min-h-target` (56px) ; utilitaires `btn-primary` (une action principale par écran),
  `btn-secondary`, `link`, `form-input`, `card`, `tag`, `focus-ring`.
- Statuts et messages : toujours une icône (`AppIcon`) et un mot, jamais la couleur seule.
- Thème : attribut `data-theme` (`light` / `dark`) sur `<html>`, posé avant le premier affichage par le script
  d'`index.html` (choix mémorisé, sinon réglage du système) et basculé par `ThemeToggle` en haut à droite
  (`composables/useTheme.js`, mémorisé dans `localStorage`).
- Fond : `AppBackdrop` pose, entre l'en-tête et le pied de page, les formes du design system (disque, demi-disques
  qui se font face, pilules) en couleurs douces sur fond transparent ; décoratif (`aria-hidden`), non imprimé.
- Logo : `BrandLogo` (en-tête). Au chargement, les deux demi-disques du symbole se rejoignent et « Inter » et « gee »
  glissent l'un vers l'autre pour former le nom (900 ms, une fois), puis tout reste immobile ; aucune animation si
  `prefers-reduced-motion`. Les lecteurs d'écran lisent « Intergee ».
- Dates : `DateTimePicker` (calendrier mensuel à cases de 56px, navigation au clavier, puis créneaux d'une
  demi-heure de 8 h à 20 h) remplace le `datetime-local` natif, illisible et non stylable. Même valeur
  `AAAA-MM-JJTHH:mm`, donc même validation.

## Accessibilité et responsive

- Mise en page mobile d'abord (Tailwind), cibles tactiles de 44 px minimum, `prefers-reduced-motion` respecté.
- Labels associés à chaque champ, aides et erreurs reliées par `aria-describedby`, `aria-invalid`, focus sur
  le premier champ en erreur, messages annoncés (`role="alert"` / `role="status"`).
- Lien « Aller au contenu », focus déplacé sur le contenu à chaque changement de page, titre de page mis à jour.

## Écarts connus avec le backend

- **Inscription étudiant** : depuis la spec 004, l'API exige `latitude` / `longitude` du centre de la zone
  d'intervention. La future vue d'inscription devra géocoder la ville (`geocodeAddress`) avant l'envoi.
- **Aidant** : aucun endpoint ne liste encore les bénéficiaires gérés, l'aidant saisit donc l'identifiant du
  bénéficiaire (renvoyé par `POST /caregivers/me/beneficiaries`).
- **Messages d'erreur 400/409** : affichés tels que renvoyés par le backend, donc en anglais. Des codes d'erreur
  dans les problem details permettraient de les traduire.
- Pas encore de vue d'inscription : la logique est prête dans le store (`register(role, payload)`).
