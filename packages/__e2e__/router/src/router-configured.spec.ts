import { test, expect } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

test.describe('router', () => {

  addCoverage();

  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
  });

  test('loads home route', async ({ page }) => {
    await expect(page.locator('#root-vp')).toHaveText('Home page');
  });

  test('loads route when clicking on link', async ({ page }) => {
    await page.click('a:text("Register")');
    await expect(page.locator('#root-vp')).toContainText('Auth page');
  });

  test('loads right component refreshing the page with deep linking', async ({ page, baseURL }) => {
    await page.click(':text("Show iframe")');
    const frame = await (await page.$('iframe')).contentFrame();
    await Promise.all([
      page.waitForNavigation(),
      frame.click(':text("Goto auth")'),
    ]);
    expect(page.url()).toBe(`${baseURL}/auth`);
    await expect(page.locator('#root-vp')).toContainText('Auth page');
  });

  test('loads right component refreshing the page with deep linking - url fragment hash', async ({ page, baseURL }) => {
    await page.click(':text("Toggle url fragment hash")');

    await page.click(':text("Show iframe")');
    const frame = await (await page.$('iframe')).contentFrame();
    await Promise.all([
      page.waitForNavigation(),
      frame.click(':text("Goto auth")'),
    ]);
    expect(page.url()).toBe(`${baseURL}/#/auth`);
    await expect(page.locator('#root-vp')).toContainText('Auth page');
  });

  test('loads fallback component when clicking on link with missing component', async ({ page }) => {
    await page.click('a:text("Something missing")');
    await expect(page.locator('#root-vp')).toContainText('Fallback for: something/missing');
  });

  test('loads fallback component when clicking on link in child with missing component', async ({ page }) => {
    await page.click('a:text("Child")');
    await page.click('a:text("Something missing in child")');
    await expect(page.locator('#child-vp')).toContainText('Fallback for: something/missing');
  });

  const tests = [
    { link: 'Pages one-route', result: 'One page' },
    { link: 'Pages two-route', result: 'Two page' },
  ];

  for (const t of tests) {
    test(`loads async route when clicking on link "${t.link}"`, async ({ page }) => {
      await page.click(`a:text("${t.link}")`);
      await expect(page.locator('#root-vp')).toContainText(t.result);
    });
  }
});
