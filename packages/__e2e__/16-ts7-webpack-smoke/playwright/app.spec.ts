import { expect, test } from '@playwright/test';

test.describe.serial('TypeScript 7 CLI coexistence', function () {
  test('typechecks with TypeScript 7 and builds through the TypeScript 6 compatibility API', async function ({ page, baseURL }) {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Hello TS smoke')).toBeVisible();
    await expect(page.getByTestId('ts-cli-version')).toHaveText(/^7\.0\./);
    await expect(page.getByTestId('ts-api-version')).toHaveText(/^6\./);
  });
});
