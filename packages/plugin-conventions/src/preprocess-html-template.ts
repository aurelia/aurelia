import { kebabCase } from '@aurelia/kernel';
import modifyCode from 'modify-code';
import * as path from 'path';
import { fileBase } from './file-base';
import { stripMetaData } from './strip-meta-data';

// stringModuleWrap is to deal with pure css text module import in shadowDOM mode.
// For webpack:
//   import d0 from 'raw-loader!./foo.css';
// For dumber/requirejs:
//   import d0 from 'text!./foo.css';
// We cannot use
//   import d0 from './foo.css';
// because most bundler by default will inject that css into HTML head.
export function preprocessHtmlTemplate(filePath: string, rawHtml: string, defaultShadowOptions?: { mode: 'open' | 'closed' }, stringModuleWrap?: (id: string) => string) {
  const name = kebabCase(fileBase(filePath));
  let { html, deps, shadowMode, containerless, bindables } = stripMetaData(rawHtml);

  if (defaultShadowOptions && !shadowMode) {
    shadowMode = defaultShadowOptions.mode;
  }

  const viewDeps: string[] = [];
  const statements: string[] = [];
  let registrationImported = false;

  // Turn off ShadowDOM for invalid element
  if (!name.includes('-') && shadowMode) {
    shadowMode = null;
    const error = `WARN: ShadowDOM is disabled for ${filePath}. ShadowDOM requires element name to contain a dash (-), you have to refactor <${name}> to something like <lorem-${name}>.`;
    console.warn(error);
    statements.push(`console.warn(${JSON.stringify(error)});\n`);
  }

  deps.forEach((d, i) => {
    const ext = path.extname(d);
    if (ext === '.html') {
      statements.push(`import * as h${i} from ${s(d)};\nconst d${i} = h${i}.getHTMLOnlyElement();\n`);
      viewDeps.push(`d${i}`);
    } else if (ext && ext !== '.js' && ext !== '.ts') {
      // Wrap all other unknown resources (including .css, .scss) in defer.
      if (!registrationImported) {
        statements.push(`import { Registration } from '@aurelia/kernel';\n`);
        registrationImported = true;
      }
      const isCssResource = isCss(ext);
      const stringModuleId = isCssResource && shadowMode && stringModuleWrap ? stringModuleWrap(d) : d;
      statements.push(`import d${i} from ${s(stringModuleId)};\n`);
      viewDeps.push(`Registration.defer('${isCssResource ? '.css' : ext}', d${i})`);
    } else {
      statements.push(`import * as d${i} from ${s(d)};\n`);
      viewDeps.push(`d${i}`);
    }
  });

  const m = modifyCode('', filePath);
  m.append("import { CustomElement } from '@aurelia/runtime';\n");
  statements.forEach(s => m.append(s));
  m.append(`export const name = ${s(name)};
export const template = ${s(html)};
export default template;
export const dependencies = [ ${viewDeps.join(', ')} ];
`);

  if (shadowMode) {
    m.append(`export const shadowOptions = { mode: '${shadowMode}' };\n`);
  }

  if (containerless) {
    m.append(`export const containerless = true;\n`);
  }

  if (Object.keys(bindables).length) {
    m.append(`export const bindables = ${JSON.stringify(bindables)};\n`);
  }

  m.append(`let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies${shadowMode ? ', shadowOptions' : ''}${containerless ? ', containerless' : ''}${Object.keys(bindables).length ? ', bindables' : ''} });
  }
  return _e;
}
`);
  const { code, map } = m.transform();
  map.sourcesContent = [ rawHtml ];
  return { code, map };
}

function s(str: string) {
  return JSON.stringify(str);
}

const CSS_EXTS = ['.css', '.sass', '.scss', '.less', '.styl'];

function isCss(ext: string): boolean {
  return CSS_EXTS.includes(ext);
}
