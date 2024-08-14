import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class BlogPage extends RNBPage {
  readonly pressTitle: Locator;
  readonly followUsTitle: Locator;
  readonly newsletterField: Locator;
  readonly newsletterButton: Locator;
  readonly blogPosts: Locator;

  constructor(page: Page) {
    super(page, '/blog');
    this.pressTitle = page.getByText('Dans la presse');
    this.followUsTitle = page.getByText('Nous suivre');
    this.newsletterField = page.getByPlaceholder('Votre adresse email');
    this.newsletterButton = page.locator('[value="S\'inscrire"]');
    this.blogPosts = page.locator(
      '.fr-card.fr-enlarge-link.fr-card--horizontal.fr-card--sm',
    );
  }
}
