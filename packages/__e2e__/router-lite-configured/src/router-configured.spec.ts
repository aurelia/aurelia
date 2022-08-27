import { test, expect } from '@playwright/test';

test.describe('router-lite configured', () => {

  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  test('loads home route', async ({ page }) => {
    await expect(page.locator('au-viewport')).toHaveText('Home page');
  });

  test('handles clicks on auth anchor', async ({ page }) => {
    await page.click('text=Register');
    await expect(page.locator('au-viewport')).toContainText('Auth page');
  });

  test('loads shallow linking', async ({ page, baseURL }) => {
    await page.click(':text("Show iframe")');
    const frame = await (await page.$('iframe')).contentFrame();
    await Promise.all([
      page.waitForNavigation(),
      frame.click(':text("Goto auth")'),
    ]);
    expect(page.url()).toBe(`${baseURL}/auth`);
    await expect(page.locator('au-viewport')).toContainText('Auth page');
  });
});
