import * as path from 'path';
import { type ModifyCodeResult } from 'modify-code';
import { IFileUnit, IPreprocessOptions } from './options';
import { stripMetaData } from './strip-meta-data';
import { resourceName } from './resource-name';
import { fileExists } from './file-exists';
import { modifyCode } from './modify-code';

// stringModuleWrap is to deal with pure css text module import in shadowDOM mode.
// For webpack:
//   import d0 from '!!raw-loader!./foo.css';
// For dumber/requirejs:
//   import d0 from 'text!./foo.css';
// We cannot use
//   import d0 from './foo.css';
// because most bundler by default will inject that css into HTML head.
export function preprocessHtmlTemplate(
  unit: IFileUnit,
  options: IPreprocessOptions,
  hasViewModel?: boolean,
  _fileExists = fileExists,
): ModifyCodeResult {
  const name = resourceName(unit.path);
  const stripped = stripMetaData(unit.contents);
  const { html, deps, depsAliases, containerless, hasSlot, bindables, aliases, capture } = stripped;
  let { shadowMode } = stripped;

  if (unit.filePair) {
    const basename = path.basename(unit.filePair, path.extname(unit.filePair));
    if (!deps.some(dep => options.cssExtensions.some(e => dep === `./${basename}${e}`))) {
      // implicit dep ./foo.css for foo.html
      deps.unshift(`./${unit.filePair}`);
    }
  }

  if (options.defaultShadowOptions && shadowMode === null) {
    shadowMode = options.defaultShadowOptions.mode;
  }

  const useCSSModule = shadowMode !== null ? false : options.useCSSModule;

  const viewDeps: string[] = [];
  const cssDeps: string[] = [];
  const statements: string[] = [];
  let registrationImported = false;
  let aliasedModule = 0;

  if (shadowMode === null && hasSlot) {
    // todo: what here? need to combine information with custom element before warning/throwing
  }

  deps.forEach((d, i) => {
    const aliases = depsAliases[d] ?? {};
    let ext = path.extname(d);

    if (!ext) {
      // When possible, fill up explicit file extension.
      // Parcel requires this to work.
      // https://github.com/aurelia/aurelia/issues/1657
      if (_fileExists(unit, `${d}.ts`)) {
        ext = '.ts';
      } else if (_fileExists(unit, `${d}.js`)) {
        ext = '.js';
      }
      d = d + ext;
    }

    // All known resource types
    if (!ext || ext === '.js' || ext === '.ts') {
      const { __MAIN__: main, ...others } = aliases;
      const hasAliases = main != null || Object.keys(others).length > 0;
      if (hasAliases && aliasedModule++ === 0) {
        statements.push(`import { aliasedResourcesRegistry as $$arr } from '@aurelia/kernel';\n`);
      }
      statements.push(`import * as d${i} from ${s(d)};\n`);
      if (hasAliases) {
        viewDeps.push(`$$arr(d${i}, ${s(main)}${Object.keys(others).length > 0 ? `, ${s(others)}` : ''})`);
      } else {
        viewDeps.push(`d${i}`);
      }
      return;
    }

    // <import from="some.html">
    if (options.templateExtensions.includes(ext)) {
      const { __MAIN__: main } = aliases;
      const hasAliases = main != null;
      if (hasAliases && aliasedModule++ === 0) {
        statements.push(`import { aliasedResourcesRegistry as $$arr } from '@aurelia/kernel';\n`);
        statements.push(`function __get_el__(m) { let e; m.register({ register(el) { e = el; } }); return { default: e }; }\n`);
      }
      statements.push(`import * as d${i} from ${s((options.transformHtmlImportSpecifier ?? (s => s))(d))};\n`);

      if (hasAliases) {
        viewDeps.push(`$$arr(__get_el__(d${i}), ${s(main)})`);
      } else {
        viewDeps.push(`d${i}`);
      }
      return;
    }

    // CSS resource
    if (options.cssExtensions.includes(ext)) {
      if (shadowMode !== null) {
        const stringModuleId = options.stringModuleWrap ? options.stringModuleWrap(d) : d;
        statements.push(`import d${i} from ${s(stringModuleId)};\n`);
        cssDeps.push(`d${i}`);
      } else if (useCSSModule) {
        statements.push(`import d${i} from ${s(d)};\n`);
        cssDeps.push(`d${i}`);
      } else {
        // Rely on bundler to inject CSS.
        statements.push(`import ${s(d)};\n`);
      }
      return;
    }

    // Wrap all other unknown resources in defer.
    if (!registrationImported) {
      statements.push(`import { Registration } from '@aurelia/kernel';\n`);
      registrationImported = true;
    }
    statements.push(`import d${i} from ${s(d)};\n`);
    viewDeps.push(`Registration.defer('${ext}', d${i})`);
  });

  const m = modifyCode('', unit.path);
  const hmrEnabled = !hasViewModel && options.hmr && process.env.NODE_ENV !== 'production';
  m.append(`import { CustomElement } from '@aurelia/runtime-html';\n`);
  if (cssDeps.length > 0) {
    if (shadowMode !== null) {
      m.append(`import { shadowCSS } from '@aurelia/runtime-html';\n`);
      viewDeps.push(`shadowCSS(${cssDeps.join(', ')})`);
    } else if (useCSSModule) {
      m.append(`import { cssModules } from '@aurelia/runtime-html';\n`);
      viewDeps.push(`cssModules(${cssDeps.join(', ')})`);
    }
  }
  statements.forEach(st => m.append(st));
  m.append(`export const name = ${s(name)};
export const template = ${s(html)};
export default template;
export const dependencies = [ ${viewDeps.join(', ')} ];
`);

  if (shadowMode !== null) {
    m.append(`export const shadowOptions = { mode: '${shadowMode}' };\n`);
  }

  if (containerless) {
    m.append(`export const containerless = true;\n`);
  }

  if (capture) {
    m.append(`export const capture = true;\n`);
  }

  if (Object.keys(bindables).length > 0) {
    m.append(`export const bindables = ${JSON.stringify(bindables)};\n`);
  }

  if (aliases.length > 0) {
    m.append(`export const aliases = ${JSON.stringify(aliases)};\n`);
  }

  const definitionProperties = [
    'name',
    'template',
    'dependencies',
    shadowMode !== null ? 'shadowOptions' : '',
    containerless ? 'containerless' : '',
    capture ? 'capture' : '',
    Object.keys(bindables).length > 0 ? 'bindables' : '',
    aliases.length > 0 ? 'aliases' : '',
  ].filter(Boolean);
  const definition = `{ ${definitionProperties.join(', ')} }`;

  if (hmrEnabled) {
    m.append(`const _e = CustomElement.define(${definition});
      export function register(container) {
        container.register(_e);
      }`);
  } else {
    m.append(`let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define(${definition});
  }
  container.register(_e);
}
`);
  }

  if (hmrEnabled && options.getHmrCode) {
    m.append(options.getHmrCode('_e', options.hmrModule));
  }

  const { code, map } = m.transform();
  map.sourcesContent = [unit.contents];
  return { code, map };
}

function s(input: unknown) {
  return JSON.stringify(input);
}

