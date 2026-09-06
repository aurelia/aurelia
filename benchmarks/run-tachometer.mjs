/* eslint-disable */
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { parseFlags } from 'tachometer/lib/flags.js';
import { makeConfig } from 'tachometer/lib/config.js';
import { Server } from 'tachometer/lib/server.js';
import {
  installGitDependency,
  makeServerPlans,
  prepareVersionDirectory,
} from 'tachometer/lib/versions.js';
import { manualMode } from 'tachometer/lib/manual.js';
import { Runner } from 'tachometer/lib/runner.js';
import { browserSignature, makeDriver } from 'tachometer/lib/browser.js';
import { formatCompactSummary } from './benchmark-summary.mjs';

export async function runTachometer(argv, { signal } = {}, createDriver = makeDriver) {
  signal?.throwIfAborted();
  const npmCache = path.resolve('.tmp/npm-cache');
  process.env.npm_config_cache = npmCache;
  process.env.NPM_CONFIG_CACHE = npmCache;
  fs.mkdirSync(npmCache, { recursive: true });

  const opts = parseFlags(argv);
  const config = await makeConfig(opts);

  if (config.legacyJsonFile) {
    console.log('Please use --json-file instead of --save. --save will be removed in the next major version.');
  }

  const { plans, gitInstalls } = await makeServerPlans(
    config.root,
    opts['npm-install-dir'],
    config.benchmarks,
  );

  await Promise.all(
    gitInstalls.map((gitInstall) => installGitDependency(gitInstall, config.forceCleanNpmInstall)),
  );
  signal?.throwIfAborted();

  const servers = new Map();
  const promises = [];
  let runner;
  const closeBrowsers = () => runner?.closeBrowsers();
  signal?.addEventListener('abort', closeBrowsers, { once: true });

  try {
    for (const { npmInstalls, mountPoints, specs } of plans) {
      promises.push(
        ...npmInstalls.map((install) => prepareVersionDirectory(
          install,
          config.forceCleanNpmInstall,
          config.npmrc,
        )),
      );

      promises.push((async () => {
        const server = await Server.start({
          host: opts.host,
          ports: opts.port,
          root: config.root,
          npmInstalls,
          mountPoints,
          resolveBareModules: config.resolveBareModules,
          cache: config.mode !== 'manual',
        });

        for (const spec of specs) {
          servers.set(spec, server);
        }
      })());
    }

    await Promise.all(promises);
    signal?.throwIfAborted();
    if (config.mode === 'manual') {
      await manualMode(config, servers);
      signal?.throwIfAborted();
      // Tachometer's manual mode starts its polling loops and returns. Keep
      // their servers alive until this invocation is interrupted.
      await new Promise(resolve => signal?.addEventListener('abort', resolve, { once: true }));
      return;
    }

    runner = new ManagedRunner(config, servers, signal, createDriver);
    const results = await runner.run();
    signal?.throwIfAborted();
    const summary = formatCompactSummary(results);
    if (summary !== '') {
      console.log('\nCompact summary');
      console.log();
      console.log(summary);
    }
    return results;
  } finally {
    signal?.removeEventListener('abort', closeBrowsers);
    await runner?.closeBrowsers();
    // A failed install/start must not let another in-flight startup escape cleanup.
    await Promise.allSettled(promises);
    const allServers = new Set([...servers.values()]);
    await Promise.all([...allServers].map((server) => server.close()));
  }
}

// Tachometer 0.7.1 leaves sessions open on failure and closes only the last tab
// on success. Own that lifetime here; inherited sampling, ordering, and statistics
// stay untouched. Cancellation checks run in Node, outside the measured page.
// Remove these overrides when upstream owns cancellation and always quits its sessions.
class ManagedRunner extends Runner {
  constructor(config, servers, signal, createDriver) {
    super(config, servers);
    this.signal = signal;
    this.createDriver = createDriver;
    this.quitting = [];
  }

  async launchBrowsers() {
    for (const { browser } of this.specs) {
      this.signal?.throwIfAborted();
      const signature = browserSignature(browser);
      if (this.browsers.has(signature)) continue;
      this.bar.tick(0, { status: `launching ${browser.name}` });
      const driver = await this.createDriver(browser);
      const session = { name: browser.name, driver };
      // Register before the next await so cancellation or tab-discovery failure
      // still disposes a newly acquired driver. Keep Tachometer's blank-tab model.
      this.browsers.set(signature, session);
      this.signal?.throwIfAborted();
      session.initialTabHandle = (await driver.getAllWindowHandles())[0];
    }
  }

  async closeBrowsers() {
    for (const { driver } of this.browsers.values()) {
      this.quitting.push(driver.quit().catch(() => void 0));
    }
    this.browsers.clear();
    await Promise.all(this.quitting);
  }

  async takeSamples(...args) {
    this.signal?.throwIfAborted();
    const result = await super.takeSamples(...args);
    this.signal?.throwIfAborted();
    return result;
  }
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  runTachometer(process.argv.slice(2), { signal: controller.signal }).catch((error) => {
    if (controller.signal.aborted) {
      process.exitCode = 130;
    } else {
      console.error(error);
      process.exitCode = 1;
    }
  }).finally(() => {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  });
}
