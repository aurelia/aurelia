import { expect, test } from '@playwright/test';

test('rewrites template assets and preserves ignored or missing references', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'networkidle' });

  const asset = page.locator('#template-asset');
  await expect(asset).toBeVisible();
  await expect(asset).toHaveJSProperty('complete', true);
  expect(await asset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(asset).toHaveAttribute('src', /\/assets\/aurelia-logo-[\w-]+\.svg$/);

  const ignoredAsset = page.locator('#ignored-template-asset');
  await expect(ignoredAsset).toBeVisible();
  await expect(ignoredAsset).not.toHaveAttribute('au-vite-ignore');
  await expect(ignoredAsset).toHaveAttribute('src', './ignored-logo.svg');
  expect(await ignoredAsset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  const missingAsset = page.locator('#missing-template-asset');
  await expect(missingAsset).toHaveJSProperty('complete', true);
  await expect(missingAsset).toHaveAttribute('src', './missing-logo.svg');
  expect(await missingAsset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(0);
});
