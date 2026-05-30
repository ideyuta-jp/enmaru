import {Page, expect} from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', {name: 'enmaru'}),
    ).toBeVisible();
  }
}
