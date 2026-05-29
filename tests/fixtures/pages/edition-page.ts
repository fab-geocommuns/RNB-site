import { RNBPage } from '@/tests/fixtures/pages/_page';
import { MapController } from '@mapgrab/playwright';
import { Locator, Page } from '@playwright/test';

export class EditionPage extends RNBPage {
  readonly panel: Locator;
  readonly toaster: Locator;
  readonly map: Locator;

  constructor(page: Page) {
    super(page, '/edition');
    this.map = page.getByTestId('map');
    this.panel = page.getByTestId('edition-panel');
    this.toaster = page.getByTestId('toaster');
  }

  async goToBuilding(buildingId: string) {
    await this.loginIfNotLoggedIn();
    await this.page.goto(`/edition?q=${buildingId}`);
  }

  async deactivateBuilding() {
    const deactivationButton = this.panel.getByTestId(
      'toggle-activation-button',
    );
    await deactivationButton.scrollIntoViewIfNeeded();
    await deactivationButton.click();
  }

  async startSplit() {
    const splitActionButton = this.page.getByTestId('split-action-button');
    await splitActionButton.click();
  }

  async clickNext() {
    const nextButton = this.panel.getByRole('button', { name: 'Suivant' });
    await nextButton.click();
  }

  async validateCut() {
    const validateButton = this.panel.getByRole('button', {
      name: 'Valider la découpe',
    });
    await validateButton.click();
  }

  async confirmSplit() {
    const confirmButton = this.panel.getByRole('button', { name: 'Scinder' });
    await confirmButton.click();
  }

  async drawShape(
    mapController: MapController,
    points: Array<[number, number]>,
  ) {
    for (const point of points) {
      // @ts-ignore
      const { x, y } = await mapController.projectLngLatToScreenPoint({
        lat: point[1],
        lng: point[0],
      });
      await this.page.mouse.move(x, y, { steps: 2 });
      await this.page.mouse.down();
      await this.page.mouse.move(x, y, { steps: 2 });
      await this.page.mouse.up();
    }
  }

  async drawCutLine(
    mapController: MapController,
    points: Array<[number, number]>,
  ) {
    // Draw a line: click each point, then double-click the last point to finish
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      // @ts-ignore
      const { x, y } = await mapController.projectLngLatToScreenPoint({
        lat: point[1],
        lng: point[0],
      });
      await this.page.mouse.move(x, y, { steps: 2 });

      if (i === points.length - 1) {
        // Double-click the last point to finish the line
        await this.page.mouse.dblclick(x, y);
      } else {
        await this.page.mouse.down();
        await this.page.mouse.move(x, y, { steps: 2 });
        await this.page.mouse.up();
      }
    }
  }
}
