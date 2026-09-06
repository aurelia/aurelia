import { createServer } from 'node:http';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Builder } from 'selenium-webdriver';
// Selenium's CommonJS package requires this explicit extension under Node ESM.
// eslint-disable-next-line import/extensions
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';
import { isPathInside } from './variant-utils.mjs';
import { summarizeCpuProfile } from './live-profile-utils.mjs';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

export async function captureLiveProfile({ benchmarkRoot, fixture, mode, iterations, outputRoot }) {
  await access(chromedriver.path).catch(() => {
    throw new Error(
      `ChromeDriver executable was not found at ${chromedriver.path}. `
      + 'Install a driver compatible with the local Chrome build or copy it to that location.',
    );
  });
  await mkdir(outputRoot, { recursive: true });

  const server = createStaticServer(benchmarkRoot);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('Unable to determine profile server port.');

  const options = new chrome.Options()
    .addArguments(
      '--headless',
      '--window-size=1024,768',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    );
  const service = new chrome.ServiceBuilder(chromedriver.path);
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  const started = new Date().toISOString();
  const statusPath = path.join(outputRoot, 'status.json');
  await writeJson(statusPath, { state: 'running', mode, iterations, started });

  try {
    await driver.manage().setTimeouts({ pageLoad: 60_000, script: 180_000 });
    const parameters = new URLSearchParams({ mode, iterations: String(iterations) });
    const pageUrl = `http://127.0.0.1:${address.port}/${fixture}/profile.html?${parameters}`;
    await driver.get(pageUrl);
    await driver.wait(
      () => driver.executeScript('return window.__aureliaProfile?.ready === true;'),
      60_000,
      'Timed out waiting for the live profile workload to become ready.',
    );

    await driver.sendDevToolsCommand('Profiler.enable');
    await driver.sendDevToolsCommand('Profiler.setSamplingInterval', { interval: 500 });
    await driver.sendDevToolsCommand('Profiler.start');
    const workload = await driver.executeAsyncScript(`
      const done = arguments[arguments.length - 1];
      window.__aureliaProfile.run().then(
        result => done({ ok: true, result }),
        error => done({ ok: false, error: error?.stack ?? String(error) }),
      );
    `);
    const stopped = normalizeDevToolsResult(await driver.sendAndGetDevToolsCommand('Profiler.stop'));
    if (workload?.ok !== true) throw new Error(`Profile workload failed: ${workload?.error ?? 'unknown error'}`);
    await driver.executeScript('return window.__aureliaProfile.validate();');

    const profile = stopped.profile;
    const frameworkUrlFragment = `/live-results/profile/${fixture}/app.js`;
    const summary = {
      generatedAt: new Date().toISOString(),
      mode,
      iterations,
      workload: workload.result,
      ...summarizeCpuProfile(profile, frameworkUrlFragment),
    };
    const profilePath = path.join(outputRoot, `${mode}-latest.cpuprofile`);
    const summaryPath = path.join(outputRoot, `${mode}-summary-latest.json`);
    await Promise.all([
      writeJsonAtomic(profilePath, profile),
      writeJsonAtomic(summaryPath, summary),
    ]);
    await writeJson(statusPath, {
      state: 'complete',
      mode,
      iterations,
      started,
      completed: new Date().toISOString(),
      profilePath,
      summaryPath,
    });
    return { profilePath, summaryPath, summary };
  } catch (error) {
    await writeJson(statusPath, { state: 'failed', mode, iterations, started, error: String(error) });
    throw error;
  } finally {
    await driver.quit().catch(() => void 0);
    await new Promise(resolve => server.close(resolve));
  }
}

function createStaticServer(root) {
  return createServer((request, response) => void serveStaticFile(root, request, response));
}

async function serveStaticFile(root, request, response) {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost');
    const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+|\/+$/gu, '');
    const file = path.resolve(root, relativePath);
    if (!isPathInside(root, file)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, {
      'content-type': contentTypes.get(path.extname(file)) ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    response.end(contents);
  } catch {
    response.writeHead(404).end('Not found');
  }
}

function normalizeDevToolsResult(result) {
  return typeof result === 'string' ? JSON.parse(result) : result;
}

async function writeJsonAtomic(file, value) {
  const next = `${file}.next`;
  await writeJson(next, value);
  await rename(next, file);
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
