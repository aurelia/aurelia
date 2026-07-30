import { expect, test } from '@playwright/test';

test.describe.serial('examples/ts6-webpack-smoke/app.spec.ts', function () {
  test('serves the app without build errors', async function ({ page, baseURL }) {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Hello TS smoke')).toBeVisible();
    await expect(page.locator('text=/^6\\./')).toBeVisible();
  });
});
