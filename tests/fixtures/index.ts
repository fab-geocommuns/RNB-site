import {
  mergeTests,
  mergeExpects,
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  test as baseTest,
  expect as baseExpect,
} from '@playwright/test';
import { HomePage } from '@/tests/fixtures/pages/home-page';
import { AboutPage } from '@/tests/fixtures/pages/about-page';
import { BlogPage } from '@/tests/fixtures/pages/blog-page';
import { ContactPage } from '@/tests/fixtures/pages/contact-page';
import { DefinitionPage } from '@/tests/fixtures/pages/definition-page';
import { FaqPage } from '@/tests/fixtures/pages/faq-page';
import { MapPage } from '@/tests/fixtures/pages/map-page';
import { EditionPage } from '@/tests/fixtures/pages/edition-page';
import { ToolsAndServicesPage } from '@/tests/fixtures/pages/tools-and-services-page';
import { UseCasesPage } from '@/tests/fixtures/pages/use-cases-page';
import { RNBPage } from '@/tests/fixtures/pages/_page';
import { testWithNewsletter } from '@/tests/fixtures/utils/components/newsletter';
import { HttpMocker, createHttpMocker } from '@/tests/fixtures/utils/http-mock';
import {
  test as mapGrabTest,
  expect as mapGrabExpect,
} from '@mapgrab/playwright';

async function addAutomationBypassHeader(page: Page) {
  await page.route(new URL(process.env.BASE_URL!).origin + '/**/*', (route) => {
    const headers = route.request().headers();
    headers['x-vercel-protection-bypass'] =
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
    route.continue({ headers });
  });
}

type PagesFixtures = {
  aboutPage: AboutPage;
  blogPage: BlogPage;
  contactPage: ContactPage;
  definitionPage: DefinitionPage;
  faqPage: FaqPage;
  homePage: HomePage;
  mapPage: MapPage;
  editionPage: EditionPage;
  toolsAndServicesPage: ToolsAndServicesPage;
  useCasesPage: UseCasesPage;
  httpMocker: HttpMocker;
};

const createPageFixture =
  <T extends RNBPage>(PageClass: new (page: Page) => T) =>
  async (
    { page }: PlaywrightTestArgs & PlaywrightTestOptions,
    use: (page: T) => Promise<void>,
  ) => {
    await addAutomationBypassHeader(page);
    const instance = new PageClass(page);
    await instance.goto();
    await use(instance);
  };

const testPage = baseTest.extend<PagesFixtures>({
  aboutPage: createPageFixture(AboutPage),
  blogPage: createPageFixture(BlogPage),
  contactPage: createPageFixture(ContactPage),
  definitionPage: createPageFixture(DefinitionPage),
  faqPage: createPageFixture(FaqPage),
  homePage: createPageFixture(HomePage),
  mapPage: createPageFixture(MapPage),
  editionPage: createPageFixture(EditionPage),
  toolsAndServicesPage: createPageFixture(ToolsAndServicesPage),
  useCasesPage: createPageFixture(UseCasesPage),
  httpMocker: async ({ page }, use) => {
    const httpMocker = createHttpMocker(page);
    await use(httpMocker);
  },
});

export const test = mergeTests(testPage, testWithNewsletter, mapGrabTest);
export const expect = mergeExpects(baseExpect, mapGrabExpect);
