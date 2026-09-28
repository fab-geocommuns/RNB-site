/**
 * Signalements sur /carte. Contrairement aux autres tuiles `.pbf`, absorbées
 * vides par `HttpMocker`, les tuiles de signalements sont servies avec de
 * vraies features (cf. `encodePointTile`), tous les signalements étant
 * superposés sur `REPORTS_POINT`.
 */
import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { buildingSegur } from '@/tests/fixtures/data/buildings';
import {
  REPORTS_POINT,
  ReportFixture,
  addressReport,
  closedReport,
  missingBuildingReport,
  newReport,
  emptyReportStats,
} from '@/tests/fixtures/data/reports';
import { encodePointTile } from '@/tests/fixtures/utils/vector-tile';

const REPORTS_MAP_URL = `/carte?extra_layers=reports&coords=${REPORTS_POINT.lat},${REPORTS_POINT.lng},17`;
const REPORTS_ON_MAP = 'map[id=mainMap] layer[id=reports_circle]';

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
    httpMocker.get('/reports/stats/', emptyReportStats);
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

    await page.getByText('Afficher les clôturés').click();
    await expect(page).toHaveURL(/report_closed=1/);
    await expect(mapLocator(reportOnMap(closedReport))).toHaveCountOnMap(1);

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
      (url) => url.pathname.endsWith('/contributions/'),
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
