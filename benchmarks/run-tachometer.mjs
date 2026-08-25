/* eslint-disable */
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import fs from 'fs';
import path from 'path';
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
import { formatCompactSummary } from './benchmark-summary.mjs';

const npmCache = path.resolve('.tmp/npm-cache');
process.env.npm_config_cache = npmCache;
process.env.NPM_CONFIG_CACHE = npmCache;
fs.mkdirSync(npmCache, { recursive: true });

async function main(argv) {
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

  const servers = new Map();
  const promises = [];

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

  if (config.mode === 'manual') {
    await manualMode(config, servers);
    return;
  }

  const runner = new Runner(config, servers);
  try {
    const results = await runner.run();
    const summary = formatCompactSummary(results);
    if (summary !== '') {
      console.log('\nCompact summary');
      console.log();
      console.log(summary);
    }
    return results;
  } finally {
    const allServers = new Set([...servers.values()]);
    await Promise.all([...allServers].map((server) => server.close()));
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
