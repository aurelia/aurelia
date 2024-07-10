import { expect, test } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

/**
 * These tests asserts the fix for the issue 2003: https://github.com/aurelia/aurelia/issues/2003
 */

test.describe('router-lite configured', () => {

  addCoverage();

  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  test('loading and reloading does not change the URL', async ({ page }) => {
    await expect(page.locator('au-viewport')).toHaveText('ce-one');

    const location = page.url();
    expect(location.endsWith('?page=Page-01')).toBe(true);
    expect(location.includes('#')).toBe(false);

    // reload
    await page.reload();
    expect(page.locator('au-viewport')).toHaveText('ce-one');
    expect(page.url()).toBe(location);

    // load c2
    await page.click('text=C2');
    expect(page.locator('au-viewport')).toHaveText('ce-two');
    expect(page.url()).toBe(location);

    // reload
    await page.reload();
    expect(page.locator('au-viewport')).toHaveText('ce-one'); // refreshing the page goes back to the initial state, as there is no history interaction
    expect(page.url()).toBe(location);
  });
});
