"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const fs = require("fs");
const path = require("path");
const options_js_1 = require("./options.js");
const preprocess_html_template_js_1 = require("./preprocess-html-template.js");
const preprocess_resource_js_1 = require("./preprocess-resource.js");
function preprocess(unit, options, _fileExists = fileExists) {
    const ext = path.extname(unit.path);
    const basename = path.basename(unit.path, ext);
    const allOptions = options_js_1.preprocessOptions(options);
    const base = unit.base || '';
    if (allOptions.templateExtensions.includes(ext)) {
        const possibleFilePair = allOptions.cssExtensions.map(e => path.join(base, unit.path.slice(0, -ext.length) + e));
        const filePair = possibleFilePair.find(_fileExists);
        if (filePair) {
            if (allOptions.useProcessedFilePairFilename) {
                unit.filePair = `${basename}.css`;
            }
            else {
                unit.filePair = path.basename(filePair);
            }
        }
        return preprocess_html_template_js_1.preprocessHtmlTemplate(unit, allOptions);
    }
    else if (allOptions.jsExtensions.includes(ext)) {
        const possibleFilePair = allOptions.templateExtensions.map(e => path.join(base, unit.path.slice(0, -ext.length) + e));
        const filePair = possibleFilePair.find(_fileExists);
        if (filePair) {
            if (allOptions.useProcessedFilePairFilename) {
                unit.filePair = `${basename}.html`;
            }
            else {
                unit.filePair = path.basename(filePair);
            }
        }
        else {
            // Try foo.js and foo-view.html convention.
            // This convention is handled by @view(), not @customElement().
            const possibleViewPair = allOptions.templateExtensions.map(e => path.join(base, `${unit.path.slice(0, -ext.length)}-view${e}`));
            const viewPair = possibleViewPair.find(_fileExists);
            if (viewPair) {
                if (allOptions.useProcessedFilePairFilename) {
                    unit.filePair = `${basename}-view.html`;
                }
                else {
                    unit.filePair = path.basename(viewPair);
                }
            }
        }
        return preprocess_resource_js_1.preprocessResource(unit, allOptions);
    }
}
exports.preprocess = preprocess;
function fileExists(p) {
    try {
        const stats = fs.statSync(p);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=preprocess.js.map