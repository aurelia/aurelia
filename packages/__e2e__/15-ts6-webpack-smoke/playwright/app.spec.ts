import { expect, test } from '@playwright/test';

test.describe.serial('TypeScript 6 webpack compatibility', function () {
  test('builds and serves with TypeScript 6', async function ({ page, baseURL }) {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Hello TS smoke')).toBeVisible();
    await expect(page.getByTestId('ts-version')).toHaveText(/^6\./);
  });
});
