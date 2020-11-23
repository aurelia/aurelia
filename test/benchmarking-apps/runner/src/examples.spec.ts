/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Context } from 'mocha';
import * as playwright from 'playwright';
import { ConsoleMessage, Page } from 'playwright';

// TODO: make firefox and webkit work on CI (complains about missing host dependencies)
const browserTypes = ['chromium', 'firefox', 'webkit'] as const;

const baseUrl = 'http://localhost:9000/';
let resolve: (value?: unknown) => void;
const defaultOptions = { timeout: 1_200_000 };

const actionMap = {
  'toggle localize-date': async (page: Page) => (await page.$('button#locale'))?.click(defaultOptions),
  'toggle details': async (page: Page) => (await page.$('button#details'))?.click(defaultOptions),

  'hundred': async (page: Page) => (await page.$('button#hundred'))?.click(defaultOptions),
  'thousand': async (page: Page) => (await page.$('button#thousand'))?.click(defaultOptions),
  'ten-thousand': async (page: Page) => (await page.$('button#ten-thousand'))?.click(defaultOptions),

  'filter employed': async (page: Page) => (await page.$('button#employed'))?.click(defaultOptions),
  'filter unemployed': async (page: Page) => (await page.$('button#unemployed'))?.click(defaultOptions),
  'no filter': async (page: Page) => (await page.$('button#all'))?.click(defaultOptions),

  'delete first': async (page: Page) => (await page.$('span.delete'))?.click(defaultOptions),
  'delete all': async (page: Page) => (await page.$('button#remove-all'))?.click(defaultOptions),
};

function logMeasurement(measurement: Record<string, number>) {
  return function (message: ConsoleMessage) {
    if (message.type() !== 'log') { return; }
    const text = message.text();
    const [label, timeStr] = text.split(':');
    measurement[label] = Number(timeStr);
    resolve();
  };
}
async function actAndMeasure(label: keyof typeof actionMap, page: Page) {
  console.log(`starting ${label}`);
  const promise = new Promise(($resolve) => { resolve = $resolve; });
  await actionMap[label](page);
  await promise;
  resolve = null!;
  console.log(`finished ${label}`);
}
describe('benchmark', function () {

  async function setup(browserType: 'chromium' | 'firefox' | 'webkit', measurement: Record<string, number>) {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseUrl);
    await page.waitForSelector('app div.grid');
    page.on('console', logMeasurement(measurement));
    return { page, browser };
  }

  // testName -> label -> measurement
  const measurements: Record<string, Record<string, number>> = Object.create(null);
  after(function () {
    console.log(measurements);
  });

  for (const browserType of browserTypes) {
    describe(browserType, function () {
      it('hundred -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function (this: Context) {
        const measurement = measurements[this.test!.fullTitle()] = Object.create(null);
        const { page, browser } = await setup(browserType, measurement);

        await actAndMeasure('hundred', page);

        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle localize-date', page);
        await actAndMeasure('toggle localize-date', page);

        await actAndMeasure('filter employed', page);
        await actAndMeasure('filter unemployed', page);
        await actAndMeasure('no filter', page);

        await actAndMeasure('delete first', page);
        await actAndMeasure('delete all', page);

        await browser.close();
      });

      it('thousand -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function (this: Context) {
        const measurement = measurements[this.test!.fullTitle()] = Object.create(null);
        const { page, browser } = await setup(browserType, measurement);

        await actAndMeasure('thousand', page);

        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle localize-date', page);
        await actAndMeasure('toggle localize-date', page);

        await actAndMeasure('filter employed', page);
        await actAndMeasure('filter unemployed', page);
        await actAndMeasure('no filter', page);

        await actAndMeasure('delete first', page);
        await actAndMeasure('delete all', page);

        await browser.close();
      });

      /* because FF stalls for such long running actions, and fails. Although it seems to be deactivated: https://github.com/microsoft/playwright/blob/e72d9a4185e80b6c1245713e8b3dd5e613f145d0/browser_patches/firefox/preferences/playwright.cfg#L161-L163 */
      // if (browserType === 'firefox') { return; }

      it.only('ten-thousand -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function (this: Context) {
        const measurement = measurements[this.test!.fullTitle()] = Object.create(null);
        const { page, browser } = await setup(browserType, measurement);

        await actAndMeasure('ten-thousand', page);

        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle details', page);
        await actAndMeasure('toggle localize-date', page);
        await actAndMeasure('toggle localize-date', page);

        await actAndMeasure('filter employed', page);
        await actAndMeasure('filter unemployed', page);
        await actAndMeasure('no filter', page);

        await actAndMeasure('delete first', page);
        await actAndMeasure('delete all', page);

        await browser.close();
      });
    });
  }
});

