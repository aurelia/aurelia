import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const decoratedCardPath = path.resolve(__dirname, '../src/decorated-card.ts');

test.describe.serial('Vite 8 standard decorators', function () {
  let originalDecoratedCard: string;

  test.beforeAll(function () {
    originalDecoratedCard = fs.readFileSync(decoratedCardPath, { encoding: 'utf-8' });
  });

  test.afterAll(function () {
    fs.writeFileSync(decoratedCardPath, originalDecoratedCard, { encoding: 'utf-8' });
  });

  test.beforeEach(async function ({ page, baseURL }) {
    page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
    page.on('pageerror', error => console.log(`[browser:error] ${error.stack ?? error.message}`));
    const viteConnected = page.waitForEvent('console', {
      predicate: message => message.text() === '[vite] connected.',
    });
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    await viteConnected;
  });

  test('renders convention resources and an uninitialized bindable on a derived class', async function ({ page }) {
    await expect(page.locator('#message')).toHaveText('Vite 8 decorators work');
    await expect(page.locator('#decorator-revision')).toHaveText('decorator-v1:1');
    await expect(page.locator('#decorated-value')).toHaveText('Vite 8 decorators work');
    await expect(page.locator('#worker-result')).toHaveText('initializer:true;own:false;value:2');
    await expect(page.locator('#jsx-result')).toHaveText('TSX factory import retained');

    await page.locator('#message-input').fill('Updated through the bindable');

    await expect(page.locator('#decorated-value')).toHaveText('Updated through the bindable');
  });

  test('runs the updated decorator initializer on the replacement view model', async function ({ page }) {
    await expect(page.locator('#decorator-revision')).toHaveText('decorator-v1:1');

    fs.writeFileSync(
      decoratedCardPath,
      originalDecoratedCard.replace('decorator-v1', 'decorator-v2'),
      { encoding: 'utf-8' },
    );

    await page.waitForFunction(
      () => window.vite8ModuleEvaluations === 2,
      undefined,
      { timeout: 10_000 },
    );
    await expect(page.locator('#decorator-revision')).toHaveText('decorator-v2:2');
  });
});
