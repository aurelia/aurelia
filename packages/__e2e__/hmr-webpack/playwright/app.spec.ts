import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('examples/hmr-webpack-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  const appFilePath = path.resolve(__dirname, '../src/app.ts');
  const originalContent = fs.readFileSync(appFilePath, { encoding: 'utf-8' });

  test.afterEach(() => {
    fs.writeFileSync(appFilePath, originalContent);
  });

  test(`rerenders without flushing <input> state`, async function ({ page }) {
    test.setTimeout(15000);

    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await page.type('input', 'abc');
    await expect(page.locator('input')).toHaveValue('abc');

    const newContent = `import { IEventAggregator } from '@aurelia/kernel';

    export class App {
      public message = 'New Hello World!';
    
      public constructor(
        @IEventAggregator private ea: IEventAggregator,
      ) {}
    }
    `;
    fs.writeFileSync(appFilePath, newContent, { encoding: 'utf-8' });

    await expect(page.locator('app > div')).toHaveText('New Hello World!');
    await expect(page.locator('input')).toHaveValue('abc');
  });
});

