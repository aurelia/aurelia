import { test, expect } from '@playwright/test';

const PORT = process.env.APP_PORT ?? 5173;
const appUrl = `http://127.0.0.1:${PORT}`;

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl);
});

test('loads home route', async ({ page }) => {
  await expect(page.locator('au-viewport')).toHaveText('Home page');
});

test('loads route when clicking on link', async ({ page }) => {
  await page.click('a:text("Register")');
  await expect(page.locator('au-viewport')).toContainText('Auth page');
});

test('loads right component refreshing the page with deep linking', async ({ page }) => {
  await page.click(':text("Show iframe")');
  const frame = await (await page.$('iframe')).contentFrame();
  await Promise.all([
    page.waitForNavigation(),
    frame.click(':text("Goto auth")'),
  ]);
  expect(page.url()).toBe(`${appUrl}/auth`);
  await expect(page.locator('au-viewport')).toContainText('Auth page');
});
