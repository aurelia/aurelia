/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { strict as assert } from 'assert';
import { performance } from 'perf_hooks';
import type { ElementHandle, Page } from 'playwright';
import * as playwright from 'playwright';
import { URL } from 'url';
import { Measurement, Measurements, browserTypes, WritableMeasurementKeys, BrowserType } from './shared';

// This is fixed and needs to be kept in sync with the apps.
const gridColCount = 6;
declare const $$framework: string;
declare const $$frameworkVersion: string;
declare const $$port: string;
declare const $$iterations: number;
declare const $$measurements: Measurement[];

describe('benchmark', function () {

  async function setup(browserType: BrowserType, initialPopulation = 0) {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const url = new URL('http://localhost');
    url.port = $$port;
    url.searchParams.set('initialPopulation', initialPopulation.toString());

    const start = performance.now();
    await page.goto(url.toString());
    await page.waitForFunction((config) => {
      const [population, numCol] = config.split('_');
      const grid = document.querySelector<HTMLDivElement>('app div.grid');
      return grid?.childElementCount === (Number(population) + 1) * Number(numCol);
    }, `${initialPopulation}_${gridColCount}`);
    const durationLoad = performance.now() - start;
    return { page, browser, durationLoad };
  }

  async function runCommonSequence(page: playwright.Page, measurement: Measurement) {
    await new UpdateEvery10thRow(page, measurement).run();
    await new ToggleDetails(page, measurement).run();
    await new ToggleLocale(page, measurement).run();
    await new FirstNameSort(page, measurement).run();
    await new LastNameSort(page, measurement).run();
    await new DobSort(page, measurement).run();
    await new Filter(page, measurement).run();
    await new SelectFirst(page, measurement).run();
    await new DeleteFirst(page, measurement).run();
    await new DeleteAll(page, measurement).run();
  }

  const measurements: Measurements = new Measurements();
  after(function () {
    $$measurements.push(...measurements.means);
  });

  for (const browserType of browserTypes) {
    describe(browserType, function () {
      for (let i = 0; i < $$iterations; i++) {
        describe(`iteration-#${i}`, function () {
          for (const initialPopulation of [0, 100]) {
            it(`hundred - initial population: ${initialPopulation}`, async function () {
              const { page, browser, durationLoad } = await setup(browserType, initialPopulation);
              const measurement = new Measurement($$framework, $$frameworkVersion, browserType, browser.version(), initialPopulation, 100);
              measurement.durationInitialLoad = durationLoad;
              measurements.push(measurement);

              if (initialPopulation === 0) {
                await new PopulateHundred(page, measurement).run();
              }
              await runCommonSequence(page, measurement);

              await browser.close();
            });
          }

          for (const initialPopulation of [0, 1_000]) {
            it(`thousand - initial population: ${initialPopulation}`, async function () {
              const { page, browser, durationLoad } = await setup(browserType, initialPopulation);
              const measurement = new Measurement($$framework, $$frameworkVersion, browserType, browser.version(), initialPopulation, 1_000);
              measurement.durationInitialLoad = durationLoad;
              measurements.push(measurement);

              if (initialPopulation === 0) {
                await new PopulateThousand(page, measurement).run();
              }
              await runCommonSequence(page, measurement);

              await browser.close();
            });
          }

          for (const initialPopulation of [0, 10_000]) {
            it.skip(`ten-thousand - initial population: ${initialPopulation}`, async function () {
              const { page, browser, durationLoad } = await setup(browserType, initialPopulation);
              const measurement = new Measurement($$framework, $$frameworkVersion, browserType, browser.version(), initialPopulation, 10_000);
              measurement.durationInitialLoad = durationLoad;
              measurements.push(measurement);

              if (initialPopulation === 0) {
                await new PopulateTenThousand(page, measurement).run();
              }
              await runCommonSequence(page, measurement);

              await browser.close();
            });
          }
        });
      }
    });
  }
});

abstract class BaseActMeasureAssert<TPreState = unknown> {
  public abstract measurementKey: WritableMeasurementKeys;
  public constructor(
    public readonly label: string,
    public readonly selector: string,
    public readonly page: Page,
    public readonly measurement: Measurement,
  ) { }

  // Act, measures, and asserts
  public async run() {
    const label = this.label;
    console.log(`starting ${label}`);

    const preState = await this.getPreRunState();

    await this.actAndMeasure(this.measurementKey);

    await this.assert(preState);
    console.log(`finished ${label}`);
  }

  protected abstract getPreRunState(): Promise<TPreState>;
  protected abstract assert(preState: TPreState): Promise<void>;

  protected async actAndMeasure(key: WritableMeasurementKeys, $selector = this.selector) {
    this.measurement[key] = await this.page.evaluate(async (selector: string) => {
      const start = globalThis.performance.now();
      document.querySelector<HTMLElement>(selector)!.click();
      await (globalThis as any).waitForIdle();
      return globalThis.performance.now() - start;
    }, $selector);
  }

  public async getGridContent(): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    // get the content without the header
    return (await this.page.$$('div.grid>*')).slice(gridColCount);
  }
}

abstract class BaseMultiStateActMeasureAssert<
  TStates extends readonly string[] = readonly string[],
  TPreState = unknown
  > extends BaseActMeasureAssert<TPreState> {

  public measurementKey!: WritableMeasurementKeys;
  public abstract stateNames: TStates;
  private _currentState!: TStates[number];

  public constructor(
    label: string,
    selector: string,
    page: Page,
    measurement: Measurement,
  ) {
    super(label, selector, page, measurement);
  }
  public get currentState() { return this._currentState; }

  public async run() {
    /* eslint-disable no-await-in-loop */
    for (const state of this.stateNames) {
      this._currentState = state;
      const label = `${this.label} - ${state}`;

      console.log(`starting ${label}`);

      const preState = await this.getPreRunState();

      await this.actAndMeasure(this.getMeasurementKey());

      await this.assert(preState);
      console.log(`finished ${label}`);
    }
    /* eslint-enable no-await-in-loop */
  }

  protected abstract getMeasurementKey(): WritableMeasurementKeys;
}

class Populate extends BaseActMeasureAssert {
  public measurementKey: WritableMeasurementKeys = 'durationPopulation';
  public constructor(
    selector: string,
    page: Page,
    measurement: Measurement,
    public readonly population: number,
  ) {
    super(`populate ${population}`, selector, page, measurement);
  }

  protected async getPreRunState(): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    return this.getGridContent();
  }

  protected async assert(preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const currentRowCount = (await this.getGridContent()).length / gridColCount;
    const previousRowCount = preState.length / gridColCount;

    if (previousRowCount > this.population) {
      assert.strictEqual(currentRowCount, previousRowCount, 'invariant row count');
    } else {
      assert.strictEqual(currentRowCount, this.population, 'exact row count');
    }
  }
}

class PopulateHundred extends Populate {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('button#hundred', page, measurement, 100);
  }
}

class PopulateThousand extends Populate {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('button#thousand', page, measurement, 1_000);
  }
}

class PopulateTenThousand extends Populate {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('button#ten-thousand', page, measurement, 10_000);
  }
}

class DeleteFirst extends BaseActMeasureAssert {
  public measurementKey: WritableMeasurementKeys = 'durationDeleteFirst';
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('delete first', 'span.delete', page, measurement);
  }

  protected async getPreRunState(): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    return this.getGridContent();
  }

  protected async assert(preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const currentRowCount = (await this.getGridContent()).length / gridColCount;
    const previousRowCount = preState.length / gridColCount;
    assert.strictEqual(currentRowCount, previousRowCount - 1, 'delete-first');
  }
}

class DeleteAll extends BaseActMeasureAssert {
  public measurementKey: WritableMeasurementKeys = 'durationDeleteAll';
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('delete all', 'button#remove-all', page, measurement);
  }

  protected async getPreRunState(): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    return this.getGridContent();
  }

  protected async assert(_preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const currentRowCount = (await this.getGridContent()).length / gridColCount;
    assert.strictEqual(currentRowCount, 0, 'delete-all');
  }
}

class ToggleDetails extends BaseMultiStateActMeasureAssert<readonly ['show', 'hide']> {
  public stateNames = ['show', 'hide'] as const;
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('toggle details', 'button#details', page, measurement);
  }

  protected getPreRunState(): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    return this.page.$$('div.grid>address-viewer');
  }

  protected async assert(_preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const page = this.page;
    switch (this.currentState) {
      case 'show': {
        assert.strictEqual((await page.$$('div.grid>address-viewer>div')).length > 0, true, 'show div');
        assert.strictEqual((await page.$$('div.grid>address-viewer>ul')).length, 0, 'no ul');
        break;
      }
      case 'hide': {
        assert.strictEqual((await page.$$('div.grid>address-viewer>ul')).length > 0, true, 'show ul');
        assert.strictEqual((await page.$$('div.grid>address-viewer>div')).length, 0, 'no div');
        break;
      }
    }
  }

  protected getMeasurementKey(): WritableMeasurementKeys {
    switch (this.currentState) {
      case 'show':
        return 'durationShowDetails';
      case 'hide':
        return 'durationHideDetails';
    }
  }
}

class ToggleLocale extends BaseMultiStateActMeasureAssert<readonly ['de', 'en']> {
  public stateNames = ['de', 'en'] as const;
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('toggle localize-date', 'button#locale', page, measurement);
  }

  protected getPreRunState(): Promise<undefined> {
    return undefined!;
  }

  protected async assert(_preState: undefined): Promise<void> {
    const page = this.page;
    const dates = await Promise.all((await page.$$('div.grid>span:nth-child(6n+3)')).map((el) => el.textContent()));
    // rudimentary date validation, as the main objective is to assert the locale specific artifacts
    switch (this.currentState) {
      case 'de':
        assert.strictEqual(dates.every((d) => /[0-3]?[0-9]\.[0-1]?[0-9]\.\d{4}/.test(d!)), true, 'localize date - de');
        break;
      case 'en':
        assert.strictEqual(dates.every((d) => /[0-1]?[0-9]\/[0-3]?[0-9]\/\d{4}/.test(d!)), true, 'localize date - en');
        break;
    }
  }

  protected getMeasurementKey(): WritableMeasurementKeys {
    switch (this.currentState) {
      case 'de':
        return 'durationLocaleDe';
      case 'en':
        return 'durationLocaleEn';
    }
  }
}

class Filter extends BaseActMeasureAssert {
  public measurementKey!: WritableMeasurementKeys;
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('', '', page, measurement);
  }

  public async run() {
    const selector = 'div.grid>span:nth-child(6n+4)';
    const page = this.page;

    // #region filter - employed
    let label = 'filter - employed';
    console.log(`starting ${label}`);

    let previous = await page.$$(selector);
    const all = previous;

    await this.actAndMeasure('durationFilterEmployed', 'button#employed');

    let current = await page.$$(selector);

    assert.strictEqual(current.length <= all.length, true, `${label} - count`);
    assert.strictEqual((await Promise.all(current.map((e) => e.textContent()))).every((t) => !!t), true, `${label} - content`);
    console.log(`finished ${label}`);
    // #endregion

    // #region filter - unemployed
    label = 'filter - unemployed';
    console.log(`starting ${label}`);

    await this.actAndMeasure('durationFilterUnemployed', 'button#unemployed');

    current = await page.$$(selector);

    assert.notEqual(current.length <= all.length, `${label} - count`);
    assert.strictEqual((await Promise.all(current.map((e) => e.textContent()))).every((t) => !t), true, `${label} - content`);
    console.log(`finished ${label}`);
    // #endregion

    // #region filter - no
    label = 'filter - no';
    console.log(`starting ${label}`);

    previous = current;

    await this.actAndMeasure('durationFilterNone', 'button#all');

    current = await page.$$(selector);

    assert.notEqual(current.length >= previous.length, `${label} - count`);
    assert.deepStrictEqual(
      await Promise.all(current.map((e) => e.textContent())),
      await Promise.all(all.map((e) => e.textContent())),
      `${label} - content`
    );
    console.log(`finished ${label}`);
    // #endregion
  }

  protected getPreRunState(): Promise<undefined> {
    return undefined!;
  }

  protected async assert(_preState: undefined): Promise<void> {
    return undefined!;
  }
}

abstract class Sort extends BaseMultiStateActMeasureAssert<readonly ['asc', 'desc']> {
  public stateNames = ['asc', 'desc'] as const;
  public constructor(
    label: string,
    selector: string,
    page: Page,
    measurement: Measurement,
    public readonly colSelector: string,
  ) {
    super(label, selector, page, measurement);
  }

  protected getPreRunState(): Promise<(string | null)[]> {
    return this.getColContent();
  }

  protected async assert(_preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const content = await this.getColContent();
    let direction: number;
    switch (this.currentState) {
      case 'asc':
        direction = 1;
        break;
      case 'desc':
        direction = -1;
        break;
    }

    const sorted = content.slice(0).sort((a, b) => direction * a!.localeCompare(b!));
    assert.deepStrictEqual(content, sorted, `${this.label} ${this.currentState} - content`);
  }

  protected async getColContent() {
    return Promise.all((await this.page.$$(this.colSelector)).map((i) => i.textContent()));
  }
}

class FirstNameSort extends Sort {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('sort by firstName', 'div.grid>strong:nth-of-type(1)', page, measurement, 'div.grid>span:nth-child(6n+1)');
  }

  protected getMeasurementKey(): WritableMeasurementKeys {
    switch (this.currentState) {
      case 'asc':
        return 'durationSortFirstName';
      case 'desc':
        return 'durationSortFirstNameDesc';
    }
  }
}

class LastNameSort extends Sort {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('sort by lastName', 'div.grid>strong:nth-of-type(2)', page, measurement, 'div.grid>span:nth-child(6n+2)');
  }

  protected getMeasurementKey(): WritableMeasurementKeys {
    switch (this.currentState) {
      case 'asc':
        return 'durationSortLastName';
      case 'desc':
        return 'durationSortLastNameDesc';
    }
  }
}

class DobSort extends Sort {
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('sort by dob', 'div.grid>strong:nth-of-type(3)', page, measurement, 'div.grid>span:nth-child(6n+3)');
  }

  protected async assert(_preState: ElementHandle<SVGElement | HTMLElement>[]): Promise<void> {
    const content = (await this.getColContent()).map((dateStr) => {
      const [mm, dd, yyyy] = dateStr!.split('/');
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    });
    let direction: number;
    switch (this.currentState) {
      case 'asc':
        direction = 1;
        break;
      case 'desc':
        direction = -1;
        break;
    }

    const sorted = content.slice(0).sort((a, b) => direction * (a.getTime() - b.getTime()));
    assert.deepStrictEqual(content, sorted, `${this.label} ${this.currentState} - content`);
  }

  protected getMeasurementKey(): WritableMeasurementKeys {
    switch (this.currentState) {
      case 'asc':
        return 'durationSortDob';
      case 'desc':
        return 'durationSortDobDesc';
    }
  }
}

class SelectFirst extends BaseActMeasureAssert {
  public measurementKey: WritableMeasurementKeys = 'durationSelectFirst';
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('select first', 'div.grid>span.selection-target', page, measurement);
  }
  protected async getPreRunState(): Promise<void> {
    assert.deepStrictEqual(
      await this.getInfo(),
      [
        ['false', 'rgba(0, 0, 0, 0)'],
        ['rgba(0, 0, 0, 0)'],
      ]
    );
  }

  protected async assert(): Promise<void> {
    assert.deepStrictEqual(
      await this.getInfo(),
      [
        ['true', 'rgb(153, 153, 153)'],
        ['rgb(153, 153, 153)'],
      ]
    );
  }

  private async getInfo() {
    return this.page.evaluate(() => {
      const cell1 = document.querySelector<HTMLSpanElement>('div.grid>span.selection-target')!;
      const cell2 = cell1.nextElementSibling! as HTMLSpanElement;
      return [
        [cell1.dataset['selected'], getComputedStyle(cell1).backgroundColor],
        [getComputedStyle(cell2).backgroundColor],
      ] as const;
    });
  }
}

class UpdateEvery10thRow extends BaseActMeasureAssert {
  public measurementKey: WritableMeasurementKeys = 'durationUpdate';
  public constructor(
    page: Page,
    measurement: Measurement,
  ) {
    super('update every 10th row', 'button#update-10', page, measurement);
  }
  protected async getPreRunState(): Promise<(string | null)[]> {
    return this.getFirstNameCol();
  }

  protected async assert(preState: (string | null)[]): Promise<void> {
    const current = await this.getFirstNameCol();
    for (let i = 0, ii = current.length; i < ii; i += 10) {
      assert.strictEqual(current[i], `${preState[i]} !!!`, `content ${i}`);
    }
  }

  private async getFirstNameCol() {
    return Promise.all((await this.page.$$('div.grid>span:nth-child(6n+1)')).map((el) => el.textContent()));
  }
}
