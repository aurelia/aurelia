import { test, expect } from '@playwright/test';

test.describe.serial('examples/hmr-webpack-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  test.skip('renders after filling the initially empty array', function () {/* todo */});
  test('renders after array is filled again after being empty', function () {
    expect(1).toBe(1);
  });
});

