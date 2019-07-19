(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "parse5"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const parse5_1 = require("parse5");
    function stripHtmlImport(rawHtml) {
        const deps = [];
        const toRemove = [];
        const tree = parse5_1.parseFragment(rawHtml, { sourceCodeLocationInfo: true });
        traverse(tree, node => {
            if (node.tagName !== 'import' && node.tagName !== 'require') {
                return;
            }
            const attr = node.attrs.find(a => a.name === 'from');
            if (attr && attr.value)
                deps.push(attr.value);
            const loc = node.sourceCodeLocation;
            if (loc.endTag) {
                toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
            }
            if (loc.startTag) {
                toRemove.push([loc.startTag.startOffset, loc.startTag.endOffset]);
            }
        });
        let html = '';
        let lastIdx = 0;
        toRemove.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
            html += rawHtml.slice(lastIdx, start);
            lastIdx = end;
        });
        html += rawHtml.slice(lastIdx);
        return { html, deps };
    }
    exports.stripHtmlImport = stripHtmlImport;
    function traverse(tree, cb) {
        tree.childNodes.forEach((n) => {
            cb(n);
            if (n.childNodes)
                traverse(n, cb);
            // For <template> tag
            if (n.content && n.content.childNodes)
                traverse(n.content, cb);
        });
    }
});
//# sourceMappingURL=strip-html-import.js.map