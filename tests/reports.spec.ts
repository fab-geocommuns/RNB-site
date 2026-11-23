/**
 * Signalements sur /carte. Contrairement aux autres tuiles `.pbf`, absorbées
 * vides par `HttpMocker`, les tuiles de signalements sont servies avec de
 * vraies features (cf. `encodePointTile`), tous les signalements étant
 * superposés sur `REPORTS_POINT`.
 */
import { Locator, Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import {
  banFeatureSegur,
  buildingSegur,
} from '@/tests/fixtures/data/buildings';
import {
  REPORTS_POINT,
  ReportFixture,
  addressReport,
  closedReport,
  missingBuildingReport,
  newReport,
  emptyReportStats,
  manyTagsReportStats,
  reportStatsWithTags,
  thousandsReportStats,
} from '@/tests/fixtures/data/reports';
import { encodePointTile } from '@/tests/fixtures/utils/vector-tile';

const REPORTS_MAP_URL = `/carte?extra_layers=reports&coords=${REPORTS_POINT.lat},${REPORTS_POINT.lng},17`;
const REPORTS_ON_MAP = 'map[id=mainMap] layer[id=reports_circle]';
const REPORT_PANEL = '[class*="reportShell"]';
const ADDRESS_SEARCH = '[class*="map__InputShell"]';

const reportFiltersHeading = (page: Page) =>
  page.getByRole('heading', { name: 'Suivi des signalements' });

// Registered after the `HttpMocker` stub of beforeEach, so it wins
const serveReportStats = ({
  page,
  stats,
}: {
  page: Page;
  stats: typeof reportStatsWithTags;
}) =>
  page.route(
    (url) => url.pathname.endsWith('/reports/stats/'),
    (route) => route.fulfill({ json: stats }),
  );

// Without a building, opening the report leaves the building and edition panels closed
const serveReportWithoutBuilding = async (page: Page) => {
  const report = { ...missingBuildingReport.api, rnb_id: null };
  await page.route(
    (url) => url.pathname.endsWith(`/reports/${report.id}/`),
    (route) => route.fulfill({ json: report }),
  );
  return report.id;
};

// True when no other element covers the centre of the located one
const isOnTop = (locator: Locator) =>
  locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return element.contains(
      document.elementFromPoint(x + width / 2, y + height / 2),
    );
  });

const layersButtonTop = async (page: Page) => {
  const box = await page
    .getByAltText('Voir les calques')
    .filter({ visible: true })
    .boundingBox();
  return box!.y;
};

// The shell's scroll height counts the content drawn below it, not the content its panels clip
const expectReportPanelContentInside = async (page: Page) => {
  const shell = page.locator(REPORT_PANEL);
  const mapBox = (await page
    .locator('[class*="map__mapShell"]')
    .boundingBox())!;
  const shellBox = (await shell.boundingBox())!;
  expect(shellBox.y + shellBox.height).toBeLessThanOrEqual(
    mapBox.y + mapBox.height,
  );
  expect(
    await shell.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    ),
  ).toBeLessThanOrEqual(0);
};

const openReportFiltersWithManyTags = async (page: Page) => {
  await serveReportStats({ page, stats: manyTagsReportStats });
  await page.goto(REPORTS_MAP_URL);
  await reportFiltersHeading(page).click();
  await expect(page.getByText('Étiquette 10')).toBeAttached();
};

const reportOnMap = (report: ReportFixture) =>
  `${REPORTS_ON_MAP} filter["==", ["get", "id"], ${report.api.id}]`;

// `reports` is read on each tile request: pushing to it changes the next tiles served
const serveReportTiles = async ({
  page,
  reports,
}: {
  page: Page;
  reports: ReportFixture[];
}) => {
  await page.route(/\/reports\/tiles\/\d+\/\d+\/\d+\.pbf/, (route) => {
    const [x, y, z] = new URL(route.request().url()).pathname
      .split('/')
      .slice(-3)
      .map((part) => parseInt(part, 10));
    return route.fulfill({
      contentType: 'application/x-protobuf',
      body: encodePointTile({
        points: reports.map((report) => report.tilePoint),
        x,
        y,
        z,
      }),
    });
  });
};

test.describe('Signalements', () => {
  test.beforeEach(async ({ browserName, httpMocker }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await httpMocker.install();
    httpMocker.get('/reports/stats/?from=site', emptyReportStats);
    httpMocker.get(
      `/buildings/${buildingSegur.rnb_id}/?from=site&withPlots=1`,
      buildingSegur,
    );
    for (const { api } of [
      addressReport,
      missingBuildingReport,
      closedReport,
      newReport,
    ]) {
      httpMocker.get(`/reports/${api.id}/?from=site`, api);
    }
  });

  test('le compteur reprend après une erreur et se met en pause onglet caché', async ({
    page,
  }) => {
    // Counts are relative: React StrictMode mounts the panel twice in dev
    let statsCalls = 0;
    let failing = true;
    await page.route(
      (url) => url.pathname.endsWith('/reports/stats/'),
      (route) => {
        statsCalls += 1;
        return failing
          ? route.fulfill({ status: 500 })
          : route.fulfill({ json: emptyReportStats });
      },
    );
    const setVisibility = (state: 'visible' | 'hidden') =>
      page.evaluate((state) => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          get: () => state,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      }, state);

    await page.clock.install();
    await page.goto(REPORTS_MAP_URL);
    await expect.poll(() => statsCalls).toBeGreaterThan(0);

    failing = false;
    let before = statsCalls;
    await page.clock.runFor(5000);
    await expect.poll(() => statsCalls).toBeGreaterThan(before);

    await setVisibility('hidden');
    before = statsCalls;
    await page.clock.runFor(20000);
    expect(statsCalls).toBe(before);

    await setVisibility('visible');
    await expect.poll(() => statsCalls).toBe(before + 1);
    await page.clock.runFor(5000);
    await expect.poll(() => statsCalls).toBe(before + 2);
  });

  test('« Afficher les clôturés » ajoute les signalements clôturés, et le reste après rechargement', async ({
    page,
    mapLocator,
  }) => {
    await serveReportTiles({
      page,
      reports: [addressReport, missingBuildingReport, closedReport],
    });
    await page.goto(REPORTS_MAP_URL);
    await expect(mapLocator(REPORTS_ON_MAP)).toHaveCountOnMap(2);

    await reportFiltersHeading(page).click();
    await page.getByText('Afficher les clôturés').click();
    await expect(page).toHaveURL(/report_closed=1/);
    await expect(mapLocator(reportOnMap(closedReport))).toHaveCountOnMap(1);

    // The URL filters the map, so the panel loads open on its filters
    await page.reload();
    await expect(
      page.getByRole('checkbox', { name: 'Afficher les clôturés' }),
    ).toBeChecked();
    await expect(mapLocator(REPORTS_ON_MAP)).toHaveCountOnMap(3);
  });

  test('parcourt les signalements superposés, ouverts puis clôturés, du plus ancien au plus récent', async ({
    page,
    mapLocator,
  }) => {
    // The closed report (id 3) is older than the open newReport (id 4)
    await serveReportTiles({
      page,
      reports: [closedReport, newReport, addressReport],
    });
    await page.goto(`${REPORTS_MAP_URL}&report_closed=1`);

    await mapLocator(REPORTS_ON_MAP).first().click();
    await expect(page.getByText('1 sur 3')).toBeVisible();
    await expect(page.getByText(addressReport.text)).toBeVisible();
    await page.getByLabel('Votre message').fill('Brouillon non envoyé');

    await page.getByRole('button', { name: 'Signalement suivant' }).click();
    await expect(page.getByText('2 sur 3')).toBeVisible();
    await expect(page.getByText(newReport.text)).toBeVisible();
    await expect(page.getByLabel('Votre message')).toHaveValue('');

    await page.getByRole('button', { name: 'Signalement suivant' }).click();
    await expect(page.getByText('3 sur 3')).toBeVisible();
    await expect(page.getByText(closedReport.text)).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`report=${closedReport.api.id}\\b`),
    );

    // Clicking the point again keeps the selected report and its page
    await mapLocator(REPORTS_ON_MAP).first().click();
    await expect(page.getByText('3 sur 3')).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`report=${closedReport.api.id}\\b`),
    );
  });

  test('sans sélection, les signalements ouverts passent devant le plus récent, clôturé, au survol de la pile', async ({
    page,
    mapLocator,
    mapController,
  }) => {
    // Last in the tile, the closed report would otherwise be drawn on top
    const reports = [addressReport, missingBuildingReport, closedReport];
    await serveReportTiles({ page, reports });
    await page.goto(`${REPORTS_MAP_URL}&report_closed=1`);
    await expect(mapLocator(REPORTS_ON_MAP)).toHaveCountOnMap(3);

    const { x, y, width, height } = await mapLocator(REPORTS_ON_MAP)
      .first()
      .boundingBox();
    await page.mouse.move(x + width / 2, y + height / 2, { steps: 2 });

    const map = await mapController('mainMap').getMapInstance();
    const hoveredReportStatus = async () => {
      const hoveredId = await map.evaluate(
        (mapInstance, ids) =>
          ids.find(
            (id) =>
              mapInstance.getFeatureState({
                source: 'reports',
                sourceLayer: 'default',
                id,
              })?.hovered,
          ),
        reports.map(({ api }) => api.id),
      );
      return reports.find(({ api }) => api.id === hoveredId)?.api.status;
    };
    await expect.poll(hoveredReportStatus).toBe('pending');
  });

  test('un signalement superposé ouvert par lien affiche sa position dans le groupe sans clic', async ({
    page,
  }) => {
    await serveReportTiles({
      page,
      reports: [addressReport, missingBuildingReport, newReport],
    });
    await page.goto(
      `${REPORTS_MAP_URL}&report=${missingBuildingReport.api.id}`,
    );

    await expect(page.getByText(missingBuildingReport.text)).toBeVisible();
    await expect(page.getByText('2 sur 3')).toBeVisible();
  });

  test("sur écran moyen, le panneau de détail défile dans la carte sans la dépasser et nomme l'auteur anonyme", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 600 });
    await serveReportTiles({ page, reports: [addressReport] });
    await page.goto(`${REPORTS_MAP_URL}&report=${addressReport.api.id}`);

    await expect(page.getByText(addressReport.text)).toBeVisible();
    await expect(page.getByText('Anonyme')).toBeVisible();

    const mapBox = await page.locator('[class*="map__mapShell"]').boundingBox();
    const panelBox = await page
      .locator('[class*="detailsContainer"]')
      .boundingBox();
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(
      mapBox!.y + mapBox!.height,
    );
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(
      await layersButtonTop(page),
    );
  });

  test("replié par défaut, l'en-tête affiche les signalements ouverts sélectionnés et s'ouvre au clic", async ({
    page,
  }) => {
    await serveReportStats({ page, stats: reportStatsWithTags });
    await page.goto(REPORTS_MAP_URL);

    const openCountBadge = page.locator(`${REPORT_PANEL} .fr-badge`);
    await expect(openCountBadge).toHaveText('6 signalements ouverts');
    await expect(page.getByText('Afficher les clôturés')).toBeHidden();

    await reportFiltersHeading(page).click();
    await expect(page.getByText('Afficher les clôturés')).toBeVisible();
    await expect(openCountBadge).toBeHidden();
  });

  test('un lien filtré par étiquette ouvre les filtres, et replié le badge compte la sélection', async ({
    page,
  }) => {
    await serveReportStats({ page, stats: reportStatsWithTags });
    await page.goto(`${REPORTS_MAP_URL}&report_tags=1`);

    await expect(page.getByText('Afficher les clôturés')).toBeVisible();
    const openCountBadge = page.locator(`${REPORT_PANEL} .fr-badge`);
    await expect(openCountBadge).toBeHidden();

    await reportFiltersHeading(page).click();
    await expect(openCountBadge).toHaveText('2 signalements ouverts');
  });

  for (const viewport of [
    { width: 667, height: 375 },
    { width: 844, height: 390 },
  ]) {
    test(`sur une carte basse (${viewport.width}x${viewport.height}), la fiche et les filtres restent dans le panneau`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await serveReportStats({ page, stats: manyTagsReportStats });
      await serveReportTiles({ page, reports: [addressReport] });
      await page.goto(`${REPORTS_MAP_URL}&report=${addressReport.api.id}`);
      await expect(page.getByText(addressReport.text)).toBeAttached();
      await expectReportPanelContentInside(page);

      await reportFiltersHeading(page).click();
      await expect(page.getByText('Étiquette 10')).toBeAttached();
      await expectReportPanelContentInside(page);
    });
  }

  test("sur mobile, les suggestions d'adresse passent devant le panneau replié", async ({
    page,
    httpMocker,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await httpMocker.banSearch(
      ['1', '2', '3'].map((id) => ({
        ...banFeatureSegur,
        properties: { ...banFeatureSegur.properties, id },
      })),
    );
    await page.goto(REPORTS_MAP_URL);
    await expect(reportFiltersHeading(page)).toBeVisible();

    await page
      .getByPlaceholder('Chercher une adresse, un identifiant RNB')
      .fill('73 Av. de Paris');
    const suggestions = page.locator(
      '[class*="autocomplete_suggestions"] > div',
    );
    await expect(suggestions).toHaveCount(3);

    for (const suggestion of await suggestions.all()) {
      expect(await isOnTop(suggestion)).toBe(true);
    }
  });

  test('sur mobile, le panneau Bâtiment masque les signalements, qui reviennent à sa fermeture', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await serveReportStats({ page, stats: reportStatsWithTags });
    await page.goto(`${REPORTS_MAP_URL}&q=${buildingSegur.rnb_id}`);
    const buildingPanel = page.getByTestId('visu-panel');
    await expect(buildingPanel).toContainText(buildingSegur.rnb_id);
    await expect(reportFiltersHeading(page)).toBeHidden();

    const close = buildingPanel.getByRole('link', {
      name: 'Fermer',
      exact: true,
    });
    expect(await isOnTop(close)).toBe(true);
    await close.click();
    await expect(buildingPanel).toBeHidden();
    await expect(reportFiltersHeading(page)).toBeVisible();
  });

  test('sur mobile, la fiche du signalement ouvert passe devant son bâtiment, puis le panneau Bâtiment reprend la main', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await serveReportTiles({ page, reports: [addressReport] });
    await page.goto(`${REPORTS_MAP_URL}&report=${addressReport.api.id}`);
    const buildingPanel = page.getByTestId('visu-panel');
    await expect(buildingPanel).toContainText(buildingSegur.rnb_id);
    await expect(page.getByText(addressReport.text)).toBeVisible();

    await page
      .locator(`${REPORT_PANEL} [class*="detailsContainer"] a`)
      .filter({ has: page.locator('.fr-icon-close-line') })
      .click();
    await expect(reportFiltersHeading(page)).toBeHidden();
    expect(
      await isOnTop(
        buildingPanel.getByRole('link', { name: 'Fermer', exact: true }),
      ),
    ).toBe(true);
  });

  test('sur mobile, un bâtiment ouvert après les filtres passe devant eux, qui reviennent à sa fermeture', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await serveReportStats({ page, stats: reportStatsWithTags });
    await page.goto(
      `${REPORTS_MAP_URL}&report_tags=1&q=${buildingSegur.rnb_id}`,
    );
    const buildingPanel = page.getByTestId('visu-panel');
    await expect(buildingPanel).toContainText(buildingSegur.rnb_id);
    await expect(reportFiltersHeading(page)).toBeHidden();

    await buildingPanel
      .getByRole('link', { name: 'Fermer', exact: true })
      .click();
    await expect(page.getByText('Afficher les clôturés')).toBeVisible();
  });

  test("sur mobile, un bâtiment cherché après la fiche d'un signalement passe devant elle, qui revient à sa fermeture", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const reportId = await serveReportWithoutBuilding(page);
    await page.goto(`${REPORTS_MAP_URL}&report=${reportId}`);
    const reportText = page.getByText(missingBuildingReport.text);
    await expect(reportText).toBeVisible();

    const search = page.getByPlaceholder(
      'Chercher une adresse, un identifiant RNB',
    );
    await search.fill(buildingSegur.rnb_id);
    await search.press('Enter');
    const buildingPanel = page.getByTestId('visu-panel');
    await expect(buildingPanel).toContainText(buildingSegur.rnb_id);
    await expect(reportText).toBeHidden();
    const close = buildingPanel.getByRole('link', {
      name: 'Fermer',
      exact: true,
    });
    expect(await isOnTop(close)).toBe(true);

    await close.click();
    await expect(reportText).toBeVisible();
  });

  test("sur /edition mobile, la création ouverte depuis la fiche d'un signalement passe devant elle", async ({
    page,
    editionPage,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const reportId = await serveReportWithoutBuilding(page);
    await page.goto(
      `/edition?extra_layers=reports&coords=${REPORTS_POINT.lat},${REPORTS_POINT.lng},17&report=${reportId}`,
    );
    const reportText = page.getByText(missingBuildingReport.text);
    await expect(reportText).toBeVisible();

    await page.getByTestId('create-action-button').click();
    await expect(editionPage.panel).toBeVisible();
    await expect(reportText).toBeHidden();
  });

  test("sur /edition mobile sans bâtiment, le panneau se place sous la barre d'outils d'édition", async ({
    page,
    editionPage,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await editionPage.goto();
    await expect(reportFiltersHeading(page)).toBeVisible();

    const panelTop = (await page.locator(REPORT_PANEL).boundingBox())!.y;
    for (const testId of [
      'create-action-button',
      'merge-action-button',
      'split-action-button',
    ]) {
      const action = page.getByTestId(testId);
      const actionBox = (await action.boundingBox())!;
      expect(panelTop).toBeGreaterThan(actionBox.y + actionBox.height);
      expect(await isOnTop(action)).toBe(true);
    }
  });

  test('les nombres du panneau ont le même séparateur de milliers partout', async ({
    page,
  }) => {
    await serveReportStats({ page, stats: thousandsReportStats });
    await page.goto(REPORTS_MAP_URL);

    await expect(page.locator(`${REPORT_PANEL} .fr-badge`)).toHaveText(
      '13 295 signalements ouverts',
    );
    await reportFiltersHeading(page).click();
    await expect(
      page.locator(`${REPORT_PANEL} [class*="totalCount"]`),
    ).toHaveText('13 295');
    await expect(page.locator(`${REPORT_PANEL} .fr-hint-text`)).toHaveText(
      '13 295 signalements ouverts',
    );
    await page.getByText('Afficher les clôturés').click();
    await expect(page.locator(`${REPORT_PANEL} .fr-hint-text`)).toHaveText(
      '13 295 ouverts · 1 205 clôturés',
    );
  });

  test("sur grand écran, le panneau s'aligne sur la recherche et s'arrête au-dessus du bouton Calques", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openReportFiltersWithManyTags(page);

    const searchBox = await page.locator(ADDRESS_SEARCH).boundingBox();
    const panelBox = await page.locator(REPORT_PANEL).boundingBox();
    expect(panelBox!.y).toBeCloseTo(searchBox!.y, 0);
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(
      await layersButtonTop(page),
    );

    // Only the body scrolls: the header stays in place
    const body = page.locator(`${REPORT_PANEL} [class$="__body"]`);
    expect(
      await body.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    const headingY = (await reportFiltersHeading(page).boundingBox())!.y;
    await body.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(
      0,
    );
    expect((await reportFiltersHeading(page).boundingBox())!.y).toBe(headingY);
  });

  test('sur mobile, le panneau se place sous la recherche, à sa largeur, sans couvrir les contrôles', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openReportFiltersWithManyTags(page);

    const searchBox = await page.locator(ADDRESS_SEARCH).boundingBox();
    const panelBox = await page.locator(REPORT_PANEL).boundingBox();
    expect(panelBox!.y).toBeCloseTo(searchBox!.y + searchBox!.height + 12, 0);
    expect(panelBox!.x).toBeCloseTo(searchBox!.x, 0);
    expect(panelBox!.x + panelBox!.width).toBeCloseTo(
      searchBox!.x + searchBox!.width,
      0,
    );
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(
      await layersButtonTop(page),
    );
  });

  test("le filtre par étiquette ne confond pas l'étiquette 1 avec l'étiquette 12", async ({
    page,
    mapLocator,
  }) => {
    await serveReportTiles({
      page,
      reports: [addressReport, missingBuildingReport],
    });
    await page.goto(`${REPORTS_MAP_URL}&report_tags=1`);

    await expect(mapLocator(reportOnMap(addressReport))).toHaveCountOnMap(1);
    await expect(mapLocator(REPORTS_ON_MAP)).toHaveCountOnMap(1);
  });

  test('un signalement envoyé depuis la fiche bâtiment apparaît sur la carte et dans le groupe ouvert sans recharger la page', async ({
    page,
    mapLocator,
    mapController,
  }) => {
    const reports = [addressReport, missingBuildingReport];
    await serveReportTiles({ page, reports });
    await page.route(
      (url) => url.pathname.endsWith('/reports/'),
      async (route) => {
        reports.push(newReport);
        await route.fulfill({ json: {} });
      },
    );
    await page.goto(`${REPORTS_MAP_URL}&q=${buildingSegur.rnb_id}`);
    const map = await mapController('mainMap').getMapInstance();
    await expect
      .poll(() =>
        map.evaluate(
          (mapInstance) =>
            Boolean(mapInstance.getStyle().sources.reports) &&
            mapInstance.isSourceLoaded('reports') &&
            mapInstance.loaded(),
        ),
      )
      .toBe(true);
    await mapLocator(REPORTS_ON_MAP).first().click();
    await expect(page.getByText('1 sur 2')).toBeVisible();

    await page.getByPlaceholder(/Il manque un bâtiment/).fill(newReport.text);
    const reportTilesRefetched = page.waitForRequest(/\/reports\/tiles\//);
    await page.getByRole('button', { name: 'Envoyer mon signalement' }).click();
    await expect(page.getByText('Signalement envoyé. Merci.')).toBeVisible();
    await reportTilesRefetched;

    await expect(mapLocator(REPORTS_ON_MAP)).toHaveCountOnMap(3);
    await expect(page.getByText('1 sur 3')).toBeVisible();
    await expect(page.getByText(addressReport.text)).toBeVisible();
    // The buildings reloaded after sending must stay drawn under the reports
    await expect
      .poll(() =>
        map.evaluate((mapInstance) => {
          const layerIds = mapInstance
            .getStyle()
            .layers.map((layer) => layer.id);
          const lastBuildingIndex = Math.max(
            ...layerIds.map((id, index) =>
              id.startsWith('bdgs') ? index : -1,
            ),
          );
          return layerIds.indexOf('reports_circle') > lastBuildingIndex;
        }),
      )
      .toBe(true);
  });

  test('un signalement clôturé ouvert par lien reste affiché et mis en avant après un changement de fond de carte', async ({
    page,
    mapLocator,
    mapController,
  }) => {
    await serveReportTiles({ page, reports: [addressReport, closedReport] });
    await page.goto(`${REPORTS_MAP_URL}&report=${closedReport.api.id}`);
    await expect(page.getByText(closedReport.text)).toBeVisible();

    await expect(mapLocator(reportOnMap(closedReport))).toHaveCountOnMap(1);
    const map = await mapController('mainMap').getMapInstance();
    const isClosedReportHighlighted = () =>
      map.evaluate(
        (mapInstance, id) =>
          mapInstance.getFeatureState({
            source: 'reports',
            sourceLayer: 'default',
            id,
          })?.highlighted,
        closedReport.api.id,
      );
    await expect.poll(isClosedReportHighlighted).toBe(true);

    await page.keyboard.press('Shift+S');
    // The satellite style is applied: the reports layers are being reinstalled
    await expect
      .poll(() =>
        map.evaluate((mapInstance) =>
          Boolean(mapInstance.getStyle().sources['raster-tiles']),
        ),
      )
      .toBe(true);
    await expect(mapLocator(reportOnMap(closedReport))).toHaveCountOnMap(1);
    await expect.poll(isClosedReportHighlighted).toBe(true);
  });
});
