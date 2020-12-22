import { File } from './files';
import { createLogger } from './logger';
import project from './project';

const log = createLogger('change-tsconfigs');

(async function (): Promise<void> {
  const [, , operation] = process.argv;

  const packages = project.packages;
  const tsconfigFiles = packages
    .filter(pkg => !pkg.name.kebab.includes('_') && pkg.folder.includes('packages'))
    .map(pkg => new File(pkg.tsconfig));

  for (const file of tsconfigFiles) {
    const backupPath = file.path.replace('.json', '.json.bak');

    switch (operation) {
      case 'invert': {
        await file.readContent();

        log(`backing up tsconfig: ${backupPath}`);
        await file.saveAs(backupPath);

        const json = JSON.parse(file.content.toString('utf8'));
        switch (json.compilerOptions.outDir) {
          case 'dist/esm':
            json.compilerOptions.outDir = 'dist/cjs';
            json.compilerOptions.module = 'commonjs';
            break;
          case 'dist/cjs':
            json.compilerOptions.outDir = 'dist/esm';
            json.compilerOptions.module = 'esnext';
            break;
        }

        log(`overwriting tsconfig: ${file.path}`);

        await file.overwrite(Buffer.from(JSON.stringify(json, null, 2)));

        break;
      }
      case 'restore': {
        log(`restoring tsconfig: ${file.path} from backup: ${backupPath} and removing backup`);

        await file.restore(backupPath);

        break;
      }
    }
  }

  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});
