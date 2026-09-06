import { expect, test, type Page } from '@playwright/test';
import aurelia from '@aurelia/vite-plugin';

test.use({ deviceScaleFactor: 2 });

test('rewrites template assets and preserves ignored or missing references', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'networkidle' });

  const asset = page.locator('#template-asset');
  await expect(asset).toBeVisible();
  await expect(asset).toHaveJSProperty('complete', true);
  expect(await asset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(asset).toHaveAttribute('src', /^data:image\/svg\+xml/);

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

for (const selector of ['#template-asset', '#single-quoted-template-asset']) {
  test(`preserves the inlined SVG in ${selector}`, async function ({ page, baseURL }) {
    await page.goto(baseURL!, { waitUntil: 'networkidle' });

    const asset = page.locator(selector);
    await expect(asset).toHaveJSProperty('complete', true);
    expect(await asset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(120);

    // Inlining introduces quotes and entities that a plain file path never had.
    // Read the browser's parsed URL so this also catches HTML attribute corruption.
    expect(await asset.evaluate(async (image: HTMLImageElement) => {
      const svg = new DOMParser().parseFromString(await (await fetch(image.src)).text(), 'image/svg+xml');
      return svg.querySelector('title')?.textContent;
    })).toBe('Shapes & colors');
  });
}

test('loads emitted URLs, encoded filenames, and responsive image candidates', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'networkidle' });

  const emittedAsset = page.locator('#emitted-template-asset');
  await expect(emittedAsset).toHaveAttribute('src', /\/assets\/aurelia-logo-[\w-]+\.svg(?:\?[^#]*)?#logo$/);
  expect(await emittedAsset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(120);
  expect(await page.locator('#encoded-template-asset').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(12);

  const responsiveAsset = page.locator('#responsive-template-asset');
  await expect(responsiveAsset).toHaveAttribute('srcset', /^data:image\/svg\+xml,%3Csvg.+ 1x, data:image\/svg\+xml,.+ 2x$/);
  // At 2x density the local candidate must load, rather than falling back to the
  // one-pixel data URL or treating the comma inside that URL as a separator.
  expect(await responsiveAsset.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(60);
});

test('loads CSS, JSON, and HTML references as URLs', async function ({ page, baseURL }) {
  await page.goto(baseURL!, { waitUntil: 'networkidle' });

  await expectResourceContents(page);
  await expect(page.locator('#styled-asset')).toHaveCSS('background-image', /url\("data:image\/svg\+xml/);
});

test('fails a production build when missing template assets are errors', async function () {
  const { build } = await import(process.env.VITE_PACKAGE ?? 'vite') as typeof import('vite');
  await expect(build({
    root: process.cwd(),
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
    },
    plugins: [aurelia({ templateAssets: { onMissing: 'error' } })],
  })).rejects.toThrow(/Unable to resolve template asset "\.\/missing-logo\.svg"/);
});

test('rewrites template assets during development', async function ({ page }) {
  const { createServer } = await import(process.env.VITE_PACKAGE ?? 'vite') as typeof import('vite');
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
    expect(await page.locator('#encoded-template-asset').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(12);
    await expectResourceContents(page);

    const ignoredAsset = page.locator('#ignored-template-asset');
    await expect(ignoredAsset).not.toHaveAttribute('au-vite-ignore');
    await expect(ignoredAsset).toHaveAttribute('src', './ignored-logo.svg');

    await expect(page.locator('#missing-template-asset')).toHaveAttribute('src', './missing-logo.svg');
  } finally {
    await server.close();
  }
});

async function expectResourceContents(page: Page) {
  const sprite = page.locator('#template-sprite');
  await expect(sprite).toHaveAttribute('href', /\.svg(?:\?[^#]*)?#marker$/);
  expect(await sprite.evaluate((use: SVGUseElement) => use.getBBox().width)).toBe(12);
  await expect(page.locator('#styled-asset')).toHaveCSS('color', 'rgb(12, 34, 56)');
  expect(await page.locator('#template-manifest').evaluate(async (link: HTMLLinkElement) => {
    return (await fetch(link.href)).json();
  })).toMatchObject({ name: 'Template assets' });
  expect(await page.locator('#template-document').evaluate((object: HTMLObjectElement) => {
    return object.contentDocument?.title;
  })).toBe('Embedded document');
}
