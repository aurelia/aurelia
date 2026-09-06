import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Builder } from 'selenium-webdriver';
// Selenium's CommonJS package requires this explicit extension under Node ESM.
// eslint-disable-next-line import/extensions
import chrome from 'selenium-webdriver/chrome.js';
import { isPathInside } from './variant-utils.mjs';
import { summarizeCpuProfile } from './live-profile-utils.mjs';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

export async function captureLiveProfile(
  { benchmarkRoot, fixture, mode, iterations, outputRoot, metadata, signal },
  createDriver = options => new Builder().forBrowser('chrome').setChromeOptions(options).build(),
) {
  signal?.throwIfAborted();
  await mkdir(outputRoot, { recursive: true });
  const started = new Date().toISOString();
  const statusPath = path.join(outputRoot, 'status.json');
  await writeJson(statusPath, { state: 'running', mode, iterations, started, metadata });
  let driver;
  let server;
  let quitting;
  // A fixture edit or shutdown may arrive during a WebDriver command. Close the
  // session immediately; final cleanup awaits that same request instead of closing it twice.
  const quit = () => quitting ??= driver?.quit().catch(() => void 0);
  signal?.addEventListener('abort', quit, { once: true });

  try {
    // Use the same Selenium discovery as Tachometer. Repository installs omit
    // the npm package's driver download; CI and developers supply their own driver.
    driver = await createDriver(new chrome.Options().addArguments(
      '--headless',
      '--window-size=1024,768',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ));
    signal?.throwIfAborted();
    server = createStaticServer(benchmarkRoot);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (address === null || typeof address === 'string') throw new Error('Unable to determine profile server port.');

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
    const bundleUrlFragment = `/live-results/profile/${fixture}/app.js`;
    const summary = {
      generatedAt: new Date().toISOString(),
      mode,
      iterations,
      metadata,
      workload: workload.result,
      ...summarizeCpuProfile(profile, bundleUrlFragment),
    };
    const profilePath = path.join(outputRoot, `${mode}-latest.cpuprofile`);
    const summaryPath = path.join(outputRoot, `${mode}-summary-latest.json`);
    signal?.throwIfAborted();
    // Serialization and disk writes can outlive a fixture edit. Stage both files
    // before the last cancellation check so an obsolete capture keeps the previous result intact.
    await Promise.all([
      writeJson(`${profilePath}.next`, profile),
      writeJson(`${summaryPath}.next`, summary),
    ]);
    signal?.throwIfAborted();
    await Promise.all([
      rename(`${profilePath}.next`, profilePath),
      rename(`${summaryPath}.next`, summaryPath),
    ]);
    await writeJson(statusPath, {
      state: 'complete',
      mode,
      iterations,
      started,
      completed: new Date().toISOString(),
      profilePath,
      summaryPath,
      metadata,
    });
    return { profilePath, summaryPath, summary };
  } catch (error) {
    await writeJson(statusPath, {
      state: signal?.aborted === true ? 'cancelled' : 'failed',
      mode, iterations, started, metadata, error: String(error),
    });
    throw error;
  } finally {
    signal?.removeEventListener('abort', quit);
    await quit();
    if (server !== undefined) await new Promise(resolve => server.close(resolve));
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

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
