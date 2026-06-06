import {Page, expect} from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    // Hero h1 ("保育士と保育園を / やさしくつなぐ"); matched loosely because the
    // line break makes the accessible name whitespace-sensitive.
    await expect(
      this.page.getByRole('heading', {name: /やさしくつなぐ/}),
    ).toBeVisible();
  }
}
