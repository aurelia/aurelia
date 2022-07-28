import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const appFilePath = path.resolve(__dirname, '../src/app.ts');
const originalContent = fs.readFileSync(appFilePath, { encoding: 'utf-8' });
test.describe('examples', function () {

  test.afterEach(() => {
    fs.writeFileSync(appFilePath, originalContent);
  })

  test(`renders 'Hello World!'`, async function ({ page }) {
    test.setTimeout(15000);
    await page.goto('http://localhost:9000', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await page.type('input', 'abc');

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

