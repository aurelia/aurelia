'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var path = require('path');
var modifyCode = require('modify-code');
var ts = require('typescript');
var runtime = require('@aurelia/runtime');
var parse5 = require('parse5');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var modifyCode__default = /*#__PURE__*/_interopDefaultLegacy(modifyCode);
var ts__namespace = /*#__PURE__*/_interopNamespace(ts);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);

function nameConvention(className) {
    const m = /^(.+?)(CustomElement|CustomAttribute|ValueConverter|BindingBehavior|BindingCommand|TemplateController)?$/.exec(className);
    if (!m) {
        throw new Error(`No convention found for class name ${className}`);
    }
    const bareName = m[1];
    const type = (m[2] ? kernel.camelCase(m[2]) : 'customElement');
    return {
        name: normalizedName(bareName, type),
        type
    };
}
function normalizedName(name, type) {
    if (type === 'valueConverter' || type === 'bindingBehavior') {
        return kernel.camelCase(name);
    }
    return kernel.kebabCase(name);
}

// a/foo-bar.xxx -> "foo-bar"
// a/fooBar.xxx -> "foo-bar"
// a/foo-bar/index.xxx -> "foo-bar"
// a/fooBar/index.xxx -> "foo-bar"
function resourceName(filePath) {
    const parsed = path__namespace.parse(filePath);
    const name = parsed.name === 'index' ? path__namespace.basename(parsed.dir) : parsed.name;
    return kernel.kebabCase(name);
}

/**
 * This is the minimum required runtime modules for HMR
 */
const hmrRuntimeModules = ['CustomElement', 'LifecycleFlags', 'IHydrationContext', 'Controller'];
/**
 * This is the minimum required metadata modules for HMR
 */
const hmrMetadataModules = ['Metadata'];
/**
 * This gets the generated HMR code for the specified class
 *
 * @param className - The name of the class to generate HMR code for
 * @param moduleText -  Usually module but Vite uses import instead
 * @param type - CustomElement | CustomAttribute
 * @returns Generated HMR code
 */
const getHmrCode = (className, moduleText = 'module') => {
    const code = `
    const controllers = [];

    // @ts-ignore
    if (${moduleText}.hot) {

    // @ts-ignore
    ${moduleText}.hot.accept();

    // @ts-ignore
    const hot = ${moduleText}.hot;

    let aurelia = hot.data?.aurelia;

    // @ts-ignore
    document.addEventListener('au-started', (event) => {aurelia= event.detail; });
    const currentClassType = ${className};

    // @ts-ignore
    const proto = ${className}.prototype

    // @ts-ignore
    const ogCreated = proto ? proto.created : undefined;

    if(proto){
      // @ts-ignore
      proto.created = (controller) => {
        ogCreated && ogCreated(controller);
        controllers.push(controller);
      }
    }

    hot.dispose(function (data) {
      data.controllers = controllers;
      data.aurelia = aurelia;
    });

    if (hot.data?.aurelia) {
      const newDefinition = CustomElement.getDefinition(currentClassType);
      Metadata.define(newDefinition.name, newDefinition, currentClassType);
      Metadata.define(newDefinition.name, newDefinition, newDefinition);
      hot.data.aurelia.container.res[CustomElement.keyFrom(newDefinition.name)] = newDefinition;

      const previousControllers = hot.data.controllers;
      if(previousControllers == null || previousControllers.length === 0) {
        hot.invalidate();
      }

      previousControllers.forEach(controller => {
        const values = { ...controller.viewModel };
        const hydrationContext = controller.container.get(IHydrationContext)
        const hydrationInst = hydrationContext.instruction;

        Object.keys(values).forEach(key => {
          if (!controller.bindings?.some(y => y.sourceExpression?.name === key && y.targetProperty)) {
            delete values[key];
          }
        });
        const h = controller.host;
        delete controller._compiledDef;
        controller.viewModel = new currentClassType();
        controller.definition = newDefinition;
        Object.assign(controller.viewModel, values);
        controller.hooks = new controller.hooks.constructor(controller.viewModel);
        controller._hydrateCustomElement(hydrationInst, hydrationContext);
        h.parentNode.replaceChild(controller.host, h);
        controller.hostController = null;
        controller.deactivate(controller, controller.parent ?? null, LifecycleFlags.none);
        controller.activate(controller, controller.parent ?? null, LifecycleFlags.none);
      });
    }
  }`;
    return code;
};

function preprocessResource(unit, options) {
    const expectedResourceName = resourceName(unit.path);
    const sf = ts__namespace.createSourceFile(unit.path, unit.contents, ts__namespace.ScriptTarget.Latest);
    let exportedClassName;
    let auImport = { names: [], start: 0, end: 0 };
    let runtimeImport = { names: [], start: 0, end: 0 };
    let metadataImport = { names: [], start: 0, end: 0 };
    let implicitElement;
    let customElementName; // for @customName('custom-name')
    // When there are multiple exported classes (e.g. local value converters),
    // they might be deps for composing the main implicit custom element.
    const localDeps = [];
    const conventionalDecorators = [];
    sf.statements.forEach(s => {
        // Find existing import Aurelia, {customElement, templateController} from 'aurelia';
        const au = captureImport(s, 'aurelia', unit.contents);
        if (au) {
            // Assumes only one import statement for @aurelia/runtime-html
            auImport = au;
            return;
        }
        // Find existing import {Metadata} from '@aurelia/metadata';
        const metadata = captureImport(s, '@aurelia/metadata', unit.contents);
        if (metadata) {
            // Assumes only one import statement for @aurelia/runtime-html
            metadataImport = metadata;
            return;
        }
        // Find existing import {customElement} from '@aurelia/runtime-html';
        const runtime = captureImport(s, '@aurelia/runtime-html', unit.contents);
        if (runtime) {
            // Assumes only one import statement for @aurelia/runtime-html
            runtimeImport = runtime;
            return;
        }
        // Only care about export class Foo {...}.
        // Note this convention simply doesn't work for
        //   class Foo {}
        //   export {Foo};
        const resource = findResource(s, expectedResourceName, unit.filePair, unit.isViewPair, unit.contents);
        if (!resource)
            return;
        const { className, localDep, needDecorator, implicitStatement, runtimeImportName, customName } = resource;
        if (localDep)
            localDeps.push(localDep);
        if (needDecorator)
            conventionalDecorators.push(needDecorator);
        if (implicitStatement)
            implicitElement = implicitStatement;
        if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
            ensureTypeIsExported(runtimeImport.names, runtimeImportName);
        }
        if (className && options.hmr && process.env.NODE_ENV !== 'production') {
            exportedClassName = className;
            hmrRuntimeModules.forEach(m => {
                if (!auImport.names.includes(m)) {
                    ensureTypeIsExported(runtimeImport.names, m);
                }
            });
            hmrMetadataModules.forEach(m => {
                if (!auImport.names.includes(m)) {
                    ensureTypeIsExported(metadataImport.names, m);
                }
            });
        }
        if (customName)
            customElementName = customName;
    });
    let m = modifyCode__default["default"](unit.contents, unit.path);
    const hmrEnabled = options.hmr && exportedClassName && process.env.NODE_ENV !== 'production';
    if (options.enableConventions || hmrEnabled) {
        if (hmrEnabled && metadataImport.names.length) {
            let metadataImportStatement = `import { ${metadataImport.names.join(', ')} } from '@aurelia/metadata';`;
            if (metadataImport.end === metadataImport.start)
                metadataImportStatement += '\n';
            m.replace(metadataImport.start, metadataImport.end, metadataImportStatement);
        }
        if (runtimeImport.names.length) {
            let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
            if (runtimeImport.end === runtimeImport.start)
                runtimeImportStatement += '\n';
            m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
        }
    }
    if (options.enableConventions) {
        m = modifyResource(unit, m, {
            runtimeImport,
            metadataImport,
            exportedClassName,
            implicitElement,
            localDeps,
            conventionalDecorators,
            customElementName
        });
    }
    if (options.hmr && exportedClassName && process.env.NODE_ENV !== 'production') {
        const hmr = getHmrCode(exportedClassName, options.hmrModule);
        m.append(hmr);
    }
    return m.transform();
}
function modifyResource(unit, m, options) {
    const { implicitElement, localDeps, conventionalDecorators, customElementName } = options;
    if (implicitElement && unit.filePair) {
        // @view() for foo.js and foo-view.html
        // @customElement() for foo.js and foo.html
        const dec = unit.isViewPair ? 'view' : 'customElement';
        const viewDef = '__au2ViewDef';
        m.prepend(`import * as ${viewDef} from './${unit.filePair}';\n`);
        if (localDeps.length) {
            // When in-file deps are used, move the body of custom element to end of the file,
            // in order to avoid TS2449: Class '...' used before its declaration.
            const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
            m.replace(implicitElement.pos, implicitElement.end, '');
            if (customElementName) {
                const name = unit.contents.slice(customElementName.pos, customElementName.end);
                // Overwrite element name
                m.append(`\n${elementStatement.substring(0, customElementName.pos - implicitElement.pos)}{ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }${elementStatement.substring(customElementName.end - implicitElement.pos)}\n`);
            }
            else {
                m.append(`\n@${dec}({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })\n${elementStatement}\n`);
            }
        }
        else {
            if (customElementName) {
                // Overwrite element name
                const name = unit.contents.slice(customElementName.pos, customElementName.end);
                m.replace(customElementName.pos, customElementName.end, `{ ...${viewDef}, name: ${name} }`);
            }
            else {
                conventionalDecorators.push([implicitElement.pos, `@${dec}(${viewDef})\n`]);
            }
        }
    }
    if (conventionalDecorators.length) {
        conventionalDecorators.forEach(([pos, str]) => m.insert(pos, str));
    }
    return m;
}
function captureImport(s, lib, code) {
    if (ts__namespace.isImportDeclaration(s) &&
        ts__namespace.isStringLiteral(s.moduleSpecifier) &&
        s.moduleSpecifier.text === lib &&
        s.importClause &&
        s.importClause.namedBindings &&
        ts__namespace.isNamedImports(s.importClause.namedBindings)) {
        return {
            names: s.importClause.namedBindings.elements.map(e => e.name.text),
            start: ensureTokenStart(s.pos, code),
            end: s.end
        };
    }
}
// This method mutates runtimeExports.
function ensureTypeIsExported(runtimeExports, type) {
    if (!runtimeExports.includes(type)) {
        runtimeExports.push(type);
    }
}
// TypeScript parsed statement could contain leading white spaces.
// This find the exact starting position for latter code injection.
function ensureTokenStart(start, code) {
    while (start < code.length - 1 && /^\s$/.exec(code[start]))
        start++;
    return start;
}
function isExported(node) {
    if (!node.modifiers)
        return false;
    for (const mod of node.modifiers) {
        if (mod.kind === ts__namespace.SyntaxKind.ExportKeyword)
            return true;
    }
    return false;
}
const KNOWN_DECORATORS = ['view', 'customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];
function findDecoratedResourceType(node) {
    if (!node.decorators)
        return;
    for (const d of node.decorators) {
        if (!ts__namespace.isCallExpression(d.expression))
            return;
        const exp = d.expression.expression;
        if (ts__namespace.isIdentifier(exp)) {
            const name = exp.text;
            if (KNOWN_DECORATORS.includes(name)) {
                return {
                    type: name,
                    expression: d.expression
                };
            }
        }
    }
}
function isKindOfSame(name1, name2) {
    return name1.replace(/-/g, '') === name2.replace(/-/g, '');
}
function findResource(node, expectedResourceName, filePair, isViewPair, code) {
    if (!ts__namespace.isClassDeclaration(node))
        return;
    if (!node.name)
        return;
    if (!isExported(node))
        return;
    const pos = ensureTokenStart(node.pos, code);
    const className = node.name.text;
    const { name, type } = nameConvention(className);
    const isImplicitResource = isKindOfSame(name, expectedResourceName);
    const foundType = findDecoratedResourceType(node);
    if (foundType) {
        // Explicitly decorated resource
        if (!isImplicitResource &&
            foundType.type !== 'customElement' &&
            foundType.type !== 'view') {
            return {
                className,
                localDep: className
            };
        }
        if (isImplicitResource &&
            foundType.type === 'customElement' &&
            foundType.expression.arguments.length === 1 &&
            ts__namespace.isStringLiteral(foundType.expression.arguments[0])) {
            // @customElement('custom-name')
            const customName = foundType.expression.arguments[0];
            return {
                className,
                implicitStatement: { pos: pos, end: node.end },
                customName: { pos: ensureTokenStart(customName.pos, code), end: customName.end }
            };
        }
        return {
            className,
        };
    }
    else {
        if (type === 'customElement') {
            // Custom element can only be implicit resource
            if (isImplicitResource && filePair) {
                return {
                    className,
                    implicitStatement: { pos: pos, end: node.end },
                    runtimeImportName: isViewPair ? 'view' : 'customElement'
                };
            }
        }
        else {
            const result = {
                className,
                needDecorator: [pos, `@${type}('${name}')\n`],
                localDep: className,
            };
            result.runtimeImportName = type;
            return result;
        }
    }
}

function stripMetaData(rawHtml) {
    const deps = [];
    let shadowMode = null;
    let containerless = false;
    let hasSlot = false;
    const bindables = {};
    const aliases = [];
    const toRemove = [];
    const tree = parse5.parseFragment(rawHtml, { sourceCodeLocationInfo: true });
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
        const normalizedMode = kernel.kebabCase(mode);
        if (normalizedMode === 'one-time')
            return runtime.BindingMode.oneTime;
        if (normalizedMode === 'one-way' || normalizedMode === 'to-view')
            return runtime.BindingMode.toView;
        if (normalizedMode === 'from-view')
            return runtime.BindingMode.fromView;
        if (normalizedMode === 'two-way')
            return runtime.BindingMode.twoWay;
    }
}

// stringModuleWrap is to deal with pure css text module import in shadowDOM mode.
// For webpack:
//   import d0 from '!!raw-loader!./foo.css';
// For dumber/requirejs:
//   import d0 from 'text!./foo.css';
// We cannot use
//   import d0 from './foo.css';
// because most bundler by default will inject that css into HTML head.
function preprocessHtmlTemplate(unit, options, hasViewModel) {
    const name = resourceName(unit.path);
    const stripped = stripMetaData(unit.contents);
    const { html, deps, containerless, hasSlot, bindables, aliases } = stripped;
    let { shadowMode } = stripped;
    if (unit.filePair) {
        const basename = path__namespace.basename(unit.filePair, path__namespace.extname(unit.filePair));
        if (!deps.some(dep => options.cssExtensions.some(e => dep === `./${basename}${e}`))) {
            // implicit dep ./foo.css for foo.html
            deps.unshift(`./${unit.filePair}`);
        }
    }
    if (options.defaultShadowOptions && shadowMode === null) {
        shadowMode = options.defaultShadowOptions.mode;
    }
    const useCSSModule = shadowMode !== null ? false : options.useCSSModule;
    const viewDeps = [];
    const cssDeps = [];
    const statements = [];
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
        const ext = path__namespace.extname(d);
        // All known resource types
        if (!ext || ext === '.js' || ext === '.ts' || options.templateExtensions.includes(ext)) {
            statements.push(`import * as d${i} from ${s(d)};\n`);
            viewDeps.push(`d${i}`);
            return;
        }
        // CSS resource
        if (options.cssExtensions.includes(ext)) {
            if (shadowMode !== null) {
                const stringModuleId = options.stringModuleWrap ? options.stringModuleWrap(d) : d;
                statements.push(`import d${i} from ${s(stringModuleId)};\n`);
                cssDeps.push(`d${i}`);
            }
            else if (useCSSModule) {
                statements.push(`import d${i} from ${s(d)};\n`);
                cssDeps.push(`d${i}`);
            }
            else {
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
    const m = modifyCode__default["default"]('', unit.path);
    const hmrEnabled = !hasViewModel && options.hmr && process.env.NODE_ENV !== 'production';
    if (hmrEnabled) {
        m.append(`import { ${hmrRuntimeModules.join(', ')} } from '@aurelia/runtime-html';\n`);
        m.append(`import { ${hmrMetadataModules.join(', ')} } from '@aurelia/metadata';\n`);
    }
    else {
        m.append(`import { CustomElement } from '@aurelia/runtime-html';\n`);
    }
    if (cssDeps.length > 0) {
        if (shadowMode !== null) {
            m.append(`import { shadowCSS } from '@aurelia/runtime-html';\n`);
            viewDeps.push(`shadowCSS(${cssDeps.join(', ')})`);
        }
        else if (useCSSModule) {
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
    if (Object.keys(bindables).length > 0) {
        m.append(`export const bindables = ${JSON.stringify(bindables)};\n`);
    }
    if (aliases.length > 0) {
        m.append(`export const aliases = ${JSON.stringify(aliases)};\n`);
    }
    if (hmrEnabled) {
        m.append(`const _e = CustomElement.define({ name, template, dependencies${shadowMode !== null ? ', shadowOptions' : ''}${containerless ? ', containerless' : ''}${Object.keys(bindables).length > 0 ? ', bindables' : ''}${aliases.length > 0 ? ', aliases' : ''} });
      export function register(container) {
        container.register(_e);
      }`);
    }
    else {
        m.append(`let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies${shadowMode !== null ? ', shadowOptions' : ''}${containerless ? ', containerless' : ''}${Object.keys(bindables).length > 0 ? ', bindables' : ''}${aliases.length > 0 ? ', aliases' : ''} });
  }
  container.register(_e);
}
`);
    }
    if (hmrEnabled) {
        m.append(getHmrCode('_e', options.hmrModule));
    }
    const { code, map } = m.transform();
    map.sourcesContent = [unit.contents];
    return { code, map };
}
function s(str) {
    return JSON.stringify(str);
}

const defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
const defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
const defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];
function preprocessOptions(options = {}) {
    const { cssExtensions = [], jsExtensions = [], templateExtensions = [], useCSSModule = false, hmr = true, enableConventions = true, hmrModule = 'module', ...others } = options;
    return {
        cssExtensions: Array.from(new Set([...defaultCssExtensions, ...cssExtensions])).sort(),
        jsExtensions: Array.from(new Set([...defaultJsExtensions, ...jsExtensions])).sort(),
        templateExtensions: Array.from(new Set([...defaultTemplateExtensions, ...templateExtensions])).sort(),
        useCSSModule,
        hmr,
        hmrModule,
        enableConventions,
        ...others
    };
}

function preprocess(unit, options, _fileExists = fileExists) {
    const ext = path__namespace.extname(unit.path);
    const basename = path__namespace.basename(unit.path, ext);
    const allOptions = preprocessOptions(options);
    const base = unit.base || '';
    if (options.enableConventions && allOptions.templateExtensions.includes(ext)) {
        const possibleFilePair = allOptions.cssExtensions.map(e => path__namespace.join(base, unit.path.slice(0, -ext.length) + e));
        const filePair = possibleFilePair.find(_fileExists);
        if (filePair) {
            if (allOptions.useProcessedFilePairFilename) {
                unit.filePair = `${basename}.css`;
            }
            else {
                unit.filePair = path__namespace.basename(filePair);
            }
        }
        const hasViewModel = Boolean(allOptions.jsExtensions.map(e => path__namespace.join(base, unit.path.slice(0, -ext.length) + e)).find(_fileExists));
        return preprocessHtmlTemplate(unit, allOptions, hasViewModel);
    }
    else if (allOptions.jsExtensions.includes(ext)) {
        const possibleFilePair = allOptions.templateExtensions.map(e => path__namespace.join(base, unit.path.slice(0, -ext.length) + e));
        const filePair = possibleFilePair.find(_fileExists);
        if (filePair) {
            if (allOptions.useProcessedFilePairFilename) {
                unit.filePair = `${basename}.html`;
            }
            else {
                unit.filePair = path__namespace.basename(filePair);
            }
        }
        else {
            // Try foo.js and foo-view.html convention.
            // This convention is handled by @view(), not @customElement().
            const possibleViewPair = allOptions.templateExtensions.map(e => path__namespace.join(base, `${unit.path.slice(0, -ext.length)}-view${e}`));
            const viewPair = possibleViewPair.find(_fileExists);
            if (viewPair) {
                unit.isViewPair = true;
                if (allOptions.useProcessedFilePairFilename) {
                    unit.filePair = `${basename}-view.html`;
                }
                else {
                    unit.filePair = path__namespace.basename(viewPair);
                }
            }
        }
        return preprocessResource(unit, allOptions);
    }
}
function fileExists(p) {
    try {
        const stats = fs__namespace.statSync(p);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}

exports.defaultCssExtensions = defaultCssExtensions;
exports.defaultJsExtensions = defaultJsExtensions;
exports.defaultTemplateExtensions = defaultTemplateExtensions;
exports.nameConvention = nameConvention;
exports.preprocess = preprocess;
exports.preprocessHtmlTemplate = preprocessHtmlTemplate;
exports.preprocessOptions = preprocessOptions;
exports.preprocessResource = preprocessResource;
exports.resourceName = resourceName;
exports.stripMetaData = stripMetaData;
//# sourceMappingURL=index.js.map