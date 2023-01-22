import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe.serial('examples/hmr-webpack-e2e/app.spec.ts', function () {

  const contentMap = new Map<string, string>();

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  let appFilePath: string;
  let inputFilePath: string;
  let textFilePath: string;

  [
    appFilePath = '../src/app.ts',
    inputFilePath = '../src/components/my-input.ts',
    textFilePath = '../src/components/my-text.html',
  ].forEach(file => {
    const filePath = path.resolve(__dirname, file);
    const originalContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

    contentMap.set(filePath, originalContent);
  });

  test.afterEach(() => {
    for (const [filePath, originalContent] of contentMap) {
      fs.writeFileSync(filePath, originalContent, { encoding: 'utf-8' });
    }
  });

  test(`rerenders without flushing <input> state`, async function ({ page }) {
    page.on('console', msg => console.log(msg.text()));

    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await page.type('input', 'abc');
    await expect(page.locator('input')).toHaveValue('abc');

    const newContent = `import { IEventAggregator } from '@aurelia/kernel';

    export class App {
      public message = ''
      public id = 1;

      public constructor(
        @IEventAggregator private readonly ea: IEventAggregator,
      ) {
        (window as any).app = this;
      }
    }
    `;
    fs.writeFileSync(path.resolve(__dirname, appFilePath), newContent, { encoding: 'utf-8' });

    await new Promise(r => setTimeout(r, 10000));
    expect(await page.evaluate('window.app?.id')).toEqual(1);

    await expect(page.locator('app > div')).toHaveText('Hello World!');
    await expect(page.locator('input')).toHaveValue('abc');
  });

  test('retains bindable values', async function ({ page }) {
    await expect(page.locator('app p')).toHaveText('Hello 2!');

    const newContent = `import { bindable } from 'aurelia';

    export class MyInput {
        @bindable value = 'hello';
    }
    `;
    fs.writeFileSync(path.resolve(__dirname, inputFilePath), newContent, { encoding: 'utf-8' });

    await expect(page.locator('app p')).toHaveText('Hello 2!');
    await expect(page.locator('textarea')).toHaveValue('Hello 2!');
  });

  test.skip('reloads html only module', async function ({ page }) {
    await expect(page.locator('my-text')).toHaveText('Hello 2!');
    const newContent =`<bindable name="text"></bindable>new: \${text}`;
    await fs.promises.writeFile(path.resolve(__dirname, textFilePath), newContent, { encoding: 'utf-8' });

    // it should, but it's not working in test
    // doing normal app development works???
    await expect(page.locator('my-text')).toHaveText('new: Hello 2!');
  });

  test.skip('invokes binding lifecycle', function () {/* empty */});
  test.skip('invokes bound lifecycle', function () {/* empty */});
  test.skip('invokes attaching lifecycle', function () {/* empty */});
  test.skip('invokes attached lifecycle', function () {/* empty */});
  test.skip('invokes detaching lifecycle', function () {/* empty */});
  test.skip('invokes unbinding lifecycle', function () {/* empty */});
});

