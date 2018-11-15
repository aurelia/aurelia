import lerna from 'lerna';
import { getCurrentVersion, getNewVersion, updateDependencyVersions } from './bump-version';
import { createLogger } from './logger';

const log = createLogger('publish');

function parseArgs(): {tag: string} {
  const args = process.argv.slice(2);
  const tag = args[0];
  log(args.join(' '));
  return { tag };
}

async function run(): Promise<void> {
  const { tag } = parseArgs();
  const { major, minor, patch } = getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag);
  if (tag === 'dev') {
    await updateDependencyVersions(newVersion);
  }
  lerna(['publish', newVersion, '--npm-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '-y']);
}

run().then(() => {
  log(`Done.`);
});
