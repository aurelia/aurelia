import { kebabCase, camelCase } from '@aurelia/kernel';
import modifyCode from 'modify-code';
import { fileBase } from './file-base';
import { stripHtmlImport } from './strip-html-import';

export function preprocessHtmlTemplate(filePath: string, rawHtml: string, ts: boolean = false) {
  const name = kebabCase(fileBase(filePath));

  const { html, deps } = stripHtmlImport(rawHtml);

  const viewDeps: string[] = [];
  const importStatements: string[] = [];

  deps.forEach((d, i) => {
    const ext = extname(d);
    let importStatement: string;

    if (isCss(ext)) {
      importStatement = `import ${s(d)};\n`;
    } else if (ext === '.html') {
      const elementName = kebabCase(fileBase(d));
      importStatement = `import * as h${i} from ${s(d)};\n`;
      importStatement += `const d${i} = h${i}.getHTMLOnlyElement();\n`;
      viewDeps.push(`d${i}`);
    } else {
      importStatement = `import * as d${i} from ${s(d)};\n`;
      viewDeps.push(`d${i}`);
    }

    importStatements.push(importStatement);
  });

  const m = modifyCode('', filePath);
  m.append("import { CustomElement } from '@aurelia/runtime';\n");
  importStatements.forEach(s => m.append(s));
  m.append(`export const name = ${s(name)};\n`);
  m.append(`export const template = ${s(html)};\n`);
  m.append('export default template;\n');
  m.append(`export const dependencies${ts ? ': any[]' : ''} = [ ${viewDeps.join(', ')} ];\n`);
  m.append(`let _htmlOnlyElement${ts ? ': any' : ''};
export function getHTMLOnlyElement()${ts ? ': any' : ''} {
  if (!_htmlOnlyElement) {
    _htmlOnlyElement = CustomElement.define({ name, template, dependencies });
  }
  return _htmlOnlyElement;
}
`);
  return m.transform();
}

function s(str: string) {
  return JSON.stringify(str);
}

function extname(filePath: string): string {
  const idx = filePath.lastIndexOf('.');
  if (idx !== -1) return filePath.slice(idx);
  return '';
}

const CSS_EXTS = ['.css', '.sass', '.scss', '.less', '.styl'];

function isCss(ext: string): boolean {
  return CSS_EXTS.includes(ext);
}
