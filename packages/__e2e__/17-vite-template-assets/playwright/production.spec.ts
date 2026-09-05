import { expect, test } from '@playwright/test';

test('emits and serves an asset referenced from a conventional template', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'networkidle' });

  const asset = page.locator('#template-asset');
  await expect(asset).toBeVisible();
  await expect(asset).toHaveJSProperty('complete', true);
  expect(await asset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(asset).toHaveAttribute('src', /\/assets\/aurelia-logo-[\w-]+\.svg$/);
});
