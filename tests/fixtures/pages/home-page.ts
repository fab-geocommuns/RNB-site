import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class HomePage extends RNBPage {
  readonly mapButton: Locator;
  readonly searchMapField: Locator;
  readonly searchMapButton: Locator;
  readonly searchMapSuggestions: Locator;
  readonly dbsTitle: Locator;
  readonly toolsTitle: Locator;
  readonly useCasesTitle: Locator;
  readonly faqButton: Locator;
  readonly editionActivityTitle: Locator;
  readonly editionActivitySection: Locator;

  constructor(page: Page) {
    super(page, '/');

    this.mapButton = page
      .locator('a', {
        hasText: 'Voir la carte des bâtiments',
      })
      .first();
    this.searchMapField = page.getByPlaceholder(/un identifiant RNB/i);
    this.searchMapButton = page.locator('.fr-search-bar button[type="submit"]');
    this.searchMapSuggestions = page.locator(
      '[class*="addressAutocomplete_autocomplete_suggestions"]',
    );
    this.dbsTitle = page
      .locator('h2')
      .getByText(/enrichissez vos données bâtimentaires/i);
    this.toolsTitle = page.locator('h2').getByText('Outils et services');
    this.useCasesTitle = page.locator('h2').getByText("Cas d'usage");
    this.faqButton = page.getByText('Consulter la Foire aux Questions');
    this.editionActivityTitle = page
      .locator('h2')
      .getByText(/amélioré (leurs|ses) bâtiments/);
    this.editionActivitySection = page
      .locator('section')
      .filter({ has: this.editionActivityTitle });
  }
}
