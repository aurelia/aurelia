/* eslint-disable */

function createAureliaPreprocessor(karmaConfig, logger) {
  const basePath = karmaConfig.basePath;
  const log = logger.create('preprocessor:aurelia');
  const ts = require('typescript');
  const path = require('path');
  const fs = require('fs');
  const crypto = require('crypto');
  const { JSDOM } = require('jsdom');
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, { pretendToBeVisual: true });
  const w = jsdom.window;

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
            const ext = path.extname(specifier);

            switch (ext) {
              case '.html':
              case '.css': {
                const requestedFilePath = path.resolve(path.dirname(file.path), specifier).replace(/\\/g, '/').replace('/dist/esm/__tests__', '');

                log.debug(`Inlining content from import '${specifier}' (resolved: '${requestedFilePath}')`);

                const fileContent = fs.readFileSync(requestedFilePath, 'utf8');
                const start = statement.getStart(sourceFile);
                const end = statement.getEnd(sourceFile);

                if (typeof statement.importClause.name?.text === 'string') {
                  const identifier = statement.importClause.name.text;
                  const newDecl = `const ${identifier} = '${fileContent.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}';`;

                  content = `${content.slice(0, start)}${newDecl}${content.slice(end)}`;
                } else if (typeof statement.importClause.namedBindings?.name?.text === 'string' && ext === '.css') {
                  // css modules (quick / naive impl)
                  const identifier = statement.importClause.namedBindings.name.text;
                  const style = w.document.createElement('style');
                  style.innerHTML = fileContent;
                  w.document.head.append(style);
                  const transformedCssTexts = [];
                  const identMap = [];

                  const rules = w.document.styleSheets[0].cssRules;
                  for (let i = 0; i < rules.length; ++i) {
                    const rule = rules[i];
                    if (rule.selectorText.startsWith('.')) {
                      const hash = crypto.createHash('md5').update(`${file.path}${rule.selectorText}`).digest('hex');
                      const newSelectorText = `${rule.selectorText}__${hash}`;
                      identMap.push([rule.selectorText.slice(1), newSelectorText.slice(1)]);
                      rule.selectorText = newSelectorText;
                    }
                    transformedCssTexts.push(rule.cssText);
                  }

                  style.remove();
                  const newContent = transformedCssTexts.join(' ');

                  const identMapObjLiteral = `{${identMap.map(([from, to]) => `'${from}': '${to}'`).join(',')}}`;
                  const newDecl = `const ${identifier} = ${identMapObjLiteral}; (function () { const style = document.createElement('style'); style.innerHTML = '${newContent}'; document.head.append(style); })();`;

                  content = `${content.slice(0, start)}${newDecl}${content.slice(end)}`;
                } else {
                  log.error(`ERROR: invalid resource import '${statement.getText(sourceFile)}' in file '${file.path}'. Either remove the asterisk or make the appropriate changes to karma-aurelia-preprocessor`);
                  process.exit(1);
                }
              }
              case '.js':
                break;
              default: {
                const start = statement.moduleSpecifier.getStart(sourceFile);
                const end = statement.moduleSpecifier.getEnd(sourceFile);

                let newSpecifier = specifier;
                if (specifier === 'aurelia-direct-router') {
                  const packageEntryFilePath = path.join(basePath, `base/packages/router/dist/esm/index.js`);
                  newSpecifier = path.relative(file.path, packageEntryFilePath).replace(/\\/g, '/');
                } else if (specifier.startsWith('@aurelia/')) {
                  const packageName = specifier.slice(9 /* '@aurelia/'.length */);
                  const packageEntryFilePath = path.join(basePath, `base/node_modules/@aurelia/${packageName}/dist/esm/index.js`);
                  newSpecifier = path.relative(file.path, packageEntryFilePath).replace(/\\/g, '/');
                } else if (specifier.startsWith('@babel/')) {
                  const babelModulePath = specifier.slice(7 /* '@babel/runtime/'.length */);
                  const packageEntryFilePath = path.join(basePath, `base/node_modules/@babel/${babelModulePath}.js`,);
                  newSpecifier = path.relative(file.path, packageEntryFilePath).replace(/\\/g, '/');
                } else {
                  switch (specifier) {
                    case 'i18next': {
                      const i18nextPath = path.join(basePath, 'base/node_modules/i18next/dist/esm/i18next.js');
                      // newSpecifier = path.join(basePath, 'node_modules/i18next/dist/esm/index.js').replace(/\\/g, '/');
                      newSpecifier = path.relative(file.path, i18nextPath).replace(/\\/g, '/');
                      break;
                    }
                    case 'rxjs': {
                      const rxjsPath = path.join(basePath, '/base/node_modules/rxjs/_esm5/index.js');
                      newSpecifier = path.relative(file.path, rxjsPath).replace(/\\/g, '/');
                      break;
                    }
                    case 'rxjs/operators': {
                      const rxjsOperatorPath = path.join(basePath, '/base/node_modules/rxjs/_esm5/operators/index.js');
                      newSpecifier = path.relative(file.path, rxjsOperatorPath).replace(/\\/g, '/');
                      break;
                    }
                    case 'rxjs/operators/index.js': {
                      console.log(file.path)
                      throw new Error('not handled');
                    }
                    case 'tslib': {
                      const tslibPath = path.join(basePath, '/base/node_modules/tslib/tslib.es6.js');
                      newSpecifier = path.relative(file.path, tslibPath).replace(/\\/g, '/');
                      break;
                    }
                    default: {
                      if (file.path.includes('/node_modules/rxjs/_esm5/') && specifier.startsWith('.')) {
                        newSpecifier = specifier.replace(/(?:\.js)?$/, '.js');
                        break;
                      }
                      if (specifier.startsWith('rxjs-compat/')) {
                        newSpecifier = specifier.replace(/(?:\.js)?$/, '.js');
                        break;
                      }
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
        }
        break;
      }
    }

    if (karmaConfig.logLevel === karmaConfig.LOG_DEBUG) {
      // Write out the transformed content for easy local fs inspection
      fs.writeFileSync(`${file.path.replace(/\.js$/, '.$au.js')}`, content);
    }
    next(content);
  };
}
createAureliaPreprocessor.$inject = ['config', 'logger'];

module.exports = {
  'preprocessor:aurelia': ['factory', createAureliaPreprocessor],
};
