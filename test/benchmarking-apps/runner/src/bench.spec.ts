/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as playwright from 'playwright';
import type { Page } from 'playwright';

const browserTypes = ['chromium', 'firefox', 'webkit'] as const;
const baseUrl = 'http://localhost:9000/';
const actionSelectorMap = {
  'toggle localize-date': 'button#locale',
  'toggle details': 'button#details',

  'hundred': 'button#hundred',
  'thousand': 'button#thousand',
  'ten-thousand': 'button#ten-thousand',

  'filter employed': 'button#employed',
  'filter unemployed': 'button#unemployed',
  'no filter': 'button#all',

  'delete first': 'span.delete',
  'delete all': 'button#remove-all',
};

async function actAndMeasure(
  label: keyof typeof actionSelectorMap,
  page: Page,
  measurement: Record<string, number>,
  additionalLabel: string = '',
) {
  const $label = `${label}${additionalLabel ? ` - ${additionalLabel}` : ''}`;
  console.log(`starting ${$label}`);
  measurement[$label] = await page.evaluate(async (selector: string) => {
    const start = performance.now();
    document.querySelector<HTMLElement>(selector)!.click();
    // await new Promise((resolve) => { setTimeout(resolve, 0); });
    await (globalThis as any).waitForIdle();
    return performance.now() - start;
  }, actionSelectorMap[label]);
  console.log(`finished ${$label}`);
}

describe('benchmark', function () {

  async function setup(browserType: 'chromium' | 'firefox' | 'webkit') {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseUrl);
    await page.waitForSelector('app div.grid');
    return { page, browser };
  }

  // browser+#records -> label -> measurement
  const measurements: Record<string, Record<string, number>> = Object.create(null);
  after(function () {
    console.table(measurements);
  });

  for (const browserType of browserTypes) {
    describe(browserType, function () {
      it('hundred -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function () {
        const measurement = measurements[`${browserType} - hundred`] = Object.create(null);
        const { page, browser } = await setup(browserType);

        await actAndMeasure('hundred', page, measurement);
        await actAndMeasure('toggle details', page, measurement, 'show');
        await actAndMeasure('toggle details', page, measurement, 'hide');
        await actAndMeasure('toggle localize-date', page, measurement, 'de');
        await actAndMeasure('toggle localize-date', page, measurement, 'en');
        await actAndMeasure('filter employed', page, measurement);
        await actAndMeasure('filter unemployed', page, measurement);
        await actAndMeasure('no filter', page, measurement);
        await actAndMeasure('delete first', page, measurement);
        await actAndMeasure('delete all', page, measurement);

        await browser.close();
      });

      it('thousand -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function () {
        const measurement = measurements[`${browserType} - thousand`] = Object.create(null);
        const { page, browser } = await setup(browserType);

        await actAndMeasure('thousand', page, measurement);
        await actAndMeasure('toggle details', page, measurement, 'show');
        await actAndMeasure('toggle details', page, measurement, 'hide');
        await actAndMeasure('toggle localize-date', page, measurement, 'de');
        await actAndMeasure('toggle localize-date', page, measurement, 'en');
        await actAndMeasure('filter employed', page, measurement);
        await actAndMeasure('filter unemployed', page, measurement);
        await actAndMeasure('no filter', page, measurement);
        await actAndMeasure('delete first', page, measurement);
        await actAndMeasure('delete all', page, measurement);

        await browser.close();
      });

      it.skip('ten-thousand -> show details -> hide details -> locale de -> locale en -> filter employed -> filter unemployed -> show all -> delete 1 -> delete all', async function () {
        const measurement = measurements[`${browserType} - ten-thousand`] = Object.create(null);
        const { page, browser } = await setup(browserType);

        await actAndMeasure('ten-thousand', page, measurement);
        await actAndMeasure('toggle details', page, measurement);
        await actAndMeasure('toggle details', page, measurement);
        await actAndMeasure('toggle localize-date', page, measurement);
        await actAndMeasure('toggle localize-date', page, measurement);
        await actAndMeasure('filter employed', page, measurement);
        await actAndMeasure('filter unemployed', page, measurement);
        await actAndMeasure('no filter', page, measurement);
        await actAndMeasure('delete first', page, measurement);
        await actAndMeasure('delete all', page, measurement);

        await browser.close();
      });
    });
  }
});

