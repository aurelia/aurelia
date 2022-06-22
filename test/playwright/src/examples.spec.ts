import * as playwright from 'playwright';
import * as assert from 'assert';

// TODO: make firefox and webkit work on CI (complains about missing host dependencies)
const browserTypes = ['chromium'/* , 'firefox', 'webkit' */] as const;

describe('examples', function () {
  for (const browserType of browserTypes) {
    describe(browserType, function () {
      it(`renders 'Hello World!'`, async function () {
        this.timeout(5000);

        const browser = await playwright[browserType].launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('http://127.0.0.1:9000');

        await page.waitForSelector('app>div');

        const text = await (await page.$('app>div'))!.textContent();

        assert.strictEqual(text, 'Hello World!');

        const input = await page.$('jit-input input');
        assert.strictEqual(await input?.getAttribute('aria-label'), 'First name');

        await browser.close();
      });
    });
  }
});
