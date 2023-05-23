import { test, expect } from '@playwright/test';

test.describe('examples/hmr-parcel/app.spec.ts', function () {

  test(`rerenders without flushing <input> state`, async function ({ page }) {
    page.on('console', msg => console.log(msg.text()));

    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await page.type('input', 'abc');
    await expect(page.locator('div')).toHaveText('abc');
  });
});

