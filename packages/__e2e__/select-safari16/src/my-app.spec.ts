import { test, expect } from '@playwright/test';

test.use({
  browserName: 'webkit',
});

test.describe('router', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  test('works on safari', async ({ page }) => {
    await expect(page.locator('select')).toHaveValue('1');
  });
});
