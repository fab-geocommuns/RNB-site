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
  readonly newsletterField: Locator;
  readonly newsletterButton: Locator;

  constructor(page: Page) {
    super(page, '/');

    this.mapButton = page.locator('a', {
      hasText: 'Voir la carte des bâtiments',
    });
    this.searchMapField = page.getByPlaceholder(/un identifiant RNB/);
    this.searchMapButton = page.locator('.fr-search-bar button[type="submit"]');
    this.searchMapSuggestions = page.locator(
      '[class*="addressAutocomplete_autocomplete_suggestions"]',
    );
    this.dbsTitle = page
      .locator('h2')
      .getByText('Croisez et enrichissez vos données bâtimentaires');
    this.toolsTitle = page.locator('h2').getByText('Outils et services');
    this.useCasesTitle = page.locator('h2').getByText("Cas d'usage");
    this.faqButton = page.getByText('Consulter la Foire aux Questions');
    this.newsletterField = page.getByPlaceholder('Votre adresse email');
    this.newsletterButton = page.locator('[value="S\'inscrire"]');
  }
}
