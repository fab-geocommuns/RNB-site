import {
  mergeTests,
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  test as base,
  TestFixture,
} from '@playwright/test';
import { HomePage } from '@/tests/fixtures/pages/home-page';
import { AboutPage } from '@/tests/fixtures/pages/about-page';
import { BlogPage } from '@/tests/fixtures/pages/blog-page';
import { ContactPage } from '@/tests/fixtures/pages/contact-page';
import { DefinitionPage } from '@/tests/fixtures/pages/definition-page';
import { FaqPage } from '@/tests/fixtures/pages/faq-page';
import { MapPage } from '@/tests/fixtures/pages/map-page';
import { ToolsAndServicesPage } from '@/tests/fixtures/pages/tools-and-services-page';
import { UseCasesPage } from '@/tests/fixtures/pages/use-cases-page';
import { RNBPage } from '@/tests/fixtures/pages/_page';
import { testWithNewsletter } from '@/tests/fixtures/utils/components/newsletter';

type PagesFixtures = {
  aboutPage: AboutPage;
  blogPage: BlogPage;
  contactPage: ContactPage;
  definitionPage: DefinitionPage;
  faqPage: FaqPage;
  homePage: HomePage;
  mapPage: MapPage;
  toolsAndServicesPage: ToolsAndServicesPage;
  useCasesPage: UseCasesPage;
};

const createPageFixture =
  <T extends RNBPage>(PageClass: new (page: Page) => T) =>
  async (
    { page }: PlaywrightTestArgs & PlaywrightTestOptions,
    use: (page: T) => Promise<void>,
  ) => {
    const instance = new PageClass(page);
    await instance.goto();
    await use(instance);
  };

const testPage = base.extend<PagesFixtures>({
  aboutPage: createPageFixture(AboutPage),
  blogPage: createPageFixture(BlogPage),
  contactPage: createPageFixture(ContactPage),
  definitionPage: createPageFixture(DefinitionPage),
  faqPage: createPageFixture(FaqPage),
  homePage: createPageFixture(HomePage),
  mapPage: createPageFixture(MapPage),
  toolsAndServicesPage: createPageFixture(ToolsAndServicesPage),
  useCasesPage: createPageFixture(UseCasesPage),
});

export const test = mergeTests(testPage, testWithNewsletter);
