import { test, expect } from '@playwright/test';

test.describe('router', () => {
  test.use({
    browserName: 'webkit',
  });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  test('works on safari', async ({ page }) => {
    await expect(page.locator('select')).toHaveValue('1');
  });
});
