import { expect, test } from '@playwright/test';

test.describe.serial('examples/type-check-webpack-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  test.describe('normal usage', function () {

    test('import aliasing with [as] works', async function ({ page }) {
      await expect(page.locator('text=42')).toBeVisible();
      await expect(page.locator('text=a - b')).toBeVisible(); // injects works correctly
    });
  });
});

