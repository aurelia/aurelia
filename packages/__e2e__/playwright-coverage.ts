import { test } from '@playwright/test';
import fs from 'fs';
import { resolve } from 'path';
import v8toIstanbul from 'v8-to-istanbul';
import istanbul from 'istanbul-lib-coverage';

function getExitingCoverage(cwd) {
  const coverageFolder = resolve(cwd, 'coverage');
  if (!fs.existsSync(coverageFolder)) {
    fs.mkdirSync(coverageFolder);
  }
  const coverageFile = resolve(coverageFolder, `coverage-final-e2e.json`);
  if (fs.existsSync(coverageFile)) {
    return fs.readFileSync(coverageFile, { encoding: 'utf-8' });
  }
  return '';
}

export function addCoverage() {
  const cwd = process.cwd();
  const coverages = istanbul.createCoverageMap({});

  test.beforeEach(async ({ page }) => {
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {
    const coverage = await page.coverage.stopJSCoverage();
    for (const entry of coverage) {
      // console.log(entry.url.includes(cwd));
      console.log(entry.url);
      if (!entry.url.includes(cwd) || /* !entry.url.includes('/@fs/') || */ !entry.url.includes('/packages/')) {
        continue;
      }
      const scriptPath = entry.url.replace(/^.*@fs\//, '');
      const converter = v8toIstanbul(scriptPath, 0, { source: entry.source! });
      // eslint-disable-next-line no-await-in-loop
      await converter.load();
      converter.applyCoverage(entry.functions);
      const istanbulCoverage = converter.toIstanbul();

      coverages.merge(istanbulCoverage);
    }
  });

  test.afterAll(() => {
    const existingCoverage = getExitingCoverage(process.cwd());
    if (existingCoverage) {
      coverages.merge(JSON.parse(existingCoverage));
    }
    fs.writeFileSync(resolve(process.cwd(), `coverage/coverage-final.json`), JSON.stringify(coverages.toJSON()), { encoding: 'utf-8' });
  });
}
