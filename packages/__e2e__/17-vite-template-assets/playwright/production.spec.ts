import { expect, test } from '@playwright/test';
import { build, createServer } from 'vite';
import aurelia from '@aurelia/vite-plugin';

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

test('fails a production build when missing template assets are errors', async function () {
  await expect(build({
    root: process.cwd(),
    configFile: false,
    logLevel: 'silent',
    build: {
      assetsInlineLimit: 0,
      write: false,
    },
    plugins: [aurelia({ transformTemplateAssets: 'error' })],
  })).rejects.toThrow(/Unable to resolve template asset "\.\/missing-logo\.svg"/);
});

test('rewrites template assets during development', async function ({ page }) {
  const server = await createServer({
    root: process.cwd(),
    configFile: false,
    logLevel: 'silent',
    server: {
      host: '127.0.0.1',
      port: 0,
    },
    plugins: [aurelia()],
  });

  try {
    await server.listen();
    const address = server.httpServer?.address();
    if (address == null || typeof address === 'string') {
      throw new Error('Unable to determine the Vite development server address.');
    }

    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'networkidle' });

    const asset = page.locator('#template-asset');
    await expect(asset).not.toHaveAttribute('src', './assets/aurelia-logo.svg');
    expect(await asset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

    const ignoredAsset = page.locator('#ignored-template-asset');
    await expect(ignoredAsset).not.toHaveAttribute('au-vite-ignore');
    await expect(ignoredAsset).toHaveAttribute('src', './ignored-logo.svg');

    await expect(page.locator('#missing-template-asset')).toHaveAttribute('src', './missing-logo.svg');
  } finally {
    await server.close();
  }
});
