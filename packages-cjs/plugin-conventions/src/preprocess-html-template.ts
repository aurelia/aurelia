import * as path from 'path';
import { kebabCase } from '@aurelia/kernel';
import modifyCode, { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IPreprocessOptions } from './options.js';
import { stripMetaData } from './strip-meta-data.js';

// stringModuleWrap is to deal with pure css text module import in shadowDOM mode.
// For webpack:
//   import d0 from '!!raw-loader!./foo.css';
// For dumber/requirejs:
//   import d0 from 'text!./foo.css';
// We cannot use
//   import d0 from './foo.css';
// because most bundler by default will inject that css into HTML head.
export function preprocessHtmlTemplate(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult {
  const name = kebabCase(path.basename(unit.path, path.extname(unit.path)));
  const stripped = stripMetaData(unit.contents);
  const { html, deps, containerless, hasSlot, bindables, aliases } = stripped;
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

  // Turn off ShadowDOM for invalid element
  if (!name.includes('-') && shadowMode !== null) {
    shadowMode = null;
    const error = `WARN: ShadowDOM is disabled for ${unit.path}. ShadowDOM requires element name to contain at least one dash (-), you have to refactor <${name}> to something like <lorem-${name}>.`;
    console.warn(error);
    statements.push(`console.warn(${JSON.stringify(error)});\n`);
  }

  if (shadowMode === null && hasSlot) {
    throw new Error(`<slot> cannot be used in ${unit.path}. <slot> is only available when using ShadowDOM. Please turn on ShadowDOM, or use <au-slot> in non-ShadowDOM mode. https://docs.aurelia.io/app-basics/components-revisited#au-slot`);
  }

  deps.forEach((d, i) => {
    const ext = path.extname(d);
    if (ext && ext !== '.js' && ext !== '.ts' && !options.templateExtensions.includes(ext)) {
      const isCssResource = options.cssExtensions.includes(ext);

      // Wrap all other unknown resources (including .css, .scss) in defer.
      if ((!isCssResource || (shadowMode === null && !useCSSModule)) && !registrationImported) {
        statements.push(`import { Registration } from '@aurelia/kernel';\n`);
        registrationImported = true;
      }

      let stringModuleId = d;

      if (isCssResource && shadowMode !== null && options.stringModuleWrap) {
        stringModuleId = options.stringModuleWrap(d);
      }

      statements.push(`import d${i} from ${s(stringModuleId)};\n`);

      if (isCssResource) {
        cssDeps.push(`d${i}`);
      } else {
        viewDeps.push(`Registration.defer('${ext}', d${i})`);
      }
    } else {
      statements.push(`import * as d${i} from ${s(d)};\n`);
      viewDeps.push(`d${i}`);
    }
  });

  const m = modifyCode('', unit.path);
  m.append(`import { CustomElement } from '@aurelia/runtime-html';\n`);
  if (cssDeps.length > 0) {
    if (shadowMode !== null) {
      m.append(`import { shadowCSS } from '@aurelia/runtime-html';\n`);
      viewDeps.push(`shadowCSS(${cssDeps.join(', ')})`);
    } else if (useCSSModule) {
      m.append(`import { cssModules } from '@aurelia/runtime-html';\n`);
      viewDeps.push(`cssModules(${cssDeps.join(', ')})`);
    } else {
      viewDeps.push(`Registration.defer('.css', ${cssDeps.join(', ')})`);
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

  if (Object.keys(bindables).length > 0) {
    m.append(`export const bindables = ${JSON.stringify(bindables)};\n`);
  }

  if (aliases.length > 0) {
    m.append(`export const aliases = ${JSON.stringify(aliases)};\n`);
  }

  m.append(`let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies${shadowMode !== null ? ', shadowOptions' : ''}${containerless ? ', containerless' : ''}${Object.keys(bindables).length > 0 ? ', bindables' : ''}${aliases.length > 0 ? ', aliases' : ''} });
  }
  container.register(_e);
}
`);
  const { code, map } = m.transform();
  map.sourcesContent = [unit.contents];
  return { code, map };
}

function s(str: string) {
  return JSON.stringify(str);
}
