/* eslint-disable */
// convert all import paths into relative paths so it works natively in the browser
// example:
// import {} from '@aurelia/kernel'
// ->
// import {} from '../../kernel/dist/esm/index.js'
// this works with CDN well, though it wouldn't have the proper sourcemap
// todo: consider make this step part of the rollup build
// ------------------------
import * as ts from 'typescript';
import { getFiles } from './files';
import { createLogger } from './logger';
import project from './project';
import * as path from 'path';
import * as fs from 'fs';

const log = createLogger('generate-native-modules');

(async function (): Promise<void> {
  const packages = project.packages.filter(pkg => !pkg.name.kebab.includes('_') && pkg.folder.includes('packages') && !pkg.folder.includes('packages-cjs'));

  for (const pkg of packages) {
    const distPath = path.join(pkg.path, 'dist');
    const esmPath = path.join(distPath, 'esm');
    const nativeModulesPath = path.join(distPath, 'native-modules');

    log.info(`Processing '${esmPath}'`);
    const files = await getFiles(esmPath);
    for (const file of files) {
      log.info(`Processing '${file.path.replace(project.path, '')}'`);

      await file.readContent();
      let content = file.content.toString('utf8');
      const sourceFile = ts.createSourceFile(file.path, content, ts.ScriptTarget.ESNext, false, ts.ScriptKind.JS);

      const statements = (sourceFile.statements as unknown as any[] /* TODO(fkleuver): make this type-safe again */).reverse();
      for (const statement of statements) {
        switch (statement.kind) {
          case ts.SyntaxKind.ImportDeclaration:
          case ts.SyntaxKind.ExportDeclaration: {
            if (typeof statement.moduleSpecifier?.text === 'string') {
              const specifier = statement.moduleSpecifier.text;
              if (specifier.startsWith('@aurelia')) {
                const start = statement.moduleSpecifier.getStart(sourceFile);
                const end = statement.moduleSpecifier.getEnd(sourceFile);

                const packageName = specifier.slice(9 /* '@aurelia/'.length */);
                const packageEntryFilePath = path.join(project.path, `node_modules/@aurelia/${packageName}/dist/native-modules/index.js`);
                const normPath = file.path.replace(/\\/g, '/');
                const origin = pkg.name.npm.includes('@aurelia')
                  ? normPath.replace(/packages[\\\/]([\w-]+)/, 'node_modules/@aurelia/$1')
                  : normPath.replace(/packages[\\\/]([\w-]+)/, 'node_modules/$1');
                const newSpecifier = path.relative(path.dirname(origin), packageEntryFilePath).replace(/\\/g, '/');

                log.info(`- Replacing ${ts.SyntaxKind[statement.kind]} '${specifier}' with '${newSpecifier}'`);

                content = `${content.slice(0, start + 1)}${newSpecifier}${content.slice(end - 1)}`;
              }
            }
          }
          break;
        }
      }

      const newPath = file.path.replace(esmPath, nativeModulesPath);
      log.info(`Writing processed file to '${newPath.replace(project.path, '')}'`);

      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      fs.writeFileSync(newPath, content);
    }

    log.info(`Done processing package ${pkg.name}\n================`);
  }

  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});
