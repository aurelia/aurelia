import { test, expect } from '@playwright/test';

test.describe('examples/hmr-parcel/app.spec.ts', function () {
  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  test(`rerenders without flushing <input> state`, async function ({ page }) {
    page.on('console', msg => console.log(msg.text()));

    await expect(page.locator('my-app > div')).toHaveText('Hello World!');
    await page.locator('input').fill('abc');
    await expect(page.locator('div')).toHaveText('abc');
  });
});

