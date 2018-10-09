import lerna from 'lerna';
import { createLogger, c } from './logger';
import { getCurrentVersion, getNewVersion, updateDependencyVersions } from './bump-version';

const log = createLogger('publish');

function parseArgs() {
  const args = process.argv.slice(2);
  const tag = args[0];
  log(args.join(' '));
  return { tag };
}

async function run() {
  const { tag } = parseArgs();
  const { major, minor, patch } = await getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag);
  if (tag === 'dev') {
    await updateDependencyVersions(newVersion);
  }
  lerna(['publish', newVersion, '--npm-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '-y']);
}

run().then(() => {
  log(`Done.`);
});
