import { createLogger } from './logger';
import { updateDependencyVersions } from './bump-version';
import { generateChangeLog } from './generate-changelog';
import project from './project';

const log = createLogger('prepare-release');

async function run() {
  const newVersion = await generateChangeLog(`v${project.lerna.version}`, 'HEAD');
  await updateDependencyVersions(newVersion);
}

run().then(() => {
  log(`Done.`);
});
