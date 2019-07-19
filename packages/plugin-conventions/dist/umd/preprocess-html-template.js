(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "modify-code", "./file-base", "./strip-html-import"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const modify_code_1 = require("modify-code");
    const file_base_1 = require("./file-base");
    const strip_html_import_1 = require("./strip-html-import");
    function preprocessHtmlTemplate(filePath, rawHtml, ts = false) {
        const { html, deps } = strip_html_import_1.stripHtmlImport(rawHtml);
        const viewDeps = [];
        const importStatements = [];
        deps.forEach((d, i) => {
            const ext = extname(d);
            let importStatement;
            if (isCss(ext)) {
                importStatement = `import ${s(d)};\n`;
            }
            else if (ext === '.html') {
                importStatement = `import * as h${i} from ${s(d)};\n`;
                importStatement += `const d${i} = h${i}.getHTMLOnlyElement();\n`;
                viewDeps.push(`d${i}`);
            }
            else {
                importStatement = `import * as d${i} from ${s(d)};\n`;
                viewDeps.push(`d${i}`);
            }
            importStatements.push(importStatement);
        });
        const name = kernel_1.kebabCase(file_base_1.fileBase(filePath));
        const m = modify_code_1.default('', filePath);
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
        map.sourcesContent = [rawHtml];
        return { code, map };
    }
    exports.preprocessHtmlTemplate = preprocessHtmlTemplate;
    function s(str) {
        return JSON.stringify(str);
    }
    function extname(filePath) {
        const idx = filePath.lastIndexOf('.');
        if (idx !== -1)
            return filePath.slice(idx);
        return '';
    }
    const CSS_EXTS = ['.css', '.sass', '.scss', '.less', '.styl'];
    function isCss(ext) {
        return CSS_EXTS.includes(ext);
    }
});
//# sourceMappingURL=preprocess-html-template.js.map