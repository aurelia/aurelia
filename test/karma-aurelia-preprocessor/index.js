/* eslint-disable */

function createAureliaPreprocessor(karmaConfig, logger) {
  const basePath = karmaConfig.basePath;
  const log = logger.create('preprocessor:aurelia');
  const ts = require('typescript');
  const path = require('path');

  return function preprocess(content, file, next) {
    log.debug(`Preprocessing '${file.path.replace(basePath, '')}' (type: '${file.type}')`);

    const sourceFile = ts.createSourceFile(file.path, content, ts.ScriptTarget.ESNext, false, ts.ScriptKind.JS);

    const statements = sourceFile.statements.reverse();
    for (const statement of statements) {
      switch (statement.kind) {
        case ts.SyntaxKind.ImportDeclaration:
        case ts.SyntaxKind.ExportDeclaration: {
          if (typeof statement.moduleSpecifier?.text === 'string') {
            const specifier = statement.moduleSpecifier.text;
            if (!specifier.endsWith('.js')) {
              const start = statement.moduleSpecifier.getStart(sourceFile);
              const end = statement.moduleSpecifier.getEnd(sourceFile);

              let newSpecifier = specifier;
              if (specifier.startsWith('@aurelia/')) {
                const packageName = specifier.slice(9 /* '@aurelia/'.length */);
                const packageEntryFilePath = path.join(basePath, `base/packages/${packageName}/dist/esnext/index.js`);
                newSpecifier = path.relative(file.path, packageEntryFilePath).replace(/\\/g, '/');
              } else {
                switch (specifier) {
                  case 'i18next': {
                    newSpecifier = path.join(basePath, 'node_modules/i18next/dist/esm/index.js');
                    break;
                  }
                  default: {
                    log.error(`ERROR: unrecognized specifier '${specifier}' in file '${file.path}'. Make sure to include the .js extension in imports/exports, and add external dependencies to karma-aurelia-preprocessor`);
                    process.exit(1);
                  }
                }
              }

              log.debug(`- Replacing ${ts.SyntaxKind[statement.kind]} '${specifier}' with '${newSpecifier}'`);

              content = `${content.slice(0, start + 1)}${newSpecifier}${content.slice(end - 1)}`;
            }
          }
        }
        break;
      }
    }

    next(content);
  };
}
createAureliaPreprocessor.$inject = ['config', 'logger'];

module.exports = {
  'preprocessor:aurelia': ['factory', createAureliaPreprocessor],
};
