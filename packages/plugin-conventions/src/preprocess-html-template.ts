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
  let { html, shadowMode, deps } = stripMetaData(rawHtml);

  if (defaultShadowOptions && !shadowMode) {
    shadowMode = defaultShadowOptions.mode;
  }

  const viewDeps: string[] = [];
  const importStatements: string[] = [];
  let registrationImported = false;

  deps.forEach((d, i) => {
    const ext = path.extname(d);

    if (isCss(ext)) {
      if (shadowMode) {
        if (!registrationImported) {
          importStatements.push(`import { Registration } from '@aurelia/kernel';\n`);
          registrationImported = true;
        }
        const stringModuleId = stringModuleWrap ? stringModuleWrap(d) : d;
        importStatements.push(`import d${i} from ${s(stringModuleId)};\n`);
        viewDeps.push(`Registration.defer('.css', d${i})`);
      } else {
        importStatements.push(`import ${s(d)};\n`);
      }
    } else if (ext === '.html') {
      importStatements.push(`import * as h${i} from ${s(d)};\nconst d${i} = h${i}.getHTMLOnlyElement();\n`);
      viewDeps.push(`d${i}`);
    } else {
      importStatements.push(`import * as d${i} from ${s(d)};\n`);
      viewDeps.push(`d${i}`);
    }
  });

  const name = kebabCase(fileBase(filePath));
  const m = modifyCode('', filePath);
  m.append("import { CustomElement } from '@aurelia/runtime';\n");
  importStatements.forEach(s => m.append(s));
  m.append(`export const name = ${s(name)};
export const template = ${s(html)};
export default template;
export const dependencies = [ ${viewDeps.join(', ')} ];
`);

  if (shadowMode) {
    m.append(`export const shadowOptions = { mode: '${shadowMode}' };\n`);
  }

  m.append(`let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies${shadowMode ? ', shadowOptions' : ''} });
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
