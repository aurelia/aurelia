import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe.serial('examples/hmr-webpack-e2e/app.spec.ts', function () {

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  const appFilePath = path.resolve(__dirname, '../src/app.ts');
  const originalContent = fs.readFileSync(appFilePath, { encoding: 'utf-8' });

  const myInputFilePath = path.resolve(__dirname, '../src/components/my-input.ts');
  const originalMyInputContent = fs.readFileSync(myInputFilePath, { encoding: 'utf-8' });

  test.afterEach(() => {
    fs.writeFileSync(appFilePath, originalContent);
    fs.writeFileSync(myInputFilePath, originalMyInputContent);
  });

  test(`rerenders without flushing <input> state`, async function ({ page }) {
    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await page.type('input', 'abc');
    await expect(page.locator('input')).toHaveValue('abc');

    const newContent = `import { IEventAggregator } from '@aurelia/kernel';

    export class App {
      public message = 'New Hello World!';
    
      public constructor(
        @IEventAggregator private readonly ea: IEventAggregator,
      ) {}
    }
    `;
    fs.writeFileSync(appFilePath, newContent, { encoding: 'utf-8' });

    await expect(page.locator('app > div')).toHaveText('New Hello World!');
    await expect(page.locator('input')).toHaveValue('abc');
  });

  test('retains bindable values', async function ({ page }) {
    await expect(page.locator('app textarea')).toHaveValue('Hello 2!');

    const newContent = `import { bindable } from 'aurelia';

    export class MyInput {
        @bindable value = 'hello';
    }
    `;
    fs.writeFileSync(myInputFilePath, newContent, { encoding: 'utf-8' });

    await expect(page.locator('app p')).toHaveText('Hello 2!');
    await expect(page.locator('textarea')).toHaveValue('Hello 2!');
  });
});

