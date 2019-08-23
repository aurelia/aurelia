import lerna from 'lerna';
import { getCurrentVersion, getNewVersion } from './get-version-info';
import { createLogger } from './logger';

const log = createLogger('publish');

function parseArgs(): {tag: string; suffix: string; registry: string} {
  const args = process.argv.slice(2);
  const tag = args[0];
  const suffix = args[1] || '';
  const registry = args[2] || 'https://registry.npmjs.org/';
  log(args.join(' '));
  return { tag, suffix, registry };
}

(async function (): Promise<void> {
  const { tag, suffix, registry } = parseArgs();
  const { major, minor, patch } = getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag, 'none', suffix);
  await lerna(['publish', newVersion, '--dist-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '--registry', registry, '-y']);
  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});
