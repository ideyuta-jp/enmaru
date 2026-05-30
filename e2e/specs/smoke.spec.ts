import {test} from '../fixtures';
import {HomePage} from '../pages/HomePage';

/**
 * Smoke test: verify the home page loads and renders without errors.
 * Intentionally shallow — confirms routing and basic rendering work.
 */
test('home page loads', async ({page}) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.expectLoaded();
});
