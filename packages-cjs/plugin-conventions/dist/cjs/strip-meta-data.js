"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripMetaData = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const parse5_1 = require("parse5");
function stripMetaData(rawHtml) {
    const deps = [];
    let shadowMode = null;
    let containerless = false;
    let hasSlot = false;
    const bindables = {};
    const aliases = [];
    const toRemove = [];
    const tree = parse5_1.parseFragment(rawHtml, { sourceCodeLocationInfo: true });
    traverse(tree, node => {
        stripImport(node, (dep, ranges) => {
            if (dep)
                deps.push(dep);
            toRemove.push(...ranges);
        });
        stripUseShadowDom(node, (mode, ranges) => {
            if (mode)
                shadowMode = mode;
            toRemove.push(...ranges);
        });
        stripContainerlesss(node, ranges => {
            containerless = true;
            toRemove.push(...ranges);
        });
        stripBindable(node, (bs, ranges) => {
            Object.assign(bindables, bs);
            toRemove.push(...ranges);
        });
        stripAlias(node, (aliasArray, ranges) => {
            aliases.push(...aliasArray);
            toRemove.push(...ranges);
        });
        if (node.tagName === 'slot') {
            hasSlot = true;
        }
    });
    let html = '';
    let lastIdx = 0;
    toRemove.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
        html += rawHtml.slice(lastIdx, start);
        lastIdx = end;
    });
    html += rawHtml.slice(lastIdx);
    return { html, deps, shadowMode, containerless, hasSlot, bindables, aliases };
}
exports.stripMetaData = stripMetaData;
function traverse(tree, cb) {
    tree.childNodes.forEach((n) => {
        const ne = n;
        // skip <template as-custom-element="..">
        if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) {
            return;
        }
        cb(ne);
        if (n.childNodes)
            traverse(n, cb);
        // For <template> tag
        if (n.content && n.content.childNodes)
            traverse(n.content, cb);
    });
}
function stripTag(node, tagNames, cb) {
    if (!Array.isArray(tagNames))
        tagNames = [tagNames];
    if (tagNames.includes(node.tagName)) {
        const attrs = {};
        node.attrs.forEach(attr => attrs[attr.name] = attr.value);
        const loc = node.sourceCodeLocation;
        const toRemove = [];
        if (loc.endTag) {
            toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
        }
        toRemove.push([loc.startTag.startOffset, loc.startTag.endOffset]);
        cb(attrs, toRemove);
        return true;
    }
    return false;
}
function stripAttribute(node, tagName, attributeName, cb) {
    if (node.tagName === tagName) {
        const attr = node.attrs.find(a => a.name === attributeName);
        if (attr) {
            const loc = node.sourceCodeLocation;
            cb(attr.value, [[loc.attrs[attributeName].startOffset, loc.attrs[attributeName].endOffset]]);
            return true;
        }
    }
    return false;
}
// <import from="./foo">
// <require from="./foo">
// <import from="./foo"></import>
// <require from="./foo"></require>
function stripImport(node, cb) {
    return stripTag(node, ['import', 'require'], (attrs, ranges) => {
        cb(attrs.from, ranges);
    });
}
// <use-shadow-dom>
// <use-shadow-dom></use-shadow-dom>
// <use-shadow-dom mode="open">
// <use-shadow-dom mode="closed"></use-shadow-dom>
// <template use-shadow-dom>
// <template use-shadow-dom="open">
function stripUseShadowDom(node, cb) {
    let mode = 'open';
    return stripTag(node, 'use-shadow-dom', (attrs, ranges) => {
        if (attrs.mode === 'closed')
            mode = 'closed';
        cb(mode, ranges);
    }) || stripAttribute(node, 'template', 'use-shadow-dom', (value, ranges) => {
        if (value === 'closed')
            mode = 'closed';
        cb(mode, ranges);
    });
}
// <containerless>
// <containerless></containerless>
// <template containerless>
function stripContainerlesss(node, cb) {
    return stripTag(node, 'containerless', (attrs, ranges) => {
        cb(ranges);
    }) || stripAttribute(node, 'template', 'containerless', (value, ranges) => {
        cb(ranges);
    });
}
// <alias name="firstName">
// <alias name="firstName, lastName></alias>
// <template alias="firstName">
// <template alias="firstName,lastName">
function stripAlias(node, cb) {
    return stripTag(node, 'alias', (attrs, ranges) => {
        const { name } = attrs;
        let aliases = [];
        if (name) {
            aliases = name.split(',').map(s => s.trim()).filter(s => s);
        }
        cb(aliases, ranges);
    }) || stripAttribute(node, 'template', 'alias', (value, ranges) => {
        const aliases = value.split(',').map(s => s.trim()).filter(s => s);
        cb(aliases, ranges);
    });
}
// <bindable name="firstName">
// <bindable name="lastName" attribute="surname" mode="two-way"></bindable>
// <bindable name="lastName" attribute="surname" mode="TwoWay"></bindable>
// <template bindable="firstName">
// <template bindable="firstName,lastName">
// <template bindable="firstName,
//                     lastName">
function stripBindable(node, cb) {
    return stripTag(node, 'bindable', (attrs, ranges) => {
        const { name, mode, attribute } = attrs;
        const bindables = {};
        if (name) {
            const description = {};
            if (attribute)
                description.attribute = attribute;
            const bindingMode = toBindingMode(mode);
            if (bindingMode)
                description.mode = bindingMode;
            bindables[name] = description;
        }
        cb(bindables, ranges);
    }) || stripAttribute(node, 'template', 'bindable', (value, ranges) => {
        const bindables = {};
        const names = value.split(',').map(s => s.trim()).filter(s => s);
        names.forEach(name => bindables[name] = {});
        cb(bindables, ranges);
    });
}
function toBindingMode(mode) {
    if (mode) {
        const normalizedMode = kernel_1.kebabCase(mode);
        if (normalizedMode === 'one-time')
            return runtime_1.BindingMode.oneTime;
        if (normalizedMode === 'one-way' || normalizedMode === 'to-view')
            return runtime_1.BindingMode.toView;
        if (normalizedMode === 'from-view')
            return runtime_1.BindingMode.fromView;
        if (normalizedMode === 'two-way')
            return runtime_1.BindingMode.twoWay;
    }
}
//# sourceMappingURL=strip-meta-data.js.map