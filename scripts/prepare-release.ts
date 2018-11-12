import { updateDependencyVersions } from './bump-version';
import { generateChangeLog } from './generate-changelog';
import { createLogger } from './logger';
import project from './project';

const log = createLogger('prepare-release');

async function run(): Promise<void> {
  const newVersion = await generateChangeLog(`v${project.lerna.version}`, 'HEAD');
  await updateDependencyVersions(newVersion);
}

run().then(() => {
  log(`Done.`);
});
