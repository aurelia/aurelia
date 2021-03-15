import { updateDependencyVersions } from './bump-version';
import { generateChangeLog } from './generate-changelog';
import { createLogger } from './logger';
import project from './project';

const log = createLogger('prepare-release');

(async function (): Promise<void> {
  let [, , newVersion] = process.argv;

  newVersion = await generateChangeLog(`v${project.pkg.version}`, 'HEAD', newVersion);
  await updateDependencyVersions(newVersion);
  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});
