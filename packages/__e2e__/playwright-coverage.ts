import { test } from '@playwright/test';
import fs from 'fs';
import { sep as separator, posix, resolve } from 'path';
import v8toIstanbul from 'v8-to-istanbul';
import istanbul from 'istanbul-lib-coverage';

const coverageFileName = 'coverage-final.json';

function getExitingCoverage(cwd: string) {
  const coverageFolder = resolve(cwd, 'coverage');
  if (!fs.existsSync(coverageFolder)) {
    fs.mkdirSync(coverageFolder);
  }
  const coverageFile = resolve(coverageFolder, coverageFileName);
  if (fs.existsSync(coverageFile)) {
    return fs.readFileSync(coverageFile, { encoding: 'utf-8' });
  }
  return '';
}

export function addCoverage() {
  const projectRoot = resolve(__dirname, '../../').split(separator).join(posix.sep);
  const coverages = istanbul.createCoverageMap({});

  test.beforeEach(async ({ page }) => {
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {
    const coverage = await page.coverage.stopJSCoverage();
    for (const entry of coverage) {
      if (!entry.url.includes(projectRoot) || /* !entry.url.includes('/@fs/') || */ !entry.url.includes('/packages/')) {
        continue;
      }
      // vite paths look like this:
      // win: localhost:9001/@fs/C:/....
      // nix: localhost:9001/@fs/home
      // doing a replacement of /@fs is not enough,
      // and it's not safe to just assume that it's /@fs/[A-Z]:/ (is it?)
      // so going around a bit

      const rootIndex = entry.url.indexOf(projectRoot);
      const scriptPath = `../../../${entry.url.slice(rootIndex).replace(projectRoot, '').replace(/^\//, '')}`;
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
    fs.writeFileSync(resolve(process.cwd(), `coverage/${coverageFileName}`), JSON.stringify(coverages.toJSON()), { encoding: 'utf-8' });
  });
}
