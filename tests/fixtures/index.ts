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
import { signInAs, FakeUser } from '@/tests/fixtures/utils/auth-mock';
import { API_BASE } from '@/tests/config';
import {
  test as mapGrabTest,
  expect as mapGrabExpect,
} from '@mapgrab/playwright';

export type AuthFixture = {
  /** Inject a next-auth session cookie. Call before the first page navigation. */
  signIn: (user?: Partial<FakeUser>) => Promise<void>;
};

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
  auth: AuthFixture;
};

const createPageFixture =
  <T extends RNBPage>(PageClass: new (page: Page) => T) =>
  async (
    {
      page,
      httpMocker,
    }: PlaywrightTestArgs & PlaywrightTestOptions & PagesFixtures,
    use: (page: T) => Promise<void>,
  ) => {
    // Install the default-deny mock layer before navigating so the first
    // request fired by the page is already intercepted.
    await httpMocker.install();
    const instance = new PageClass(page);
    await instance.goto();
    await use(instance);
  };

const testPage = baseTest.extend<PagesFixtures>({
  httpMocker: async ({ page }, use) => {
    const httpMocker = createHttpMocker(page, API_BASE);
    await use(httpMocker);
  },
  auth: async ({ context }, use) => {
    await use({
      signIn: (user) => signInAs(context, user),
    });
  },
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
});

export const test = mergeTests(testPage, testWithNewsletter, mapGrabTest);
export const expect = mergeExpects(baseExpect, mapGrabExpect);
