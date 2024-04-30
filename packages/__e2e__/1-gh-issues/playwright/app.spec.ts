import { test, expect } from '@playwright/test';

test.describe.serial('examples/html-only/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  test('dup resource registration https://github.com/aurelia/aurelia/issues/1951', async ({ page }) => {
    await page.click(':text("click me")');

    await expect(page.locator('ul')).toContainText(`I'm a two!`);
  });
});

