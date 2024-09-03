import { Page } from '@playwright/test';

export abstract class ComponentTestUtil<Args> {
  constructor(protected page: Page) {}

  abstract run(args: Args): Promise<void>;
}
