# Validations & Récompenses — homeBlock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a progress bar and an earnable-badges section to the summer-game `homeBlock`, and refine the three ranking blocks (org short-name on hover + more opaque background).

**Architecture:** Pure data-shaping logic (rank formatting, the connected user's trophy status) is extracted into testable functions in `utils/summerGames.tsx` and covered by vitest. UI is rendered by React components reusing the existing `summerGames.module.scss`. Trophy data comes from two new mock route handlers under `/api/mock/editions`, mirroring backend PR fab-geocommuns/RNB-coeur#947; the real API is wired later via `NEXT_PUBLIC_SUMMER_GAME_API_BASE` without changing response shapes.

**Tech Stack:** Next.js (App Router, route handlers), React (client components), TypeScript, SCSS modules, `@codegouvfr/react-dsfr` (`Tooltip`), vitest.

## Global Constraints

- Mock endpoints live under `/api/mock/editions/...` and return the EXACT JSON shape of the real API (PR #947). No shape divergence.
- Switching to the real API is done only via `NEXT_PUBLIC_SUMMER_GAME_API_BASE` — never hardcode hosts.
- Trophy labels/descriptions are copied verbatim from the backend `Trophy` model (see Task 4 fixtures). 4 trophies: `validateur`, `course_de_fond`, `tour_de_france`, `superv`.
- Vitest unit tests are `*.test.ts` (NOT `.tsx`); `tests/**` is excluded from vitest. There is no jsdom env — do NOT write React-render tests. Test pure functions only.
- Run a single vitest file with: `pnpm exec vitest run <path>`.
- Lint with: `pnpm lint`. Typecheck with: `pnpm exec tsc --noEmit`.
- French UI copy. Match existing code style (existing files use Prettier via husky pre-commit).

---

### Task 1: Extract `formatRanks` pure helper (keep org name + shortName separate)

Refactor the inline transform in `useSummerGamesData` into an exported pure function, and stop pre-concatenating `name (shortName)` for organizations.

**Files:**

- Modify: `utils/summerGames.tsx` (the transform inside `useSummerGamesData`, lines ~79-122)
- Test: `utils/summerGames.test.ts` (create)

**Interfaces:**

- Produces:

  ```ts
  export type Rank = { name: string; count: number; shortName?: string | null };
  export type FormattedRanks = {
    individual: Rank[];
    organization: Rank[];
    department: Rank[];
    shared: { goal: number; absolute: number; percent: number };
  };
  export function formatRanks(ranks: any): FormattedRanks;
  ```

  Raw `ranks` shape (from API/mock): `{ goal, global, individual: [name,count][], organization: [name,shortName,count][], departement: [code,name,count][] }`.

- [ ] **Step 1: Write the failing test**

Create `utils/summerGames.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatRanks } from './summerGames';

describe('formatRanks', () => {
  const raw = {
    goal: 50000,
    global: 12345,
    individual: [['jdupont', 1320]],
    organization: [
      [
        'Institut national de l’information géographique et forestière',
        'IGN',
        3120,
      ],
      ['Etalab', null, 980],
    ],
    departement: [['35', 'Ille-et-Vilaine', 2980]],
  };

  it('keeps organization name and shortName separate', () => {
    const { organization } = formatRanks(raw);
    expect(organization[0]).toEqual({
      name: 'Institut national de l’information géographique et forestière',
      shortName: 'IGN',
      count: 3120,
    });
  });

  it('sets shortName to null when absent', () => {
    const { organization } = formatRanks(raw);
    expect(organization[1]).toEqual({
      name: 'Etalab',
      shortName: null,
      count: 980,
    });
  });

  it('formats department as "name (code)"', () => {
    expect(formatRanks(raw).department[0]).toEqual({
      name: 'Ille-et-Vilaine (35)',
      count: 2980,
    });
  });

  it('maps individual to name/count', () => {
    expect(formatRanks(raw).individual[0]).toEqual({
      name: 'jdupont',
      count: 1320,
    });
  });

  it('computes shared goal/absolute/percent', () => {
    expect(formatRanks(raw).shared).toEqual({
      goal: 50000,
      absolute: 12345,
      percent: 25,
    });
  });

  it('guards percent against a zero goal', () => {
    expect(formatRanks({ ...raw, goal: 0 }).shared.percent).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run utils/summerGames.test.ts`
Expected: FAIL — `formatRanks` is not exported / not a function.

- [ ] **Step 3: Add the `formatRanks` function and types**

In `utils/summerGames.tsx`, add near the top (after the `buildRankingUrl` definition):

```ts
export type Rank = { name: string; count: number; shortName?: string | null };
export type FormattedRanks = {
  individual: Rank[];
  organization: Rank[];
  department: Rank[];
  shared: { goal: number; absolute: number; percent: number };
};

// Met en forme la réponse brute du classement (cf. mock
// `app/api/mock/editions/ranking/data.ts`) en gardant, pour les organisations,
// le nom long et le nom court séparés (affichage du nom court + survol).
export function formatRanks(ranks: any): FormattedRanks {
  return {
    individual: ranks.individual.map((r: any[]) => ({
      name: r[0],
      count: r[1],
    })),
    organization: ranks.organization.map((r: any[]) => {
      const [name, shortName, count] = r;
      return { name, shortName: shortName || null, count };
    }),
    department: ranks.departement.map((r: any[]) => ({
      name: `${r[1]} (${r[0]})`,
      count: r[2],
    })),
    shared: {
      goal: ranks.goal,
      absolute: ranks.global,
      percent: ranks.goal ? Math.round((ranks.global / ranks.goal) * 100) : 0,
    },
  };
}
```

- [ ] **Step 4: Use it inside `useSummerGamesData`**

In `useSummerGamesData`, replace the whole inline transform (the `let formatted = {...}` block through the `formatted.shared.percent = ...` line) with:

```ts
const ranks = await response.json();
setSummerGamesData(formatRanks(ranks));
```

Leave the surrounding `try/catch/finally`, `setLoading`, and the returned `{ summerGamesData, loading }` untouched.

- [ ] **Step 5: Run tests + typecheck**

Run: `pnpm exec vitest run utils/summerGames.test.ts`
Expected: PASS (6 tests).
Run: `pnpm exec tsc --noEmit`
Expected: no new errors in `utils/summerGames.tsx`.

- [ ] **Step 6: Commit**

```bash
git add utils/summerGames.tsx utils/summerGames.test.ts
git commit -m "refactor: extract formatRanks, keep org short name separate"
```

---

### Task 2: Org short-name on hover + more opaque ranking block

Display the org short name in `RankTable`, full name on hover (DSFR `Tooltip`), and make the ranking block background more opaque (perceived #536bdf).

**Files:**

- Modify: `components/games/summerGames/rankTable.tsx`
- Modify: `styles/summerGames.module.scss` (`.rankShell`, line ~243)

**Interfaces:**

- Consumes: `Rank` from Task 1 (`{ name, count, shortName?: string | null }`).

- [ ] **Step 1: Render shortName with a hover tooltip in `rankTable.tsx`**

`RankTable` already imports `Tooltip` from `@codegouvfr/react-dsfr/Tooltip`. Replace the `rankNameShell` div:

```tsx
<div className={styles.rankNameShell}>{rank.name}</div>
```

with:

```tsx
<div className={styles.rankNameShell}>
  {rank.shortName ? (
    <Tooltip kind="hover" title={rank.name}>
      {rank.shortName}
    </Tooltip>
  ) : (
    rank.name
  )}
</div>
```

(Department and individual ranks have no `shortName`, so they keep rendering `rank.name`.)

- [ ] **Step 2: Increase the ranking block opacity**

In `styles/summerGames.module.scss`, in `.rankShell`, change:

```scss
background: rgba(255, 255, 255, 0.1);
```

to:

```scss
// Fond plus opaque : couleur perçue #536bdf au-dessus du shell (#4059db),
// les coches du fond interactif ne restent que très légèrement visibles.
background: rgba(83, 107, 223, 0.92);
```

- [ ] **Step 3: Lint + typecheck**

Run: `pnpm lint`
Expected: no new errors.
Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, open the home page. Verify: organizations show their short name (e.g. "IGN"), hovering reveals the full name; the ranking blocks are noticeably more opaque (solid blue ~#536bdf) with checkmarks only faintly visible underneath.

- [ ] **Step 5: Commit**

```bash
git add components/games/summerGames/rankTable.tsx styles/summerGames.module.scss
git commit -m "feat: org short name on hover + more opaque ranking blocks"
```

---

### Task 3: Render the progress bar + retune the fill gradient

**Files:**

- Modify: `components/games/summerGames/homeBlock.tsx` (the `.barShell` block, lines ~64-76)
- Modify: `styles/summerGames.module.scss` (`.progress`, lines ~166-179)

**Interfaces:**

- Consumes: `summerGamesData.shared` from Task 1 (`{ goal, absolute, percent }`).

- [ ] **Step 1: Add the bar markup in `homeBlock.tsx`**

Inside `.barShell`, after the existing `.legend` block (right before `</div>` closing `.barShell`), add the bar. The `.barShell` block becomes:

```tsx
<div className={styles.barShell}>
  <div className={styles.legend}>
    <span className={styles.legend_subtitle}>Validations faites</span>
    <br />
    <p>
      {summerGamesData.shared.absolute} validations faites par la communauté
    </p>
  </div>

  <div className={styles.bar}>
    <div
      className={styles.progress}
      style={{
        width: `${Math.min(summerGamesData.shared.percent, 100)}%`,
      }}
    >
      <span className={styles.progressTotal}>
        {summerGamesData.shared.percent}%
      </span>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Retune the fill gradient**

In `styles/summerGames.module.scss`, replace the `.progress` `background` rule:

```scss
background: linear-gradient(
  251deg,
  $accent-color 0%,
  $accent-color 20%,
  $accent-color-light 100%
);
```

with a subtle water-green → lighter-green gradient (based on the subtitle color `$accent-color` #42f19d):

```scss
background: linear-gradient(
  251deg,
  $accent-color 0%,
  $accent-color 40%,
  lighten($accent-color, 18%) 100%
);
```

- [ ] **Step 3: Lint + typecheck**

Run: `pnpm lint` then `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, open the home page. With the mock (`global` 12345 / `goal` 50000), the bar fills to ~25%, shows "25%" at the right edge, and the fill is a soft green→lighter-green gradient.

- [ ] **Step 5: Commit**

```bash
git add components/games/summerGames/homeBlock.tsx styles/summerGames.module.scss
git commit -m "feat: render summer-game progress bar with water-green gradient"
```

---

### Task 4: Trophy mock endpoints + fixtures

Two route handlers mirroring PR #947, plus a shared fixtures module and a data-shape test.

**Files:**

- Create: `app/api/mock/editions/trophies/data.ts`
- Create: `app/api/mock/editions/trophies/route.ts`
- Create: `app/api/mock/editions/user/[username]/trophies/route.ts`
- Test: `app/api/mock/editions/trophies/data.test.ts`

**Interfaces:**

- Produces (fixtures module `trophies/data.ts`):
  ```ts
  export type TrophyLevel = {
    level: number;
    level_label: string | null;
    count: number;
  };
  export type Trophy = {
    trophy: string;
    trophy_label: string;
    description: string;
    count: number;
    levels: TrophyLevel[];
  };
  export type UserTrophy = {
    trophy: string;
    trophy_label: string;
    level: number;
    level_label: string | null;
    unlocked_at: string;
  };
  export const TROPHIES: Trophy[];
  export function getUserTrophies(username: string): UserTrophy[];
  export const DEMO_TROPHY_USERNAME: string; // 'jdupont' — possesses some trophies
  ```
- `GET /api/mock/editions/trophies` → `TROPHIES`
- `GET /api/mock/editions/user/<username>/trophies` → `getUserTrophies(username)`

- [ ] **Step 1: Write the fixtures module**

Create `app/api/mock/editions/trophies/data.ts`. Labels/descriptions/level labels are copied verbatim from the backend `Trophy` model (PR #947):

```ts
/**
 * Données mockées des trophées du jeu de l'été 2026.
 *
 * Forme identique aux endpoints réels (PR fab-geocommuns/RNB-coeur#947) :
 *  - `GET /editions/trophies`            -> liste des trophées + nombre de gagnants
 *  - `GET /editions/user/<username>/trophies` -> trophées gagnés par un utilisateur
 *
 * Libellés et descriptions repris à l'identique du modèle `Trophy` backend.
 * Pour basculer sur la vraie API : retirer `NEXT_PUBLIC_SUMMER_GAME_API_BASE`
 * (cf. `utils/summerGames.tsx`).
 */

export type TrophyLevel = {
  level: number;
  level_label: string | null;
  count: number;
};

export type Trophy = {
  trophy: string;
  trophy_label: string;
  description: string;
  count: number;
  levels: TrophyLevel[];
};

export type UserTrophy = {
  trophy: string;
  trophy_label: string;
  level: number;
  level_label: string | null;
  unlocked_at: string;
};

export const TROPHIES: Trophy[] = [
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    description:
      'Gagnez ce trophée en validant des bâtiments dans le RNB. Plus vous validez, plus votre niveau augmente.',
    count: 128,
    levels: [
      { level: 1, level_label: 'apprenti', count: 128 },
      { level: 2, level_label: 'maçon', count: 34 },
      { level: 3, level_label: 'entreprise du bâtiment', count: 5 },
    ],
  },
  {
    trophy: 'course_de_fond',
    trophy_label: 'course de fond',
    description:
      'Gagnez ce trophée en validant des bâtiments pendant plusieurs jours consécutifs.',
    count: 41,
    levels: [
      { level: 1, level_label: 'coureur du dimanche', count: 41 },
      { level: 2, level_label: 'semi-marathonien', count: 12 },
      { level: 3, level_label: 'marathonien', count: 3 },
    ],
  },
  {
    trophy: 'tour_de_france',
    trophy_label: 'tour de france',
    description:
      'Gagnez ce trophée en validant des bâtiments dans les villes-étapes du Tour de France 2026.',
    count: 17,
    levels: [
      { level: 1, level_label: "vainqueur d'étape", count: 17 },
      { level: 2, level_label: 'maillot jaune', count: 4 },
      { level: 3, level_label: 'vainqueur du tour', count: 1 },
    ],
  },
  {
    trophy: 'superv',
    trophy_label: 'superV',
    description:
      'Gagnez ce trophée en étant la personne qui a fait le plus de validation dans le RNB.',
    count: 1,
    levels: [{ level: 1, level_label: null, count: 1 }],
  },
];

// Utilisateur de démo qui possède quelques trophées ; tout autre username n'en a
// aucun. Aligné avec le 1er du classement individuel mocké (cf. ranking/data.ts).
export const DEMO_TROPHY_USERNAME = 'jdupont';

const DEMO_USER_TROPHIES: UserTrophy[] = [
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 2,
    level_label: 'maçon',
    unlocked_at: '2026-06-20T10:00:00Z',
  },
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 1,
    level_label: 'apprenti',
    unlocked_at: '2026-06-10T10:00:00Z',
  },
  {
    trophy: 'superv',
    trophy_label: 'superV',
    level: 1,
    level_label: null,
    unlocked_at: '2026-06-25T09:00:00Z',
  },
];

/**
 * Trophées gagnés par un utilisateur. Seul `DEMO_TROPHY_USERNAME` en possède ;
 * pour tout autre username on renvoie une liste vide.
 */
export function getUserTrophies(username: string): UserTrophy[] {
  return username === DEMO_TROPHY_USERNAME ? DEMO_USER_TROPHIES : [];
}
```

- [ ] **Step 2: Write the data-shape test**

Create `app/api/mock/editions/trophies/data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { TROPHIES, getUserTrophies, DEMO_TROPHY_USERNAME } from './data';

describe('trophies fixtures', () => {
  it('exposes the 4 backend trophies in order', () => {
    expect(TROPHIES.map((t) => t.trophy)).toEqual([
      'validateur',
      'course_de_fond',
      'tour_de_france',
      'superv',
    ]);
  });

  it('gives every trophy the required fields', () => {
    for (const t of TROPHIES) {
      expect(typeof t.trophy_label).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(typeof t.count).toBe('number');
      expect(t.levels.length).toBeGreaterThan(0);
    }
  });

  it('models superv as a single unnamed level', () => {
    const superv = TROPHIES.find((t) => t.trophy === 'superv')!;
    expect(superv.levels).toEqual([{ level: 1, level_label: null, count: 1 }]);
  });

  it('returns demo user trophies, empty for anyone else', () => {
    expect(getUserTrophies(DEMO_TROPHY_USERNAME).length).toBeGreaterThan(0);
    expect(getUserTrophies('nobody')).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `pnpm exec vitest run app/api/mock/editions/trophies/data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 4: Write the trophies list route handler**

Create `app/api/mock/editions/trophies/route.ts` (mirror the style of `ranking/route.ts`):

```ts
import { TROPHIES } from './data';

// Mock de `GET /editions/trophies` : liste des trophées et nombre de gagnants.
// Voir `app/api/mock/editions/trophies/data.ts`.
export async function GET() {
  return Response.json(TROPHIES);
}
```

- [ ] **Step 5: Write the user-trophies route handler**

Create `app/api/mock/editions/user/[username]/trophies/route.ts`:

```ts
import { getUserTrophies } from '../../../trophies/data';

// Mock de `GET /editions/user/<username>/trophies` : trophées gagnés par
// l'utilisateur. Voir `app/api/mock/editions/trophies/data.ts`.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  return Response.json(getUserTrophies(decodeURIComponent(username)));
}
```

- [ ] **Step 6: Verify the endpoints manually**

Run `pnpm dev`, then in another terminal:

```bash
curl -s http://localhost:3000/api/mock/editions/trophies | head -c 200
curl -s http://localhost:3000/api/mock/editions/user/jdupont/trophies
curl -s http://localhost:3000/api/mock/editions/user/nobody/trophies
```

Expected: first returns the 4-trophy array; `jdupont` returns 3 entries; `nobody` returns `[]`.

- [ ] **Step 7: Typecheck + commit**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

```bash
git add app/api/mock/editions/trophies app/api/mock/editions/user
git commit -m "feat: mock trophies endpoints (list + per-user)"
```

---

### Task 5: Trophy hooks + `userTrophyStatus` helper

Add fetch hooks and a pure helper that derives the connected user's status for a trophy.

**Files:**

- Modify: `utils/summerGames.tsx` (add hooks + helper + imported types)
- Test: `utils/summerGames.test.ts` (extend)

**Interfaces:**

- Consumes: `Trophy`, `UserTrophy` types from `app/api/mock/editions/trophies/data` (import the types only).
- Produces:

  ```ts
  export function useTrophies(): {
    trophies: Trophy[] | undefined;
    loading: boolean;
  };
  export function useUserTrophies(username?: string | null): {
    userTrophies: UserTrophy[] | undefined;
    loading: boolean;
  };
  export type TrophyStatus = { earned: boolean; levelLabel: string | null };
  export function userTrophyStatus(
    userTrophies: UserTrophy[] | undefined,
    trophyKey: string,
  ): TrophyStatus;
  ```

- [ ] **Step 1: Write the failing test for `userTrophyStatus`**

Append to `utils/summerGames.test.ts`:

```ts
import { userTrophyStatus } from './summerGames';

describe('userTrophyStatus', () => {
  const owned = [
    {
      trophy: 'validateur',
      trophy_label: 'validateur',
      level: 1,
      level_label: 'apprenti',
      unlocked_at: 'x',
    },
    {
      trophy: 'validateur',
      trophy_label: 'validateur',
      level: 2,
      level_label: 'maçon',
      unlocked_at: 'x',
    },
    {
      trophy: 'superv',
      trophy_label: 'superV',
      level: 1,
      level_label: null,
      unlocked_at: 'x',
    },
  ];

  it('returns the highest-level label for an earned trophy', () => {
    expect(userTrophyStatus(owned, 'validateur')).toEqual({
      earned: true,
      levelLabel: 'maçon',
    });
  });

  it('marks an earned trophy with no level label (superv) as earned, null label', () => {
    expect(userTrophyStatus(owned, 'superv')).toEqual({
      earned: true,
      levelLabel: null,
    });
  });

  it('reports not earned for a trophy the user lacks', () => {
    expect(userTrophyStatus(owned, 'tour_de_france')).toEqual({
      earned: false,
      levelLabel: null,
    });
  });

  it('handles undefined input', () => {
    expect(userTrophyStatus(undefined, 'validateur')).toEqual({
      earned: false,
      levelLabel: null,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run utils/summerGames.test.ts`
Expected: FAIL — `userTrophyStatus` not exported.

- [ ] **Step 3: Add the helper + hooks**

In `utils/summerGames.tsx`, add the import at the top:

```ts
import type { Trophy, UserTrophy } from '@/app/api/mock/editions/trophies/data';
```

Then add the helper and hooks (after `formatRanks`):

```ts
export type TrophyStatus = { earned: boolean; levelLabel: string | null };

// Statut du trophée pour l'utilisateur connecté : gagné ou non, et le label du
// plus haut niveau atteint (null pour superv qui n'a pas de label de niveau).
export function userTrophyStatus(
  userTrophies: UserTrophy[] | undefined,
  trophyKey: string,
): TrophyStatus {
  const owned = (userTrophies ?? []).filter((t) => t.trophy === trophyKey);
  if (owned.length === 0) return { earned: false, levelLabel: null };
  const top = owned.reduce((a, b) => (b.level > a.level ? b : a));
  return { earned: true, levelLabel: top.level_label ?? null };
}

export const useTrophies = () => {
  const [loading, setLoading] = useState(true);
  const [trophies, setTrophies] = useState<Trophy[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildRankingUrl('/editions/trophies');
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        setTrophies(await response.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { trophies, loading };
};

export const useUserTrophies = (username?: string | null) => {
  const [loading, setLoading] = useState(true);
  const [userTrophies, setUserTrophies] = useState<UserTrophy[]>();

  useEffect(() => {
    if (!username) {
      setUserTrophies([]);
      setLoading(false);
      return;
    }
    const getData = async () => {
      setLoading(true);
      try {
        const url = buildRankingUrl(
          `/editions/user/${encodeURIComponent(username)}/trophies`,
        );
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        setUserTrophies(await response.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [username]);

  return { userTrophies, loading };
};
```

Note: `buildRankingUrl` already appends the trailing slash for the real (absolute-base) API and omits it for the relative mock base, so these trophy paths work in both modes exactly like the ranking path.

- [ ] **Step 4: Run tests + typecheck**

Run: `pnpm exec vitest run utils/summerGames.test.ts`
Expected: PASS (all `formatRanks` + `userTrophyStatus` tests).
Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add utils/summerGames.tsx utils/summerGames.test.ts
git commit -m "feat: trophy fetch hooks + userTrophyStatus helper"
```

---

### Task 6: `BadgesList` component + styles + wire into `homeBlock`

Render one card per trophy under the progress bar, with an emoji placeholder, name, winner count, description, and an earned indicator (coche + level label) for the connected user.

**Files:**

- Create: `components/games/summerGames/badgesList.tsx`
- Modify: `styles/summerGames.module.scss` (append badge styles)
- Modify: `components/games/summerGames/homeBlock.tsx` (render `<BadgesList />`)

**Interfaces:**

- Consumes: `useTrophies`, `useUserTrophies`, `userTrophyStatus` (Task 5); `useRNBAuthentication` (`utils/useRNBAuthentication`) → `{ user: { username } | null, isAuthenticated }`.

- [ ] **Step 1: Create the component**

Create `components/games/summerGames/badgesList.tsx`:

```tsx
'use client';

import styles from '@/styles/summerGames.module.scss';
import {
  useTrophies,
  useUserTrophies,
  userTrophyStatus,
} from '@/utils/summerGames';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';

// Placeholder en attendant les vraies images : une pastille emoji par trophée.
const TROPHY_EMOJI: Record<string, string> = {
  validateur: '🏗️',
  course_de_fond: '🏃',
  tour_de_france: '🚴',
  superv: '🏆',
};

const winnersLabel = (count: number) =>
  count <= 0
    ? 'Personne ne l’a encore gagné'
    : count === 1
      ? '1 personne l’a gagné'
      : `${count.toLocaleString('fr-FR')} personnes l’ont gagné`;

export default function BadgesList() {
  const { trophies, loading } = useTrophies();
  const { user, isAuthenticated } = useRNBAuthentication();
  const username = isAuthenticated ? user?.username : null;
  const { userTrophies } = useUserTrophies(username);

  if (loading || !trophies) return null;

  return (
    <div className={styles.badges}>
      <div className={styles.legend}>Badges à débloquer</div>
      <div className={styles.badgesGrid}>
        {trophies.map((trophy) => {
          const status = userTrophyStatus(userTrophies, trophy.trophy);
          return (
            <div key={trophy.trophy} className={styles.badge}>
              <div className={styles.badgeIcon} aria-hidden="true">
                {TROPHY_EMOJI[trophy.trophy] ?? '🏅'}
              </div>
              <div className={styles.badgeName}>{trophy.trophy_label}</div>
              <div className={styles.badgeCount}>
                {winnersLabel(trophy.count)}
              </div>
              <div className={styles.badgeDesc}>{trophy.description}</div>
              {status.earned && (
                <div className={styles.badgeEarned}>
                  <span className={styles.badgeCheck} aria-hidden="true">
                    ✓
                  </span>
                  {status.levelLabel ? `Gagné · ${status.levelLabel}` : 'Gagné'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Append badge styles**

Append to `styles/summerGames.module.scss` (reuses the block palette; `$accent-color` for the earned indicator):

```scss
.badges {
  width: 98%;
  margin: 0 auto 3.5rem auto;
  color: white;

  .legend {
    text-align: center;
    margin-bottom: 1.2rem;
  }
}

.badgesGrid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.badge {
  position: relative;
  flex: 1 1 200px;
  max-width: 260px;
  padding: 20px 18px;
  background: rgba(83, 107, 223, 0.92);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badgeIcon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 12px;
}

.badgeName {
  font-weight: 700;
  font-size: 1.05em;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.badgeCount {
  font-size: 0.8em;
  opacity: 0.85;
  margin-bottom: 10px;
}

.badgeDesc {
  font-size: 0.85em;
  line-height: 1.3em;
}

.badgeEarned {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 1000px;
  font-size: 0.8em;
  font-weight: 700;
  color: darken($accent-color, 80%);
  background: $accent-color;
}

.badgeCheck {
  font-weight: 900;
}
```

- [ ] **Step 3: Wire `BadgesList` into `homeBlock.tsx`**

Add the import at the top of `components/games/summerGames/homeBlock.tsx`:

```tsx
import BadgesList from './badgesList';
```

Then render it inside `.progressShell`, right after the `.barShell` closing `</div>` and before the `{withRankingTable && (` block:

```tsx
                </div>

                <BadgesList />

                {withRankingTable && (
```

- [ ] **Step 4: Lint + typecheck**

Run: `pnpm lint`
Expected: no new errors.
Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Manual check**

Run `pnpm dev`, open the home page (and `/classement`). Verify: 4 badge cards under the progress bar, each with emoji pastille, name, "N personnes l'ont gagné", and description. Logged out → no earned indicators. To see the earned state, log in as the demo user `jdupont` (or temporarily point the username): `validateur` shows "Gagné · maçon", `superV` shows "Gagné", the other two show nothing.

- [ ] **Step 6: Commit**

```bash
git add components/games/summerGames/badgesList.tsx components/games/summerGames/homeBlock.tsx styles/summerGames.module.scss
git commit -m "feat: badges section under the progress bar"
```

---

## Self-Review

**Spec coverage:**

- §1 progress bar markup → Task 3 Step 1; data via Task 1; gradient retune → Task 3 Step 2. ✓
- §2 mock endpoints (list + per-user) → Task 4; hooks → Task 5; `BadgesList` (card per trophy, emoji placeholder, name/count/description) → Task 6; earned indicator (coche + level label, superv plain) → `userTrophyStatus` Task 5 + Task 6 Step 1; connected user via `useRNBAuthentication` → Task 6. ✓
- §3 org short name on hover → Task 1 (formatRanks split) + Task 2 (Tooltip); `.rankShell` opacity #536bdf → Task 2. ✓
- Out-of-scope items (real API, real images, post-validation refresh, per-level card detail) correctly omitted. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step contains full code. ✓

**Type consistency:** `Rank`/`FormattedRanks` (Task 1) consumed in Task 2; `Trophy`/`UserTrophy` (Task 4) consumed by hooks (Task 5) and component (Task 6); `userTrophyStatus(userTrophies, trophyKey)` signature consistent across Tasks 5–6; `buildRankingUrl`/`useState`/`useEffect` already in `utils/summerGames.tsx`. ✓
