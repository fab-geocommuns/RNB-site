import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class BlogPage extends RNBPage {
  readonly pressTitle: Locator;
  readonly followUsTitle: Locator;
  readonly blogPosts: Locator;

  constructor(page: Page) {
    super(page, '/blog');
    this.pressTitle = page.getByText('Dans la presse');
    this.followUsTitle = page.getByText('Nous suivre');
    this.blogPosts = page.locator(
      '.fr-card.fr-enlarge-link.fr-card--horizontal.fr-card--sm',
    );
  }
}
