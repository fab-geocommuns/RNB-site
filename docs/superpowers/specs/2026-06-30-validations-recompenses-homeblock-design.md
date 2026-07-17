# Validations & Récompenses — homeBlock (jeu de l'été 2026)

Date : 2026-06-30
Composant cible : `components/games/summerGames/homeBlock.tsx`

## Contexte

Le jeu « Validations & Récompenses » met en avant la validation collaborative des
bâtiments du RNB. Le `homeBlock` affiche déjà un titre, une consigne, un
emplacement de barre de progression (vide aujourd'hui) et trois classements
(départements, organisations, participants). On ajoute / ajuste trois éléments.

Le vrai backend n'est pas branché : tout passe par les route handlers mock sous
`/api/mock`, sélectionnés via `NEXT_PUBLIC_SUMMER_GAME_API_BASE` (cf.
`utils/summerGames.tsx`). Le branchement à la vraie API se fera plus tard, sans
changer la forme des réponses.

## 1. Barre de progression

Les utilisateurs partagent un objectif commun lié au nombre total de validations.

- **Markup** : réutiliser la structure de l'édition 2025 (présente en historique
  git, classes déjà définies dans le SCSS), dans le `.barShell` existant :
  ```jsx
  <div className={styles.bar}>
    <div className={styles.progress} style={{ width: `${percent}%` }}>
      <span className={styles.progressTotal}>{absolute}</span>
    </div>
  </div>
  ```
- **Données** : déjà disponibles via `useSummerGamesData(limit)` →
  `summerGamesData.shared` : `percent` (arrondi global/goal·100), `absolute`
  (global), `goal`. `width` est borné à 100 %.
- **Légende** : conserver la légende actuelle (« Validations faites » + « N
  validations faites par la communauté »).
- **Couleur de remplissage** : retoucher le dégradé de `.progress` dans
  `styles/summerGames.module.scss`. Aujourd'hui : vert (`$accent-color` #42f19d)
  → jaune (`$accent-color-light`). Nouveau : léger dégradé vert d'eau →
  vert d'eau plus clair, basé sur le `$accent-color` #42f19d (la couleur du
  sous-titre « Le nouveau jeu participatif du RNB »).

## 2. Badges (nouveau)

Montrer les badges (« trophées ») pouvant être gagnés, sous la barre de
progression. D'après la PR backend fab-geocommuns/RNB-coeur#947, il existe
4 trophées, chacun avec 1 à 3 niveaux.

### Endpoints mockés

Sous la même base que le mock de classement (`/api/mock/editions/...`), forme
identique à la vraie API (PR #947) :

1. `GET /api/mock/editions/trophies` — liste de tous les trophées et le nombre
   de gagnants :

   ```json
   [
     {
       "trophy": "validateur",
       "trophy_label": "validateur",
       "description": "Gagnez ce trophée en validant des bâtiments dans le RNB. Plus vous validez, plus votre niveau augmente.",
       "count": 128,
       "levels": [
         { "level": 1, "level_label": "apprenti", "count": 128 },
         { "level": 2, "level_label": "maçon", "count": 34 },
         { "level": 3, "level_label": "entreprise du bâtiment", "count": 5 }
       ]
     },
     ...
   ]
   ```

   Les 4 trophées (libellés et descriptions repris à l'identique du modèle
   `Trophy` backend) :
   - `validateur` (« validateur ») — niveaux : apprenti / maçon / entreprise du bâtiment
   - `course_de_fond` (« course de fond ») — niveaux : coureur du dimanche / semi-marathonien / marathonien
   - `tour_de_france` (« tour de france ») — niveaux : vainqueur d'étape / maillot jaune / vainqueur du tour
   - `superv` (« superV ») — un seul niveau, `level_label: null`

2. `GET /api/mock/editions/user/[username]/trophies` — trophées gagnés par un
   utilisateur :
   ```json
   [
     { "trophy": "validateur", "trophy_label": "validateur", "level": 2, "level_label": "maçon", "unlocked_at": "2026-06-20T10:00:00Z" },
     ...
   ]
   ```
   Le mock déduit l'attribution depuis un jeu de données fixe (un username de
   démo possède quelques trophées ; les autres n'en ont aucun).

Les fixtures vivent dans un fichier `data.ts` dédié à côté des route handlers,
sur le modèle de `app/api/mock/editions/ranking/data.ts`.

### Hooks

Dans `utils/summerGames.tsx`, deux hooks sur le modèle existant
(`buildRankingUrl`, `fetch`, `loading`) :

- `useTrophies()` → `{ trophies, loading }`
- `useUserTrophies(username)` → `{ userTrophies, loading }` (ne fetch pas si
  username absent / non authentifié)

### Composant `BadgesList.tsx`

Affiché dans le `homeBlock`, sous la barre de progression.

- **Une carte par trophée** (4 cartes ; les niveaux ne sont PAS détaillés dans
  le corps de la carte).
- Contenu d'une carte :
  - **Image** : placeholder = pastille emoji par trophée dans un cercle coloré
    (validateur 🏗️, course de fond 🏃, tour de france 🚴, superV 🏆). À
    remplacer par les vraies images plus tard.
  - **Nom** : `trophy_label`.
  - **Nombre de gagnants** : `count` (ex. « 128 personnes l'ont gagné » ;
    accord/0 géré proprement).
  - **Descriptif** : `description`.
- **Indicateur « gagné par l'utilisateur connecté »** :
  - Source : `useRNBAuthentication()` → `user.username` + `isAuthenticated`,
    puis `useUserTrophies(username)`.
  - Si l'utilisateur a gagné ce trophée : afficher une coche **+ le label du
    niveau atteint** (le plus haut `level` possédé pour ce trophée → son
    `level_label`, ex. « maçon »). Pour `superv` (pas de `level_label`),
    afficher une coche seule.
  - Si non authentifié ou trophée non gagné : pas d'indicateur.

## 3. Classements (ajustements)

Réutiliser les trois `RankTable` déjà en place.

- **Nom court d'organisation au survol** :
  - `utils/summerGames.tsx` : arrêter de pré-concaténer
    `${name} (${shortName})` pour les organisations ; renvoyer `name` et
    `shortName` séparément dans chaque entrée du classement organisation.
  - `rankTable.tsx` : si `shortName` présent, afficher `shortName` enveloppé
    dans un `<Tooltip kind="hover" title={name}>` (DSFR, déjà importé) ; sinon
    afficher `name`. Départements et participants inchangés.
- **Opacité du bloc de classement** : dans `.rankShell`
  (`styles/summerGames.module.scss`), augmenter l'opacité du fond pour que la
  couleur perçue soit **#536bdf** et que les coches du fond interactif ne soient
  que très légèrement visibles : `background: rgba(83, 107, 223, 0.92)`
  (au-dessus du fond du shell #4059db).

## Hors périmètre

- Branchement à la vraie API (reste piloté par
  `NEXT_PUBLIC_SUMMER_GAME_API_BASE`).
- Vraies images des badges (placeholders emoji pour l'instant).
- Appel post-validation pour rafraîchir les trophées gagnés (le front pourra
  l'ajouter plus tard, cf. note de la PR #947).
- Affichage détaillé des niveaux dans le corps des cartes badges.
