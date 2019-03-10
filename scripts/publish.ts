import lerna from 'lerna';
import { getCurrentVersion, getNewVersion } from './get-version-info';
import { createLogger } from './logger';

const log = createLogger('publish');

function parseArgs(): {tag: string; registry: string} {
  const args = process.argv.slice(2);
  const tag = args[0];
  const registry = args[1] || 'https://registry.npmjs.org/';
  log(args.join(' '));
  return { tag, registry };
}

async function run(): Promise<void> {
  const { tag, registry } = parseArgs();
  const { major, minor, patch } = getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag);
  lerna(['publish', newVersion, '--dist-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '--registry', registry, '-y']);
}

run().then(() => {
  log(`Done.`);
});
