import { kebabCase } from '@aurelia/kernel';
import modifyCode from 'modify-code';
import * as path from 'path';
import { fileBase } from './file-base';
import { stripHtmlImport } from './strip-html-import';

export function preprocessHtmlTemplate(filePath: string, rawHtml: string, ts: boolean = false) {
  const { html, deps } = stripHtmlImport(rawHtml);

  const viewDeps: string[] = [];
  const importStatements: string[] = [];

  deps.forEach((d, i) => {
    const ext = path.extname(d);
    let importStatement: string;

    if (isCss(ext)) {
      importStatement = `import ${s(d)};\n`;
    } else if (ext === '.html') {
      importStatement = `import * as h${i} from ${s(d)};\n`;
      importStatement += `const d${i} = h${i}.getHTMLOnlyElement();\n`;
      viewDeps.push(`d${i}`);
    } else {
      importStatement = `import * as d${i} from ${s(d)};\n`;
      viewDeps.push(`d${i}`);
    }

    importStatements.push(importStatement);
  });

  const name = kebabCase(fileBase(filePath));
  const m = modifyCode('', filePath);
  m.append("import { CustomElement } from '@aurelia/runtime';\n");
  importStatements.forEach(s => m.append(s));
  m.append(`export const name = ${s(name)};
export const template = ${s(html)};
export default template;
export const dependencies${ts ? ': any[]' : ''} = [ ${viewDeps.join(', ')} ];
let _e${ts ? ': any' : ''};
export function getHTMLOnlyElement()${ts ? ': any' : ''} {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
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
