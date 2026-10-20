import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { DEFAULT_USERNAME } from '@/tests/fixtures/utils/auth-mock';
import history from '@/tests/fixtures/data/history.json';

// L'historique est chargé au rendu serveur : il est servi par
// tests/mock-server à partir de tests/fixtures/data/history.json.
const RNB_ID = history[0].rnb_id;
const EVENT_ID = history[0].event.id;
const ANNOTATIONS_PATH = `/editions/${EVENT_ID}/annotations/?from=site`;
const ROLLBACK_PATH = `/editions/${EVENT_ID}/rollback/?from=site`;
const COMMENT = 'Le statut a été changé par erreur';

const savedAnnotation = {
  id: 1,
  event_id: EVENT_ID,
  status: 'incorrect',
  comment: COMMENT,
  reviewer: {
    id: 7,
    username: DEFAULT_USERNAME,
    display_name: DEFAULT_USERNAME,
    organization_name: null,
  },
  created_at: '2026-10-16T10:00:00Z',
  updated_at: '2026-10-16T10:00:00Z',
};

const annotateAsIncorrect = async (page: Page) => {
  await page.getByText('Fausse', { exact: true }).click();
  await page.getByLabel('Commentaire').fill(COMMENT);
};

const rollback = async (page: Page) => {
  await page.getByRole('button', { name: 'Rollback de cette édition' }).click();
  await page.getByRole('button', { name: 'Confirmer le rollback' }).click();
};

test.describe("Relecture d'une édition depuis l'historique", () => {
  test.beforeEach(async ({ browserName, httpMocker, auth }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );
    await httpMocker.install();
    await auth.signIn({ groups: ['Contributors', 'Reviewers'] });
  });

  test('enregistre une annotation', async ({ page, httpMocker }) => {
    httpMocker.on(
      'PUT',
      ANNOTATIONS_PATH,
      { body: savedAnnotation },
      { expectBody: { status: 'incorrect', comment: COMMENT } },
    );

    await page.goto(`/batiments/${RNB_ID}/historique`);
    await expect(
      page.getByText("Cette édition n'a pas encore été annotée."),
    ).toBeVisible();

    await annotateAsIncorrect(page);
    await page.getByRole('button', { name: 'Annoter' }).click();

    await expect(
      page.getByText('Votre annotation a bien été enregistrée.'),
    ).toBeVisible();
    await expect(page.getByText(`${DEFAULT_USERNAME} — vous`)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Mettre à jour' }),
    ).toBeVisible();
  });

  test("enregistre l'annotation puis fait le rollback", async ({
    page,
    httpMocker,
  }) => {
    httpMocker.on(
      'PUT',
      ANNOTATIONS_PATH,
      { body: savedAnnotation },
      { expectBody: { status: 'incorrect', comment: COMMENT } },
    );
    httpMocker.post(
      ROLLBACK_PATH,
      { status: 200, body: {} },
      {
        comment: COMMENT,
      },
    );

    await page.goto(`/batiments/${RNB_ID}/historique`);
    await annotateAsIncorrect(page);

    const rollbackRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/rollback/'),
    );
    await rollback(page);
    await rollbackRequest;

    await expect(
      page.getByText(/L'annotation a été enregistrée et le rollback effectué/),
    ).toBeVisible();
  });

  test('affiche le message du back quand le rollback est refusé', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.on('PUT', ANNOTATIONS_PATH, { body: savedAnnotation });
    httpMocker.post(ROLLBACK_PATH, {
      status: 403,
      body: {
        detail: "Vous n'avez pas la permission d'effectuer cette action.",
      },
    });

    await page.goto(`/batiments/${RNB_ID}/historique`);
    await annotateAsIncorrect(page);
    await rollback(page);

    await expect(
      page.getByText("Vous n'avez pas la permission d'effectuer cette action."),
    ).toBeVisible();
    // L'annotation, elle, a bien été enregistrée.
    await expect(page.getByText(`${DEFAULT_USERNAME} — vous`)).toBeVisible();
  });
});
