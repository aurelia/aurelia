import { expect, test } from '@playwright/test';

const PROD_PORT = process.env.PROD_PORT || '9007';
const BASE_URL = `http://localhost:${PROD_PORT}`;

test.describe('router.prod-build', () => {
  test('production build loads without issues', async ({ page }) => {
    // Navigate to the production build served by static server
    await page.goto(BASE_URL);

    // Verify the app loads by checking for the home page content
    await expect(page.locator('au-viewport')).toHaveText('Home page', { timeout: 10000 });

    // Verify basic navigation works in production build
    await page.click('text=Register');
    await expect(page.locator('au-viewport')).toContainText('Auth page');

    // Navigate back to home
    await page.click('text=Home');
    await expect(page.locator('au-viewport')).toHaveText('Home page');
  });

  test('production build handles routing correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test navigation to different routes
    await page.click('#page-one-link');
    await expect(page.locator('#root-vp')).toContainText('One page');

    await page.click('#page-two-link');
    await expect(page.locator('#root-vp')).toContainText('Two page');

    // Test direct URL navigation
    await page.goto(`${BASE_URL}/auth`);
    await expect(page.locator('au-viewport')).toContainText('Auth page');
  });

  test('production build loads assets correctly', async ({ page }) => {
    // Check that no console errors occurred during load
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate and verify the page loads successfully
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);

    // Wait for the app to initialize
    await expect(page.locator('au-viewport')).toHaveText('Home page', { timeout: 10000 });

    // Verify no critical console errors (some warnings may be acceptable)
    const criticalErrors = errors.filter(e =>
      !e.includes('DevTools') && // Ignore DevTools warnings
      !e.includes('Extension')   // Ignore extension warnings
    );
    expect(criticalErrors.length, criticalErrors.join('\n')).toBe(0);
  });

  test('production build should serve image assets imported in TS', async ({ page }) => {
    const imageResponses: { url: string; status: number; contentType: string }[] = [];
    page.on('response', response => {
      const url = response.url();
      if (!url.endsWith('.png')) return;
      imageResponses.push({
        url,
        status: response.status(),
        contentType: response.headers()['content-type'] ?? '',
      });
    });

    await page.goto(BASE_URL);

    const image = page.locator('#home-image-relative');
    await expect(image).toBeVisible();

    await expect.poll(async () => {
      return image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
    }, { timeout: 10000 }).toBe(true);

    expect(imageResponses.some(r => r.status === 200)).toBe(true);
    expect(imageResponses.some(r => r.contentType.startsWith('image/'))).toBe(true);
    expect(imageResponses.some(r => r.url.includes('/assets/'))).toBe(true);
  });
});
