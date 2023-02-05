import { test, expect } from '@playwright/test';
import { addCoverage } from '../../playwright-coverage';

test.describe('router-lite configured', () => {

  addCoverage();

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

  // the location change event is tested here as that is bit difficult to test in the unit test setup with the mocked history and location, emitting events etc.
  test('history forward and backward works correctly', async function ({ page }) {
    await expect(page.locator('au-viewport')).toHaveText('Home page');

    await page.click('text=Register');
    await expect(page.locator('au-viewport')).toContainText('Auth page');

    // clear log and go back
    await page.click('text=Clear log');
    await page.goBack();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'\'',
      'au:router:navigation-start - 3 - \'\'',
      'au:router:navigation-end - 3 - \'\'',
    ]);

    // clear log and go forward
    await page.click('text=Clear log');
    await page.goForward();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'auth\'',
      'au:router:navigation-start - 4 - \'auth\'',
      'au:router:navigation-end - 4 - \'auth\'',
    ]);

    // clear log and go back - round#2
    await page.click('text=Clear log');
    await page.goBack();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'\'',
      'au:router:navigation-start - 5 - \'\'',
      'au:router:navigation-end - 5 - \'\'',
    ]);

    // clear log and go forward - round#2
    await page.click('text=Clear log');
    await page.goForward();
    await expect(page.locator('div#eventlog > div')).toHaveText([
      'au:router:location-change - \'auth\'',
      'au:router:navigation-start - 6 - \'auth\'',
      'au:router:navigation-end - 6 - \'auth\'',
    ]);
  });
});
