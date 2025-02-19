'use strict';

var kernel = require('@aurelia/kernel');
var path = require('path');
var pkg = require('typescript');
var $modifyCode = require('modify-code');
var expressionParser = require('@aurelia/expression-parser');
var templateCompiler = require('@aurelia/template-compiler');
var parse5 = require('parse5');
var runtimeHtml = require('@aurelia/runtime-html');
var fs = require('fs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        for (var k in e) {
            n[k] = e[k];
        }
    }
    n.default = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var $modifyCode__namespace = /*#__PURE__*/_interopNamespaceDefault($modifyCode);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);

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

function resourceName(filePath) {
    const parsed = path__namespace.parse(filePath);
    const name = parsed.name === 'index' ? path__namespace.basename(parsed.dir) : parsed.name;
    return kernel.kebabCase(name);
}

const modifyCode = (typeof $modifyCode === 'function'
    ? $modifyCode
    : typeof $modifyCode.default === 'function'
        ? $modifyCode.default
        : typeof $modifyCode__namespace === 'function'
            ? $modifyCode__namespace
            : $modifyCode__namespace.default);

var _a;
function prependUtilityTypes(m, isJs) {
    m.prepend(`// @ts-check
${isJs
        ?
            `/**
  * @template TCollection
  * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
  */`
        :
            `type CollectionElement<TCollection> = TCollection extends Array<infer TElement>
      ? TElement
      : TCollection extends Set<infer TElement>
        ? TElement
        : TCollection extends Map<infer TKey, infer TValue>
          ? [TKey, TValue]
          : TCollection extends number
           ? number
           : TCollection extends object
             ? any
             : never;`}
`);
}
var IdentifierInstruction;
(function (IdentifierInstruction) {
    IdentifierInstruction[IdentifierInstruction["None"] = 0] = "None";
    IdentifierInstruction[IdentifierInstruction["SkipGeneration"] = 1] = "SkipGeneration";
    IdentifierInstruction[IdentifierInstruction["AddToOverrides"] = 2] = "AddToOverrides";
    IdentifierInstruction[IdentifierInstruction["Promise"] = 16] = "Promise";
})(IdentifierInstruction || (IdentifierInstruction = {}));
class IdentifierScope {
    get isRoot() { return this.parent === null; }
    constructor(type, classes, parent = null) {
        this.type = type;
        this.classes = classes;
        this.parent = parent;
        this.overriddenIdentMap = new Map();
        this.promiseProperty = null;
        this.decIdentMap = parent === null ? new Map() : null;
        this.root = parent === null ? this : parent.root;
    }
    createChild(type) { return new IdentifierScope(type, this.classes, this); }
    getIdentifier(ident, instruction = 0) {
        var _b;
        const returnIdentifier = (newIdent) => {
            if (isPromise)
                this.promiseProperty = newIdent;
            return newIdent;
        };
        if (ident.startsWith(identifierPrefix))
            throw new Error(`Identifier '${ident}' uses reserved prefix '${identifierPrefix}'; consider renaming it.`);
        const isPromise = (instruction & 16) > 0;
        if (isPromise) {
            if (this.type !== 'promise')
                throw new Error(`Identifier '${ident}' is used for promise template controller, but scope is not marked as a promise scope.`);
        }
        if (this.classes.some(c => c.members.some(x => x.name === ident)))
            return returnIdentifier(ident);
        let current = this;
        while (current !== null) {
            const lookup = current.overriddenIdentMap;
            if (lookup.has(ident))
                return returnIdentifier(lookup.get(ident));
            current = current.parent;
        }
        if ((instruction & 1) > 0)
            return null;
        const lookup = this.root.decIdentMap;
        let count = (_b = lookup.get(ident)) !== null && _b !== void 0 ? _b : 0;
        lookup.set(ident, ++count);
        const newName = `${identifierPrefix}${ident}${count}`;
        if ((instruction & 2) > 0)
            this.overriddenIdentMap.set(ident, newName);
        return returnIdentifier(newName);
    }
    getPromiseProperty() {
        let current = this;
        while (current !== null) {
            if (current.promiseProperty !== null)
                return current.promiseProperty;
            current = current.parent;
        }
        return null;
    }
}
const identifierPrefix = '__Template_TypeCheck_Synthetic_';
class TypeCheckingContext {
    get accessType() { var _b; return (_b = this._accessType) !== null && _b !== void 0 ? _b : (this._accessType = this.accessTypeParts.reduce((acc, part) => part(acc), '')); }
    get hasRepeatContextualProperties() { return this._hasRepeatContextualProperties; }
    set hasRepeatContextualProperties(value) {
        if (this._hasRepeatContextualProperties || !value)
            return;
        this._hasRepeatContextualProperties = value;
        this.accessTypeParts.push((acc) => `${acc} & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number }`);
    }
    constructor(attrParser, exprParser, classes, isJs) {
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.classes = classes;
        this.isJs = isJs;
        this.toReplace = [];
        this._accessType = void 0;
        this._hasRepeatContextualProperties = false;
        const classNames = classes.map(c => c.name);
        const classUnion = [];
        for (const $class of classes) {
            const nonPublicMembers = $class.members.filter(x => x.accessModifier !== 'public');
            if (nonPublicMembers.length === 0) {
                classUnion.push($class.name);
                continue;
            }
            classUnion.push(`Omit<${$class.name}, ${nonPublicMembers.map(x => `'${x.name}'`).join(' | ')}> & ${renderNonPublicMembers(nonPublicMembers)}`);
        }
        this.classUnion = classUnion.join(' | ');
        this.accessTypeParts = [() => `${this.classUnion} & { $parent: any }`];
        this.accessTypeIdentifier = `__Template_Type_${classNames.join('_')}__`;
        this.accessIdentifier = `access${isJs ? '' : `<${this.accessTypeIdentifier}>`}`;
        this.scope = new IdentifierScope('none', classes);
        function renderNonPublicMembers(nonPublicMembers) {
            return `{ ${nonPublicMembers.map(x => `${x.name}${renderMethodArguments(x)}: ${x.dataType}`).join(', ')} }`;
        }
        function renderMethodArguments(x) {
            if (x.memberType !== 'method')
                return '';
            return `(${x.methodArguments.map(a => `${a.isSpread ? '...' : ''}${a.name}${a.isOptional ? '?' : ''}: ${a.type}`).join(',')})`;
        }
    }
    produceTypeCheckedTemplate(rawHtml) {
        const { accessType, isJs, accessTypeIdentifier, classes } = this;
        let html = '';
        let lastIndex = 0;
        this.toReplace.forEach(({ loc, modifiedContent }) => {
            html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent();
            lastIndex = loc.endOffset;
        });
        html += rawHtml.slice(lastIndex);
        const output = `
${isJs ? '' : `type ${accessTypeIdentifier} = ${accessType};`}
function __typecheck_template_${classes.map(x => x.name).join('_')}__() {
  ${isJs
            ? `
  /**
   * @typedef {${accessType}} ${accessTypeIdentifier}
   */
  /**
   * @template {${accessTypeIdentifier}} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  `
            : ''}
  const access = ${isJs ? '' : `<T extends object>`}(typecheck${isJs ? '' : ': (o: T) => unknown'}, expr${isJs ? '' : ': string'}) => expr;
  return \`${html}\`;
}\n\n`;
        return output;
    }
    getIdentifier(ident, instruction = 0) {
        return this.scope.getIdentifier(ident, instruction);
    }
    createLambdaExpression(args) {
        if (kernel.isArray(args)) {
            const len = args.length;
            switch (len) {
                case 0: throw new Error('At least one argument is required');
                case 1: return `${_a._o} => ${_a._o}.${args[0]}`;
                default: return `${_a._o} => (${args.map(arg => `${_a._o}.${arg}`).join(',')})`;
            }
        }
        switch (args.$kind) {
            case 'CallScope':
                {
                    const argList = [];
                    for (const arg of args.args) {
                        switch (arg.$kind) {
                            case 'PrimitiveLiteral':
                                argList.push(unparse(arg));
                                break;
                            default: argList.push(`${_a._o}.${unparse(arg)}`);
                        }
                    }
                    return `${_a._o} => ${_a._o}.${args.name}(${argList.join(',')})`;
                }
            default: return this.createLambdaExpression([unparse(args)]);
        }
    }
    createMemberAccessExpression(member) {
        return new expressionParser.AccessMemberExpression(_a.rootAccessScope, member);
    }
    pushScope(type) {
        this.scope = this.scope.createChild(type);
    }
    popScope() {
        if (this.scope.isRoot)
            return;
        this.scope = this.scope.parent;
    }
    addPromiseResolvedProperty(identifier) {
        const promiseProp = this.scope.getPromiseProperty();
        if (promiseProp === null)
            throw new Error('Promise property not found');
        this.accessTypeParts.push((acc) => `${acc} & { ${identifier}: Awaited<${this.accessTypeIdentifier}['${promiseProp}']> }`);
    }
}
_a = TypeCheckingContext;
TypeCheckingContext._o = 'o';
TypeCheckingContext.rootAccessScope = new expressionParser.AccessScopeExpression(_a._o, 0);
function createTypeCheckedTemplate(rawHtml, classes, isJs) {
    const tree = parse5.parseFragment(rawHtml, { sourceCodeLocationInfo: true });
    const container = kernel.DI.createContainer().register(templateCompiler.DotSeparatedAttributePattern, templateCompiler.EventAttributePattern, templateCompiler.RefAttributePattern, templateCompiler.AtPrefixedTriggerAttributePattern, templateCompiler.ColonPrefixedBindAttributePattern);
    const attrParser = container.get(templateCompiler.IAttributeParser);
    const exprParser = container.get(expressionParser.ExpressionParser);
    const ctx = new TypeCheckingContext(attrParser, exprParser, classes, isJs);
    traverse$1(tree, (node) => processNode(node, ctx));
    return ctx.produceTypeCheckedTemplate(rawHtml);
}
function traverseDepth($node, ctx) {
    var _b;
    if ($node.childNodes)
        traverse$1($node, n => processNode(n, ctx));
    if ((_b = $node.content) === null || _b === void 0 ? void 0 : _b.childNodes)
        traverse$1($node.content, n => processNode(n, ctx));
    ctx.popScope();
}
function tryProcessRepeat(syntax, attr, node, ctx) {
    if (syntax.command !== 'for')
        return false;
    ctx.pushScope('repeat');
    const expr = ctx.exprParser.parse(attr.value, 'IsIterator');
    let iterable;
    let propAccExpr;
    if (expr.iterable.$kind === 'PrimitiveLiteral') {
        const identifier = ctx.getIdentifier(rangeIterableIdentifier);
        const primitiveValue = expr.iterable.value;
        iterable = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([identifier])}, '${primitiveValue}')}`;
        ctx.accessTypeParts.push((acc) => `${acc} & { ${identifier}: ${primitiveValue} }`);
        propAccExpr = `${ctx.accessTypeIdentifier}['${identifier}']`;
    }
    else {
        const rawIterIdentifier = expressionParser.Unparser.unparse(expr.iterable);
        const [iterIdent, path] = mutateAccessScope(expr.iterable, ctx, member => {
            const newName = ctx.getIdentifier(member, 2);
            return newName;
        }, true);
        propAccExpr = `${ctx.accessTypeIdentifier}${path.map(p => `['${p}']`).join('')}`;
        iterable = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(iterIdent)}, '${rawIterIdentifier}')}`;
    }
    let declaration;
    switch (expr.declaration.$kind) {
        case 'ArrayDestructuring': {
            const [keyAssignLeaf, valueAssignLeaf] = expr.declaration.list;
            const [rawKeyIdent, keyIdent] = getArrDestIdent(keyAssignLeaf);
            const [rawValueIdent, valueIdent] = getArrDestIdent(valueAssignLeaf);
            ctx.accessTypeParts.push((acc) => `${acc} & { ${keyIdent}: CollectionElement<${propAccExpr}>[0], ${valueIdent}: CollectionElement<${propAccExpr}>[1] }`);
            declaration = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([keyIdent, valueIdent])}, '[${rawKeyIdent},${rawValueIdent}]')}`;
            break;
            function getArrDestIdent(leafExpr) {
                switch (leafExpr.$kind) {
                    case 'DestructuringAssignmentLeaf': {
                        const rawIdentifier = leafExpr.target.name;
                        const identifier = ctx.getIdentifier(rawIdentifier, 2);
                        return [rawIdentifier, identifier];
                    }
                    default: throw new Error(`Unsupported declaration kind: ${keyAssignLeaf.$kind}`);
                }
            }
        }
        default: {
            const rawDecIdentifier = expressionParser.Unparser.unparse(expr.declaration);
            const decIdentifier = ctx.getIdentifier(rawDecIdentifier, 2);
            ctx.accessTypeParts.push((acc) => `${acc} & { ${decIdentifier}: CollectionElement<${propAccExpr}> }`);
            declaration = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([decIdentifier])}, '${rawDecIdentifier}')}`;
            break;
        }
    }
    ctx.toReplace.push({
        loc: node.sourceCodeLocation.attrs[attr.name],
        modifiedContent: () => `${attr.name}="${declaration()} of ${iterable()}"`,
    });
    traverseDepth(node, ctx);
    return true;
}
function tryProcessPromise(syntax, attr, node, ctx) {
    const target = syntax.target;
    switch (target) {
        case 'promise': {
            ctx.pushScope('promise');
            const value = attr.value.length === 0 ? target : attr.value;
            const expr = ctx.exprParser.parse(value, 'None');
            if (expr != null) {
                const [_expr] = mutateAccessScope(expr, ctx, member => { var _b; return (_b = ctx.getIdentifier(member, 1 | 16)) !== null && _b !== void 0 ? _b : member; });
                addReplaceParts(_expr, value);
            }
            traverseDepth(node, ctx);
            return [true, false];
        }
        case 'then': {
            ctx.pushScope('none');
            const value = attr.value.length === 0 ? target : attr.value;
            const expr = ctx.exprParser.parse(value, 'None');
            if (expr != null) {
                const [_expr] = mutateAccessScope(expr, ctx, member => {
                    const newName = ctx.getIdentifier(member, 2);
                    ctx.addPromiseResolvedProperty(newName);
                    return newName;
                });
                addReplaceParts(_expr, value);
            }
            traverseDepth(node, ctx);
            return [true, false];
        }
        case 'catch': {
            ctx.pushScope('none');
            const value = attr.value.length === 0 ? target : attr.value;
            const expr = ctx.exprParser.parse(value, 'None');
            if (expr != null) {
                const [_expr] = mutateAccessScope(expr, ctx, member => {
                    const newName = ctx.getIdentifier(member, 2);
                    ctx.accessTypeParts.push((acc) => `${acc} & { ${newName}: any }`);
                    return newName;
                });
                addReplaceParts(_expr, value);
            }
            traverseDepth(node, ctx);
            return [true, false];
        }
        default: return [false, void 0];
    }
    function addReplaceParts(_expr, value) {
        ctx.toReplace.push({
            loc: node.sourceCodeLocation.attrs[attr.name],
            modifiedContent: () => `${attr.name}="\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(_expr)}, '${value}')}"`
        });
    }
}
const rangeIterableIdentifier = '__TypeCheck_RangeIterable__';
function processNode(node, ctx) {
    var _b;
    let retVal = void 0;
    if ('tagName' in node) {
        (_b = node.attrs) === null || _b === void 0 ? void 0 : _b.forEach(attr => {
            const syntax = ctx.attrParser.parse(attr.name, attr.value);
            if (tryProcessRepeat(syntax, attr, node, ctx))
                retVal = false;
            else {
                let promisedProcessed;
                [promisedProcessed, retVal] = tryProcessPromise(syntax, attr, node, ctx);
                if (!promisedProcessed && syntax.command) {
                    const value = attr.value.length === 0 ? syntax.target : attr.value;
                    const expr = ctx.exprParser.parse(value, 'None');
                    if (expr == null)
                        return;
                    const [_expr] = mutateAccessScope(expr, ctx, member => { var _b; return (_b = ctx.getIdentifier(member, 1)) !== null && _b !== void 0 ? _b : member; });
                    if (_expr.$kind === 'PrimitiveLiteral')
                        return;
                    ctx.toReplace.push({
                        loc: node.sourceCodeLocation.attrs[attr.name],
                        modifiedContent: () => `${attr.name}="\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(_expr)}, '${value}')}"`
                    });
                }
            }
        });
    }
    else if (node.nodeName === '#text') {
        const expr = ctx.exprParser.parse(node.value, 'Interpolation');
        if (expr != null) {
            const htmlFactories = [() => expr.parts[0]];
            expr.expressions.forEach((part, idx) => {
                const originalExpr = part;
                [part] = mutateAccessScope(part, ctx, member => { var _b; return (_b = ctx.getIdentifier(member, 1)) !== null && _b !== void 0 ? _b : member; });
                htmlFactories.push(() => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(part)}, '${escape(unparse(originalExpr))}')}`, () => expr.parts[idx + 1]);
            });
            ctx.toReplace.push({
                loc: node.sourceCodeLocation,
                modifiedContent: () => htmlFactories.map(factory => factory()).join('')
            });
        }
    }
    return retVal;
}
function escape(s) {
    return s.replace(/'/g, '\\\'');
}
function unparse(expr) {
    return expressionParser.Unparser.unparse(expr);
}
const contextualRepeatProperties = ['$index', '$first', '$last', '$even', '$odd', '$length'];
function mutateAccessScope(expr, ctx, memberNameResolver, needsPath = false) {
    var _b;
    while (expr.$kind === 'ValueConverter' || expr.$kind === 'BindingBehavior') {
        expr = expr.expression;
    }
    if ((expr.$kind === 'AccessScope' || expr.$kind === 'AccessMember') && contextualRepeatProperties.includes(expr.name)) {
        ctx.hasRepeatContextualProperties = true;
        if (needsPath)
            throw new Error('Not supported');
        return [new expressionParser.AccessScopeExpression(expr.name, 0), null];
    }
    expr = structuredClone(expr);
    let object = expr;
    const path = needsPath ? [] : null;
    if (object.$kind === 'AccessScope' && object.ancestor === 0) {
        const member = object.name;
        const prop = object.name = memberNameResolver(member);
        path === null || path === void 0 ? void 0 : path.push(prop);
    }
    else {
        while (!isAccessGlobal(object) && (object.$kind === 'CallMember' || object.$kind === 'AccessMember' || object.$kind === 'AccessKeyed')) {
            switch (object.$kind) {
                case 'AccessMember':
                    path === null || path === void 0 ? void 0 : path.push(object.name);
                    break;
                case 'AccessKeyed': {
                    if (object.key.$kind === 'AccessScope' && object.key.ancestor === 0) {
                        const member = object.key.name;
                        const overriddenMember = memberNameResolver(member);
                        object.key = ctx.createMemberAccessExpression(overriddenMember);
                    }
                    break;
                }
            }
            object = object.object;
            if (object.$kind === 'AccessScope' && object.ancestor === 0) {
                const member = object.name;
                const prop = object.name = memberNameResolver(member);
                path === null || path === void 0 ? void 0 : path.push(prop);
                break;
            }
        }
    }
    return [expr, (_b = path === null || path === void 0 ? void 0 : path.reverse()) !== null && _b !== void 0 ? _b : null];
}
function isAccessGlobal(ast) {
    return ast.$kind === 'AccessGlobal' ||
        (ast.$kind === 'AccessMember' ||
            ast.$kind === 'AccessKeyed') && ast.accessGlobal;
}
function traverse$1(tree, cb) {
    tree.childNodes.forEach((n) => {
        var _b;
        const ne = n;
        if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element'))
            return;
        const processChild = cb(ne);
        if (processChild === false)
            return;
        if (n.childNodes)
            traverse$1(n, cb);
        if ((_b = n.content) === null || _b === void 0 ? void 0 : _b.childNodes)
            traverse$1(n.content, cb);
    });
}

const { ModifierFlags, ScriptTarget, SyntaxKind, canHaveDecorators, canHaveModifiers, createPrinter, createSourceFile, getCombinedModifierFlags, getDecorators, getModifiers, isCallExpression, isClassDeclaration, isExpressionStatement, isIdentifier, isImportDeclaration, isObjectLiteralExpression, isPropertyDeclaration, isPropertyAccessExpression, isNamedImports, isStringLiteral, transform, visitEachChild, visitNode, getJSDocType, factory: { createIdentifier, createObjectLiteralExpression, createSpreadAssignment, updateClassDeclaration, updatePropertyDeclaration, }, } = pkg;
function preprocessResource(unit, options) {
    var _a;
    const expectedResourceName = resourceName(unit.path);
    const sf = createSourceFile(unit.path, unit.contents, ScriptTarget.Latest, true);
    let exportedClassMetadata;
    let auImport = { names: [], start: 0, end: 0 };
    let runtimeImport = { names: [], start: 0, end: 0 };
    let implicitElement;
    let customElementDecorator;
    let defineElementInformation;
    const templateMetadata = [];
    const localDeps = [];
    const modifications = [];
    sf.statements.forEach(s => {
        const au = captureImport(s, 'aurelia', unit.contents);
        if (au) {
            auImport = au;
            return;
        }
        const runtime = captureImport(s, '@aurelia/runtime-html', unit.contents);
        if (runtime) {
            runtimeImport = runtime;
            return;
        }
        const templateImport = captureTemplateImport(s, unit.contents);
        if (templateImport) {
            templateMetadata.push(templateImport);
            return;
        }
        if (tryCaptureCustomElementDefine(s, sf, templateMetadata))
            return;
        const resource = findResource(s, expectedResourceName, unit.filePair, unit.contents, options.enableConventions, templateMetadata, sf);
        if (!resource)
            return;
        const { classMetadata, localDep, modification, implicitStatement, runtimeImportName, customElementDecorator: customName, defineElementInformation: $defineElementInformation, } = resource;
        if (localDep)
            localDeps.push(localDep);
        if (modification)
            modifications.push(modification);
        if (implicitStatement)
            implicitElement = implicitStatement;
        if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
            ensureTypeIsExported(runtimeImport.names, runtimeImportName);
        }
        if (classMetadata) {
            exportedClassMetadata = classMetadata;
        }
        if (customName)
            customElementDecorator = customName;
        if ($defineElementInformation)
            defineElementInformation = $defineElementInformation;
    });
    let m = modifyCode(unit.contents, unit.path);
    const hmrEnabled = options.hmr && exportedClassMetadata && process.env.NODE_ENV !== 'production';
    if (options.enableConventions || hmrEnabled) {
        if (runtimeImport.names.length) {
            let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
            if (runtimeImport.end === runtimeImport.start)
                runtimeImportStatement += '\n';
            m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
        }
    }
    m = modifyResource(unit, m, {
        implicitElement,
        localDeps,
        modifications,
        customElementDecorator,
        transformHtmlImportSpecifier: options.transformHtmlImportSpecifier,
        defineElementInformation,
        exportedClassMetadata,
        experimentalTemplateTypeCheck: options.experimentalTemplateTypeCheck,
        useConventions: (_a = options.enableConventions) !== null && _a !== void 0 ? _a : false,
        templateMetadata: templateMetadata
    });
    if (options.hmr && exportedClassMetadata && process.env.NODE_ENV !== 'production') {
        if (options.getHmrCode) {
            m.append(options.getHmrCode(exportedClassMetadata.name, unit.path));
        }
    }
    return m.transform();
}
const jsFilePattern = /\.[m]?js$/;
function modifyResource(unit, m, options) {
    const { implicitElement, localDeps, modifications, customElementDecorator, transformHtmlImportSpecifier = s => s, defineElementInformation, exportedClassMetadata, useConventions, templateMetadata, } = options;
    const isJs = jsFilePattern.test(unit.path);
    if (!useConventions) {
        if (options.experimentalTemplateTypeCheck) {
            prependUtilityTypes(m, isJs);
            for (const templateImport of templateMetadata) {
                const classNames = templateImport.classes;
                if (classNames.length === 0)
                    continue;
                emitTypeCheckedTemplate(() => { var _a, _b; return (_a = templateImport.inlineTemplate) !== null && _a !== void 0 ? _a : (_b = unit.readFile) === null || _b === void 0 ? void 0 : _b.call(unit, templateImport.modulePath); }, templateImport.classes, isJs);
            }
        }
    }
    else if (implicitElement && unit.filePair) {
        const viewDef = '__au2ViewDef';
        if (options.experimentalTemplateTypeCheck) {
            prependUtilityTypes(m, isJs);
            emitTypeCheckedTemplate(() => { var _a; return (_a = unit.readFile) === null || _a === void 0 ? void 0 : _a.call(unit, `./${unit.filePair}`); }, [exportedClassMetadata], isJs);
        }
        m.prepend(`import * as ${viewDef} from './${transformHtmlImportSpecifier(unit.filePair)}';\n`);
        if (defineElementInformation) {
            m.replace(defineElementInformation.position.pos, defineElementInformation.position.end, defineElementInformation.modifiedContent);
        }
        else {
            const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
            if (elementStatement.includes('$au')) {
                const sf = createSourceFile('temp.ts', elementStatement, ScriptTarget.Latest, true);
                const result = transform(sf, [createAuResourceTransformer()]);
                const modified = createPrinter().printFile(result.transformed[0]);
                m.replace(implicitElement.pos, implicitElement.end, modified);
            }
            else if (localDeps.length) {
                const pos = implicitElement.pos;
                if (customElementDecorator) {
                    const elementStatement = unit.contents.slice(customElementDecorator.position.end, implicitElement.end);
                    m.replace(pos, implicitElement.end, '');
                    const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
                    m.append(`\n@customElement({ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })${elementStatement}`);
                }
                else {
                    const elementStatement = unit.contents.slice(pos, implicitElement.end);
                    m.replace(pos, implicitElement.end, '');
                    m.append(`\n@customElement({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })\n${elementStatement}`);
                }
            }
            else {
                if (customElementDecorator) {
                    const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
                    m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
                    m.insert(implicitElement.pos, `@customElement({ ...${viewDef}, name: ${name} })`);
                }
                else {
                    let sb = viewDef;
                    if (sb.startsWith('...')) {
                        sb = `{ ${sb} }`;
                    }
                    m.insert(implicitElement.pos, `@customElement(${sb})\n`);
                }
            }
        }
    }
    if (modifications.length) {
        for (const modification of modifications) {
            if (modification.remove) {
                for (const pos of modification.remove) {
                    m.delete(pos.pos, pos.end);
                }
            }
            if (modification.insert) {
                for (const [pos, str] of modification.insert) {
                    m.insert(pos, str);
                }
            }
        }
    }
    return m;
    function emitTypeCheckedTemplate(contentFactory, classes, isJs) {
        const htmlContent = contentFactory();
        if (!htmlContent)
            return;
        const typeCheckedTemplate = createTypeCheckedTemplate(htmlContent, classes, isJs);
        m.prepend(typeCheckedTemplate);
    }
}
function captureImport(s, lib, code) {
    var _a;
    if (isImportDeclaration(s) &&
        isStringLiteral(s.moduleSpecifier) &&
        s.moduleSpecifier.text === lib &&
        ((_a = s.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) &&
        isNamedImports(s.importClause.namedBindings)) {
        return {
            names: s.importClause.namedBindings.elements.map(e => e.name.text),
            start: ensureTokenStart(s.pos, code),
            end: s.end
        };
    }
}
function captureTemplateImport(s, code) {
    var _a;
    if (isImportDeclaration(s)
        && isStringLiteral(s.moduleSpecifier)
        && s.moduleSpecifier.text.endsWith('.html')
        && ((_a = s.importClause) === null || _a === void 0 ? void 0 : _a.name) != null
        && isIdentifier(s.importClause.name))
        return {
            name: s.importClause.name.text,
            modulePath: s.moduleSpecifier.text,
            classes: [],
            start: ensureTokenStart(s.pos, code),
            end: s.end
        };
}
function getClassMembers(node, sf) {
    return node.members.reduce((acc, m) => {
        var _a, _b, _c;
        const name = m.name;
        if (name == null)
            return acc;
        let memberType = null;
        switch (m.kind) {
            case SyntaxKind.PropertyDeclaration:
                memberType = 'property';
                break;
            case SyntaxKind.MethodDeclaration:
                memberType = 'method';
                break;
            case SyntaxKind.GetAccessor:
                memberType = 'accessor';
                break;
        }
        if (memberType === null)
            return acc;
        if (isIdentifier(name)) {
            const flags = getCombinedModifierFlags(m);
            const accessModifier = flags & ModifierFlags.Private
                ? 'private'
                : flags & ModifierFlags.Protected
                    ? 'protected'
                    : 'public';
            acc.push({
                name: name.escapedText.toString(),
                accessModifier: accessModifier,
                memberType,
                dataType: (_c = (_b = ((_a = m.type) !== null && _a !== void 0 ? _a : getJSDocType(m))) === null || _b === void 0 ? void 0 : _b.getText(sf)) !== null && _c !== void 0 ? _c : 'any',
                methodArguments: memberType === 'method'
                    ? m.parameters.map(p => {
                        var _a, _b, _c;
                        return ({
                            name: p.name.getText(sf),
                            type: (_c = (_b = ((_a = p.type) !== null && _a !== void 0 ? _a : getJSDocType(p))) === null || _b === void 0 ? void 0 : _b.getText(sf)) !== null && _c !== void 0 ? _c : 'any',
                            isOptional: p.questionToken != null,
                            isSpread: p.dotDotDotToken != null
                        });
                    })
                    : null
            });
        }
        return acc;
    }, []);
}
function tryCaptureCustomElementDefine(s, sf, templateMetadata) {
    if (!isExpressionStatement(s) || !isCallExpression(s.expression))
        return false;
    const propAccExpr = s.expression.expression;
    if (!isPropertyAccessExpression(propAccExpr)
        || !isIdentifier(propAccExpr.expression) || propAccExpr.expression.escapedText !== 'CustomElement'
        || !isIdentifier(propAccExpr.name) || propAccExpr.name.escapedText !== 'define')
        return false;
    const [defn, className] = s.expression.arguments;
    if (!isIdentifier(className))
        return false;
    const name = className.escapedText.toString();
    const classDeclaration = sf.statements.find(s => isClassDeclaration(s) && s.name != null && s.name.text === name);
    const $class = { name, members: getClassMembers(classDeclaration, sf) };
    return tryCollectTemplateMetadataFromDefinition(defn, $class, templateMetadata);
}
function ensureTypeIsExported(runtimeExports, type) {
    if (!runtimeExports.includes(type)) {
        runtimeExports.push(type);
    }
}
function ensureTokenStart(start, code) {
    while (start < code.length - 1 && /^\s$/.exec(code[start]))
        start++;
    return start;
}
function isExported(node) {
    if (!canHaveModifiers(node))
        return false;
    const modifiers = getModifiers(node);
    if (modifiers === void 0)
        return false;
    for (const mod of modifiers) {
        if (mod.kind === SyntaxKind.ExportKeyword)
            return true;
    }
    return false;
}
const KNOWN_RESOURCE_DECORATORS = ['customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController', 'noView', 'inlineView'];
function isKindOfSame(name1, name2) {
    return name1.replace(/-/g, '') === name2.replace(/-/g, '');
}
function isStaticPropertyDeclaration(node, name) {
    return isPropertyDeclaration(node)
        && isIdentifier(node.name)
        && node.name.escapedText === name
        && (getCombinedModifierFlags(node) & ModifierFlags.Static) !== 0;
}
function isStatic$auProperty(member) {
    return isStaticPropertyDeclaration(member, '$au');
}
function tryCollectTemplateMetadataFromDefinition(defnExpr, $class, templateMetadata) {
    var _a, _b;
    if (defnExpr == null || !isObjectLiteralExpression(defnExpr))
        return false;
    let templateMetadataUpdated = false;
    for (const p of defnExpr.properties) {
        switch (p.kind) {
            case SyntaxKind.ShorthandPropertyAssignment:
                if (p.name.text === 'template') {
                    templateMetadataUpdated = ((_a = templateMetadata.find(ti => ti.name === 'template')) === null || _a === void 0 ? void 0 : _a.classes.push($class)) != null;
                }
                break;
            case SyntaxKind.PropertyAssignment: {
                const l = p.name;
                if (isIdentifier(l) && l.text === 'template') {
                    const value = p.initializer;
                    if (isIdentifier(value)) {
                        templateMetadataUpdated = ((_b = templateMetadata.find(ti => ti.name === value.text)) === null || _b === void 0 ? void 0 : _b.classes.push($class)) != null;
                    }
                    else if (isStringLiteral(value)) {
                        templateMetadata.push({
                            inlineTemplate: value.text,
                            classes: [$class],
                        });
                        templateMetadataUpdated = true;
                    }
                }
                break;
            }
        }
    }
    return templateMetadataUpdated;
}
function tryCollectTemplateMetadataFromStaticTemplate(member, $class, templateMetadata) {
    var _a;
    if (!isStaticPropertyDeclaration(member, 'template'))
        return false;
    const initializer = member.initializer;
    if (!initializer)
        return false;
    if (isStringLiteral(initializer)) {
        templateMetadata.push({
            inlineTemplate: initializer.text,
            classes: [$class],
        });
        return true;
    }
    if (isIdentifier(initializer)) {
        return ((_a = templateMetadata.find(ti => ti.name === initializer.text)) === null || _a === void 0 ? void 0 : _a.classes.push($class)) != null;
    }
    return false;
}
function createAuResourceTransformer() {
    return function factory(context) {
        function visit(node) {
            if (isClassDeclaration(node))
                return visitClass(node);
            return visitEachChild(node, visit, context);
        }
        return (node => visitNode(node, visit));
    };
    function visitClass(node) {
        const newMembers = node.members.map(member => {
            if (!isStatic$auProperty(member))
                return member;
            const initializer = member.initializer;
            if (initializer == null || !isObjectLiteralExpression(initializer))
                return member;
            const spreadAssignment = createSpreadAssignment(createIdentifier('__au2ViewDef'));
            const newInitializer = createObjectLiteralExpression([spreadAssignment, ...initializer.properties]);
            return updatePropertyDeclaration(member, member.modifiers, member.name, member.questionToken, member.type, newInitializer);
        });
        return updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, newMembers);
    }
}
function findResource(node, expectedResourceName, filePair, code, useConvention, templateMetadata, sf) {
    var _a;
    if (!isClassDeclaration(node) || !node.name || !isExported(node) && !useConvention)
        return;
    const pos = ensureTokenStart(node.pos, code);
    const className = node.name.text;
    const $class = { name: className, members: getClassMembers(node, sf) };
    const { name, type } = nameConvention(className);
    const isImplicitResource = isKindOfSame(name, expectedResourceName);
    const resourceType = collectClassDecorators(node);
    if (resourceType) {
        const decorator = resourceType.expression;
        const decoratorArgs = decorator === null || decorator === void 0 ? void 0 : decorator.arguments;
        const numArguments = (_a = decoratorArgs === null || decoratorArgs === void 0 ? void 0 : decoratorArgs.length) !== null && _a !== void 0 ? _a : 0;
        if (resourceType.type === 'customElement') {
            if (numArguments === 1)
                tryCollectTemplateMetadataFromDefinition(decoratorArgs === null || decoratorArgs === void 0 ? void 0 : decoratorArgs[0], $class, templateMetadata);
            for (const member of node.members) {
                tryCollectTemplateMetadataFromStaticTemplate(member, $class, templateMetadata);
            }
        }
        if (!isImplicitResource &&
            resourceType.type !== 'customElement') {
            return {
                localDep: className
            };
        }
        if (isImplicitResource
            && (resourceType.originalDecorator === 'noView' || resourceType.originalDecorator === 'inlineView')
            && !filePair) {
            return {
                type: resourceType.type,
                modification: {
                    insert: [[getPosition(node, code).pos, `@customElement('${name}')\n`]]
                },
                classMetadata: $class,
                runtimeImportName: 'customElement',
            };
        }
        if (isImplicitResource &&
            resourceType.type === 'customElement' &&
            numArguments === 1 &&
            isStringLiteral(decoratorArgs[0])) {
            const customName = decoratorArgs[0];
            return {
                type: resourceType.type,
                classMetadata: $class,
                implicitStatement: { pos: pos, end: node.end },
                customElementDecorator: {
                    position: getPosition(decorator, code),
                    namePosition: getPosition(customName, code)
                },
                runtimeImportName: filePair ? type : undefined,
            };
        }
    }
    else {
        if (type === 'customElement') {
            for (const m of node.members) {
                if (isStatic$auProperty(m)) {
                    tryCollectTemplateMetadataFromDefinition(m.initializer, $class, templateMetadata);
                }
                tryCollectTemplateMetadataFromStaticTemplate(m, $class, templateMetadata);
            }
            if (!isImplicitResource || !filePair)
                return;
            return {
                type,
                classMetadata: $class,
                implicitStatement: { pos: pos, end: node.end },
                runtimeImportName: type,
            };
        }
        return {
            type,
            modification: {
                insert: [[getPosition(node, code).pos, `@${type}('${name}')\n`]]
            },
            localDep: className,
            runtimeImportName: type,
        };
    }
}
function collectClassDecorators(node) {
    var _a;
    if (!canHaveDecorators(node))
        return;
    const decorators = (_a = getDecorators(node)) !== null && _a !== void 0 ? _a : [];
    if (decorators.length === 0)
        return;
    for (const d of decorators) {
        let name;
        let resourceExpression;
        if (isCallExpression(d.expression)) {
            const exp = d.expression.expression;
            if (isIdentifier(exp)) {
                name = exp.text;
                resourceExpression = d.expression;
            }
        }
        else if (isIdentifier(d.expression)) {
            name = d.expression.text;
        }
        const isViewCe = name === 'noView' || name === 'inlineView';
        if (name == null
            || !KNOWN_RESOURCE_DECORATORS.includes(name)
            || (name !== 'noView' && resourceExpression == null))
            continue;
        return {
            type: (isViewCe ? 'customElement' : name),
            expression: resourceExpression,
            originalDecorator: name,
        };
    }
}
function getPosition(node, code) {
    return { pos: ensureTokenStart(node.pos, code), end: node.end };
}

function stripMetaData(rawHtml) {
    const deps = [];
    const depsAliases = {};
    let shadowMode = null;
    let containerless = false;
    let hasSlot = false;
    let capture = false;
    const bindables = {};
    const aliases = [];
    const toRemove = [];
    const tree = parse5.parseFragment(rawHtml, { sourceCodeLocationInfo: true });
    traverse(tree, node => {
        stripImport(node, (dep, aliases, ranges) => {
            if (dep) {
                deps.push(dep);
                if (aliases != null) {
                    depsAliases[dep] = { ...depsAliases[dep], ...aliases };
                }
            }
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
        stripCapture(node, (ranges) => {
            capture = true;
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
    return { html, deps, depsAliases, shadowMode, containerless, hasSlot, bindables, aliases, capture };
}
function traverse(tree, cb) {
    tree.childNodes.forEach((n) => {
        var _a;
        const ne = n;
        if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) {
            return;
        }
        cb(ne);
        if (ne.childNodes)
            traverse(ne, cb);
        if ((_a = n.content) === null || _a === void 0 ? void 0 : _a.childNodes)
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
function stripImport(node, cb) {
    return stripTag(node, ['import', 'require'], (attrs, ranges) => {
        const aliases = { __MAIN__: null };
        let aliasCount = 0;
        Object.keys(attrs).forEach(attr => {
            if (attr === 'from') {
                return;
            }
            if (attr === 'as') {
                aliases.__MAIN__ = attrs[attr];
                aliasCount++;
            }
            else if (attr.endsWith('.as')) {
                aliases[attr.slice(0, -3)] = attrs[attr];
                aliasCount++;
            }
        });
        cb(attrs.from, aliasCount > 0 ? aliases : null, ranges);
    });
}
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
function stripContainerlesss(node, cb) {
    return stripTag(node, 'containerless', (attrs, ranges) => {
        cb(ranges);
    }) || stripAttribute(node, 'template', 'containerless', (value, ranges) => {
        cb(ranges);
    });
}
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
function stripCapture(node, cb) {
    return stripTag(node, 'capture', (attrs, ranges) => {
        cb(ranges);
    }) || stripAttribute(node, 'template', 'capture', (value, ranges) => {
        cb(ranges);
    });
}
function toBindingMode(mode) {
    if (mode) {
        const normalizedMode = kernel.kebabCase(mode);
        if (normalizedMode === 'one-time')
            return runtimeHtml.BindingMode.oneTime;
        if (normalizedMode === 'one-way' || normalizedMode === 'to-view')
            return runtimeHtml.BindingMode.toView;
        if (normalizedMode === 'from-view')
            return runtimeHtml.BindingMode.fromView;
        if (normalizedMode === 'two-way')
            return runtimeHtml.BindingMode.twoWay;
    }
}

function resolveFilePath(unit, relativeOrAbsolutePath) {
    if (relativeOrAbsolutePath.startsWith('.')) {
        return path__namespace.resolve(unit.base || '', path__namespace.dirname(unit.path), relativeOrAbsolutePath);
    }
    else {
        return path__namespace.resolve(unit.base || '', relativeOrAbsolutePath);
    }
}
function fileExists(unit, relativeOrAbsolutePath) {
    const p = resolveFilePath(unit, relativeOrAbsolutePath);
    try {
        const stats = fs__namespace.statSync(p);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
function readFile(unit, relativeOrAbsolutePath) {
    const p = resolveFilePath(unit, relativeOrAbsolutePath);
    return fs__namespace.readFileSync(p, 'utf-8');
}

function preprocessHtmlTemplate(unit, options, hasViewModel, _fileExists = fileExists) {
    const name = resourceName(unit.path);
    const stripped = stripMetaData(unit.contents);
    const { html, deps, depsAliases, containerless, hasSlot, bindables, aliases, capture } = stripped;
    let { shadowMode } = stripped;
    if (unit.filePair) {
        const basename = path__namespace.basename(unit.filePair, path__namespace.extname(unit.filePair));
        if (!deps.some(dep => options.cssExtensions.some(e => dep === `./${basename}${e}`))) {
            deps.unshift(`./${unit.filePair}`);
        }
    }
    if (options.defaultShadowOptions && shadowMode === null) {
        shadowMode = options.defaultShadowOptions.mode;
    }
    const useCSSModule = shadowMode !== null ? false : options.useCSSModule;
    const viewDeps = [];
    const cssDeps = [];
    const cssModuleDeps = [];
    const statements = [];
    let registrationImported = false;
    let aliasedModule = 0;
    deps.forEach((d, i) => {
        var _a, _b;
        const aliases = (_a = depsAliases[d]) !== null && _a !== void 0 ? _a : {};
        let ext = path__namespace.extname(d);
        if (!ext) {
            if (_fileExists(unit, `${d}.ts`)) {
                ext = '.ts';
            }
            else if (_fileExists(unit, `${d}.js`)) {
                ext = '.js';
            }
            d = d + ext;
        }
        if (!ext || ext === '.js' || ext === '.ts') {
            const { __MAIN__: main, ...others } = aliases;
            const hasAliases = main != null || Object.keys(others).length > 0;
            if (hasAliases && aliasedModule++ === 0) {
                statements.push(`import { aliasedResourcesRegistry as $$arr } from '@aurelia/kernel';\n`);
            }
            statements.push(`import * as d${i} from ${s(d)};\n`);
            if (hasAliases) {
                viewDeps.push(`$$arr(d${i}, ${s(main)}${Object.keys(others).length > 0 ? `, ${s(others)}` : ''})`);
            }
            else {
                viewDeps.push(`d${i}`);
            }
            return;
        }
        if (options.templateExtensions.includes(ext)) {
            const { __MAIN__: main } = aliases;
            const hasAliases = main != null;
            if (hasAliases && aliasedModule++ === 0) {
                statements.push(`import { aliasedResourcesRegistry as $$arr } from '@aurelia/kernel';\n`);
                statements.push(`function __get_el__(m) { let e; m.register({ register(el) { e = el; } }); return { default: e }; }\n`);
            }
            statements.push(`import * as d${i} from ${s(((_b = options.transformHtmlImportSpecifier) !== null && _b !== void 0 ? _b : (s => s))(d))};\n`);
            if (hasAliases) {
                viewDeps.push(`$$arr(__get_el__(d${i}), ${s(main)})`);
            }
            else {
                viewDeps.push(`d${i}`);
            }
            return;
        }
        if (options.cssExtensions.includes(ext)) {
            if (shadowMode !== null) {
                const stringModuleId = options.stringModuleWrap ? options.stringModuleWrap(d) : d;
                statements.push(`import d${i} from ${s(stringModuleId)};\n`);
                cssDeps.push(`d${i}`);
            }
            else if (useCSSModule || path__namespace.basename(d, ext).endsWith('.module')) {
                statements.push(`import d${i} from ${s(d)};\n`);
                cssModuleDeps.push(`d${i}`);
            }
            else {
                statements.push(`import ${s(d)};\n`);
            }
            return;
        }
        if (!registrationImported) {
            statements.push(`import { Registration } from '@aurelia/kernel';\n`);
            registrationImported = true;
        }
        statements.push(`import d${i} from ${s(d)};\n`);
        viewDeps.push(`Registration.defer('${ext}', d${i})`);
    });
    const m = modifyCode('', unit.path);
    const hmrEnabled = !hasViewModel && options.hmr && process.env.NODE_ENV !== 'production';
    m.append(`import { CustomElement } from '@aurelia/runtime-html';\n`);
    if (cssDeps.length > 0 && shadowMode !== null) {
        m.append(`import { shadowCSS } from '@aurelia/runtime-html';\n`);
        viewDeps.push(`shadowCSS(${cssDeps.join(', ')})`);
    }
    if (cssModuleDeps.length > 0) {
        m.append(`import { cssModules } from '@aurelia/runtime-html';\n`);
        viewDeps.push(`cssModules(${cssModuleDeps.join(', ')})`);
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
    if (capture) {
        m.append(`export const capture = true;\n`);
    }
    m.append(`export const bindables = ${(Object.keys(bindables).length > 0
        ? JSON.stringify(Object.keys(bindables).reduce((acc, b) => { acc[b] = { name: b, ...bindables[b] }; return acc; }, Object.create(null)))
        : '{}')};\n`);
    if (aliases.length > 0) {
        m.append(`export const aliases = ${JSON.stringify(aliases)};\n`);
    }
    const definitionProperties = [
        'name',
        'template',
        'dependencies',
        shadowMode !== null ? 'shadowOptions' : '',
        containerless ? 'containerless' : '',
        capture ? 'capture' : '',
        'bindables',
        aliases.length > 0 ? 'aliases' : '',
    ].filter(Boolean);
    const definition = `{ ${definitionProperties.join(', ')} }`;
    if (hmrEnabled) {
        m.append(`const _e = CustomElement.define(${definition});
      export function register(container) {
        container.register(_e);
      }`);
    }
    else {
        m.append(`let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define(${definition});
  }
  container.register(_e);
}
`);
    }
    if (hmrEnabled && options.getHmrCode) {
        m.append(options.getHmrCode('_e', options.hmrModule));
    }
    const { code, map } = m.transform();
    map.sourcesContent = [unit.contents];
    return { code, map };
}
function s(input) {
    return JSON.stringify(input);
}

const defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
const defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
const defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];
function preprocessOptions(options = {}) {
    const { cssExtensions = [], jsExtensions = [], templateExtensions = [], useCSSModule = false, hmr = true, enableConventions = true, hmrModule = 'module', experimentalTemplateTypeCheck = false, ...others } = options;
    return {
        cssExtensions: Array.from(new Set([...defaultCssExtensions, ...cssExtensions])).sort(),
        jsExtensions: Array.from(new Set([...defaultJsExtensions, ...jsExtensions])).sort(),
        templateExtensions: Array.from(new Set([...defaultTemplateExtensions, ...templateExtensions])).sort(),
        useCSSModule,
        hmr,
        hmrModule,
        enableConventions,
        experimentalTemplateTypeCheck,
        ...others
    };
}

function preprocess(unit, options, _fileExists = fileExists, _readFile = readFile) {
    const ext = path__namespace.extname(unit.path);
    const basename = path__namespace.basename(unit.path, ext);
    const allOptions = preprocessOptions(options);
    const templateExtensions = allOptions.templateExtensions;
    const useProcessedFilePairFilename = allOptions.useProcessedFilePairFilename;
    unit.readFile = (path) => _readFile(unit, path);
    if (allOptions.enableConventions && templateExtensions.includes(ext)) {
        for (const ce of allOptions.cssExtensions) {
            let filePair = `${basename}.module${ce}`;
            if (!_fileExists(unit, `./${filePair}`)) {
                filePair = `${basename}${ce}`;
                if (!_fileExists(unit, `./${filePair}`))
                    continue;
            }
            unit.filePair = useProcessedFilePairFilename ? `${path__namespace.basename(filePair, path__namespace.extname(filePair))}.css` : filePair;
            break;
        }
        return preprocessHtmlTemplate(unit, allOptions, allOptions.jsExtensions.some(e => _fileExists(unit, `./${basename}${e}`)), _fileExists);
    }
    if (allOptions.jsExtensions.includes(ext)) {
        for (const te of templateExtensions) {
            const filePair = `${basename}${te}`;
            if (!_fileExists(unit, `./${filePair}`))
                continue;
            unit.filePair = useProcessedFilePairFilename ? `${basename}.html` : filePair;
            for (const te of templateExtensions) {
                const viewPair = `${basename}-view${te}`;
                if (!_fileExists(unit, `./${viewPair}`))
                    continue;
                unit.filePair = useProcessedFilePairFilename ? `${basename}-view.html` : viewPair;
                break;
            }
            break;
        }
        return preprocessResource(unit, allOptions);
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
//# sourceMappingURL=index.cjs.map
