"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessResource = void 0;
const path = require("path");
const kernel_1 = require("@aurelia/kernel");
const modify_code_1 = require("modify-code");
const ts = require("typescript");
const name_convention_js_1 = require("./name-convention.js");
function preprocessResource(unit, options) {
    const basename = path.basename(unit.path, path.extname(unit.path));
    const expectedResourceName = kernel_1.kebabCase(basename);
    const sf = ts.createSourceFile(unit.path, unit.contents, ts.ScriptTarget.Latest);
    let auImport = { names: [], start: 0, end: 0 };
    let runtimeImport = { names: [], start: 0, end: 0 };
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
        const resource = findResource(s, expectedResourceName, unit.filePair, unit.contents);
        if (!resource)
            return;
        const { localDep, needDecorator, implicitStatement, runtimeImportName, customName } = resource;
        if (localDep)
            localDeps.push(localDep);
        if (needDecorator)
            conventionalDecorators.push(needDecorator);
        if (implicitStatement)
            implicitElement = implicitStatement;
        if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
            ensureTypeIsExported(runtimeImport.names, runtimeImportName);
        }
        if (customName)
            customElementName = customName;
    });
    return modifyResource(unit, {
        expectedResourceName,
        runtimeImport,
        implicitElement,
        localDeps,
        conventionalDecorators,
        customElementName
    });
}
exports.preprocessResource = preprocessResource;
function modifyResource(unit, options) {
    const { expectedResourceName, runtimeImport, implicitElement, localDeps, conventionalDecorators, customElementName } = options;
    const m = modify_code_1.default(unit.contents, unit.path);
    if (implicitElement && unit.filePair) {
        // @view() for foo.js and foo-view.html
        // @customElement() for foo.js and foo.html
        const dec = kernel_1.kebabCase(unit.filePair).startsWith(`${expectedResourceName}-view`) ? 'view' : 'customElement';
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
        if (runtimeImport.names.length) {
            let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
            if (runtimeImport.end === runtimeImport.start)
                runtimeImportStatement += '\n';
            m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
        }
        conventionalDecorators.forEach(([pos, str]) => m.insert(pos, str));
    }
    return m.transform();
}
function captureImport(s, lib, code) {
    if (ts.isImportDeclaration(s) &&
        ts.isStringLiteral(s.moduleSpecifier) &&
        s.moduleSpecifier.text === lib &&
        s.importClause &&
        s.importClause.namedBindings &&
        ts.isNamedImports(s.importClause.namedBindings)) {
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
        if (mod.kind === ts.SyntaxKind.ExportKeyword)
            return true;
    }
    return false;
}
const KNOWN_DECORATORS = ['view', 'customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];
function findDecoratedResourceType(node) {
    if (!node.decorators)
        return;
    for (const d of node.decorators) {
        if (!ts.isCallExpression(d.expression))
            return;
        const exp = d.expression.expression;
        if (ts.isIdentifier(exp)) {
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
function findResource(node, expectedResourceName, filePair, code) {
    if (!ts.isClassDeclaration(node))
        return;
    if (!node.name)
        return;
    if (!isExported(node))
        return;
    const pos = ensureTokenStart(node.pos, code);
    const className = node.name.text;
    const { name, type } = name_convention_js_1.nameConvention(className);
    const isImplicitResource = isKindOfSame(name, expectedResourceName);
    const foundType = findDecoratedResourceType(node);
    if (foundType) {
        // Explicitly decorated resource
        if (!isImplicitResource &&
            foundType.type !== 'customElement' &&
            foundType.type !== 'view') {
            return { localDep: className };
        }
        if (isImplicitResource &&
            foundType.type === 'customElement' &&
            foundType.expression.arguments.length === 1 &&
            ts.isStringLiteral(foundType.expression.arguments[0])) {
            // @customElement('custom-name')
            const customName = foundType.expression.arguments[0];
            return {
                implicitStatement: { pos: pos, end: node.end },
                customName: { pos: ensureTokenStart(customName.pos, code), end: customName.end }
            };
        }
    }
    else {
        if (type === 'customElement') {
            // Custom element can only be implicit resource
            if (isImplicitResource && filePair) {
                return {
                    implicitStatement: { pos: pos, end: node.end },
                    runtimeImportName: kernel_1.kebabCase(filePair).startsWith(`${expectedResourceName}-view`) ? 'view' : 'customElement'
                };
            }
        }
        else {
            const result = {
                needDecorator: [pos, `@${type}('${name}')\n`],
                localDep: className,
            };
            result.runtimeImportName = type;
            return result;
        }
    }
}
//# sourceMappingURL=preprocess-resource.js.map