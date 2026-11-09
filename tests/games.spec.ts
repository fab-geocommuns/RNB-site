import { test, expect } from '@/tests/fixtures';
import {
  feves,
  ranking,
  trophies,
  userTrophies,
} from '@/tests/fixtures/data/games';
import { DEFAULT_USERNAME } from '@/tests/fixtures/utils/auth-mock';

const RANKING_PATH = '/validation/ranking/?from=site&max_rank=100';
const TROPHIES_PATH = '/trophies/?from=site';

test.describe('Classement', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
    httpMocker.get(TROPHIES_PATH, trophies);
  });

  test('affiche le score global, les classements et les trophées', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.get(RANKING_PATH, ranking);

    await page.goto('/classement');

    await expect(
      page.getByText('345 validations réalisées par la communauté'),
    ).toBeVisible();
    await expect(page.getByText('Paris (75)')).toBeVisible();
    await expect(page.getByText('IGN', { exact: true })).toBeVisible();
    await expect(page.getByText('alice', { exact: true })).toBeVisible();
    await expect(page.getByText('Validateur', { exact: true })).toBeVisible();
    await expect(page.getByText('Gagné par 3 personnes')).toBeVisible();
    await expect(page.getByText('Pas encore gagné')).toBeVisible();
  });

  test('affiche une erreur si le classement ne répond pas', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.get(RANKING_PATH, {}, { status: 500, body: {} });

    await page.goto('/classement');

    await expect(
      page.getByText('Le classement est momentanément indisponible'),
    ).toBeVisible();
  });
});

test.describe('Mes trophées', () => {
  test.beforeEach(async ({ httpMocker, auth }) => {
    await httpMocker.install();
    await auth.signIn();
    httpMocker.get(TROPHIES_PATH, trophies);
    httpMocker.get(
      `/user/${DEFAULT_USERNAME}/trophies/?from=site`,
      userTrophies,
    );
    httpMocker.get('/feves/?from=site', feves);
  });

  test("liste les trophées et fèves gagnés, puis ceux qu'il reste à gagner", async ({
    page,
  }) => {
    await page.goto('/mon-compte/mes-trophees');

    const won = page
      .getByRole('list')
      .filter({ has: page.getByText('Fève Paris', { exact: true }) });
    await expect(won.getByText('Validateur', { exact: true })).toBeVisible();
    await expect(won.getByText('Signaleur', { exact: true })).toHaveCount(0);
    // Seules les fèves trouvées par l'utilisateur connecté
    await expect(page.getByText('Fève Rhône')).toHaveCount(0);
    await expect(page.getByText('Fève Gironde')).toHaveCount(0);

    const toWin = page
      .getByRole('list')
      .filter({ has: page.getByText('Signaleur', { exact: true }) });
    await expect(toWin.getByText('Validateur', { exact: true })).toHaveCount(0);
  });
});
