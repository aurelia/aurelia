"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ParameterDeclaration = exports.$ConstructorDeclaration = exports.MethodDefinitionRecord = exports.$ArrowFunction = exports.$FunctionDeclarationInstantiation = exports.$FunctionDeclaration = exports.$FunctionExpression = exports.$FormalParameterList = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const environment_record_js_1 = require("../types/environment-record.js");
const string_js_1 = require("../types/string.js");
const undefined_js_1 = require("../types/undefined.js");
const function_js_1 = require("../types/function.js");
const object_js_1 = require("../types/object.js");
const empty_js_1 = require("../types/empty.js");
const arguments_js_1 = require("../exotics/arguments.js");
const iteration_js_1 = require("../globals/iteration.js");
const _shared_js_1 = require("./_shared.js");
const modules_js_1 = require("./modules.js");
const statements_js_1 = require("./statements.js");
const operations_js_1 = require("../operations.js");
const property_descriptor_js_1 = require("../types/property-descriptor.js");
const boolean_js_1 = require("../types/boolean.js");
class $FormalParameterList extends Array {
    constructor(nodes, parent, ctx) {
        super();
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsexpression
        // 14.1.5 Static Semantics: ContainsExpression
        this.ContainsExpression = false;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-expectedargumentcount
        // 14.1.7 Static Semantics: ExpectedArgumentCount
        this.ExpectedArgumentCount = 0;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasinitializer
        // 14.1.8 Static Semantics: HasInitializer
        this.HasInitializer = false;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-issimpleparameterlist
        // 14.1.13 Static Semantics: IsSimpleParameterList
        this.IsSimpleParameterList = true;
        this.hasDuplicates = false;
        if (nodes === void 0) {
            this.BoundNames = kernel_1.emptyArray;
        }
        else {
            const BoundNames = this.BoundNames = [];
            const seenNames = new Set();
            let boundNamesLen = 0;
            let cur;
            let curBoundNames;
            let curBoundName;
            for (let i = 0, ii = nodes.length; i < ii; ++i) {
                cur = super[i] = new $ParameterDeclaration(nodes[i], parent, ctx, i);
                curBoundNames = cur.BoundNames;
                for (let j = 0, jj = curBoundNames.length; j < jj; ++j) {
                    curBoundName = curBoundNames[j];
                    if (seenNames.has(curBoundName['[[Value]]'])) {
                        this.hasDuplicates = true;
                    }
                    else {
                        seenNames.add(curBoundName['[[Value]]']);
                    }
                    BoundNames[boundNamesLen++] = curBoundName;
                }
                if (cur.ContainsExpression && !this.ContainsExpression) {
                    this.ContainsExpression = true;
                }
                if (cur.HasInitializer && !this.HasInitializer) {
                    this.HasInitializer = true;
                    this.ExpectedArgumentCount = i;
                }
                if (!cur.IsSimpleParameterList && this.IsSimpleParameterList) {
                    this.IsSimpleParameterList = false;
                }
            }
            if (!this.HasInitializer) {
                this.ExpectedArgumentCount = nodes.length;
            }
        }
    }
}
exports.$FormalParameterList = $FormalParameterList;
class $FunctionExpression {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.FunctionExpression`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
        // 14.1.11 Static Semantics: IsConstantDeclaration
        this.IsConstantDeclaration = false;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
        // 14.1.12 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = true;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        const DirectivePrologue = this.DirectivePrologue = _shared_js_1.GetDirectivePrologue(node.body.statements);
        if (DirectivePrologue.ContainsUseStrict) {
            ctx |= 65536 /* InStrictMode */;
        }
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new statements_js_1.$Block(node.body, this, ctx, -1);
        this.BoundNames = kernel_1.emptyArray;
        this.ContainsUseStrict = DirectivePrologue.ContainsUseStrict === true;
        this.HasName = $name !== void 0;
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
        if (!_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Async)) {
            if (node.asteriskToken === void 0) {
                this.functionKind = 0 /* normal */;
            }
            else {
                this.functionKind = 4 /* generator */;
            }
        }
        else if (node.asteriskToken === void 0) {
            this.functionKind = 8 /* async */;
        }
        else {
            this.functionKind = 12 /* asyncGenerator */;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.FunctionExpression; }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        return EvaluateBody(this, ctx, functionObject, argumentsList);
    }
    Evaluate(ctx) {
        switch (this.functionKind) {
            case 0 /* normal */:
                return this.$Evaluate(ctx);
            case 4 /* generator */:
                return this.$EvaluateGenerator(ctx);
            case 12 /* asyncGenerator */:
                return this.$EvaluateAsyncGenerator(ctx);
            case 8 /* async */:
                return this.$EvaluateAsync(ctx);
        }
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluation
    // 14.1.22 Runtime Semantics: Evaluation
    $Evaluate(ctx) {
        var _a, _b;
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.$Evaluate(#${ctx.id})`);
        // FunctionExpression :
        //     function ( FormalParameters ) { FunctionBody }
        // 1. If the function code for FunctionExpression is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        // 3. Let closure be FunctionCreate(Normal, FormalParameters, FunctionBody, scope, strict).
        // 4. Perform MakeConstructor(closure).
        // 5. Set closure.[[SourceText]] to the source text matched by FunctionExpression.
        // 6. Return closure.
        // FunctionExpression :
        //     function BindingIdentifier ( FormalParameters ) { FunctionBody }
        // 1. If the function code for FunctionExpression is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let scope be the running execution context's LexicalEnvironment.
        const scope = ctx.LexicalEnvironment;
        // 3. Let funcEnv be NewDeclarativeEnvironment(scope).
        const funcEnv = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, scope);
        // 4. Let envRec be funcEnv's EnvironmentRecord.
        // 5. Let name be StringValue of BindingIdentifier.
        const name = (_b = (_a = this.$name) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : void 0;
        if (name !== void 0) {
            // 6. Perform envRec.CreateImmutableBinding(name, false).
            funcEnv.CreateImmutableBinding(ctx, name, intrinsics.false);
        }
        // 7. Let closure be FunctionCreate(Normal, FormalParameters, FunctionBody, funcEnv, strict).
        const closure = function_js_1.$Function.FunctionCreate(ctx, 'normal', this, funcEnv, strict);
        // 8. Perform MakeConstructor(closure).
        closure.MakeConstructor(ctx);
        if (name !== void 0) {
            // 9. Perform SetFunctionName(closure, name).
            closure.SetFunctionName(ctx, name);
        }
        // 10. Set closure.[[SourceText]] to the source text matched by FunctionExpression.
        closure['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        if (name !== void 0) {
            // 11. Perform envRec.InitializeBinding(name, closure).
            funcEnv.InitializeBinding(ctx, name, closure);
        }
        // 12. Return closure.
        return closure;
    }
    // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-runtime-semantics-evaluation
    // 14.4.14 Runtime Semantics: Evaluation
    $EvaluateGenerator(ctx) {
        var _a, _b;
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.$EvaluateGenerator(#${ctx.id})`);
        // GeneratorExpression :
        //     function * ( FormalParameters ) { GeneratorBody }
        // 1. If the function code for this GeneratorExpression is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        // 3. Let closure be GeneratorFunctionCreate(Normal, FormalParameters, GeneratorBody, scope, strict).
        // 4. Let prototype be ObjectCreate(%GeneratorPrototype%).
        // 5. Perform DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        // 6. Set closure.[[SourceText]] to the source text matched by GeneratorExpression.
        // 7. Return closure.
        // GeneratorExpression :
        //     function * BindingIdentifier ( FormalParameters ) { GeneratorBody }
        // 1. If the function code for this GeneratorExpression is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let scope be the running execution context's LexicalEnvironment.
        const scope = ctx.LexicalEnvironment;
        // 3. Let funcEnv be NewDeclarativeEnvironment(scope).
        const funcEnv = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, scope);
        // 4. Let envRec be funcEnv's EnvironmentRecord.
        // 5. Let name be StringValue of BindingIdentifier.
        const name = (_b = (_a = this.$name) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : void 0;
        if (name !== void 0) {
            // 6. Perform envRec.CreateImmutableBinding(name, false).
            funcEnv.CreateImmutableBinding(ctx, name, intrinsics.false);
        }
        // 7. Let closure be GeneratorFunctionCreate(Normal, FormalParameters, GeneratorBody, funcEnv, strict).
        const closure = function_js_1.$Function.GeneratorFunctionCreate(ctx, 'normal', this, funcEnv, strict);
        // 8. Let prototype be ObjectCreate(%GeneratorPrototype%).
        const prototype = object_js_1.$Object.ObjectCreate(ctx, 'Generator', intrinsics['%GeneratorPrototype%']);
        // 9. Perform DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        const $DefinePropertyOrThrowResult = operations_js_1.$DefinePropertyOrThrow(ctx, closure, intrinsics.$prototype, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.$prototype, {
            '[[Value]]': prototype,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.false,
        }));
        if ($DefinePropertyOrThrowResult.isAbrupt) {
            return $DefinePropertyOrThrowResult.enrichWith(ctx, this);
        }
        if (name !== void 0) {
            // 10. Perform SetFunctionName(closure, name).
            closure.SetFunctionName(ctx, name);
            // 11. Perform envRec.InitializeBinding(name, closure).
            funcEnv.InitializeBinding(ctx, name, closure);
        }
        // 12. Set closure.[[SourceText]] to the source text matched by GeneratorExpression.
        closure['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 13. Return closure.
        return closure;
    }
    // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-definitions-evaluation
    // 14.5.14 Runtime Semantics: Evaluation
    $EvaluateAsyncGenerator(ctx) {
        var _a, _b;
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.$EvaluateAsyncGenerator(#${ctx.id})`);
        // AsyncGeneratorExpression :
        //     async function * ( FormalParameters ) { AsyncGeneratorBody }
        // 1. If the function code for this AsyncGeneratorExpression is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        // 3. Let closure be ! AsyncGeneratorFunctionCreate(Normal, FormalParameters, AsyncGeneratorBody, scope, strict).
        // 4. Let prototype be ! ObjectCreate(%AsyncGeneratorPrototype%).
        // 5. Perform ! DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        // 6. Set closure.[[SourceText]] to the source text matched by AsyncGeneratorExpression.
        // 7. Return closure.
        // AsyncGeneratorExpression :
        //     async function * BindingIdentifier ( FormalParameters ) { AsyncGeneratorBody }
        // 1. If the function code for this AsyncGeneratorExpression is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let scope be the running execution context's LexicalEnvironment.
        const scope = ctx.LexicalEnvironment;
        // 3. Let funcEnv be ! NewDeclarativeEnvironment(scope).
        const funcEnv = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, scope);
        // 4. Let envRec be funcEnv's EnvironmentRecord.
        // 5. Let name be StringValue of BindingIdentifier.
        const name = (_b = (_a = this.$name) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : void 0;
        if (name !== void 0) {
            // 6. Perform ! envRec.CreateImmutableBinding(name).
            funcEnv.CreateImmutableBinding(ctx, name, intrinsics.false); // TODO: we sure about this?
        }
        // 7. Let closure be ! AsyncGeneratorFunctionCreate(Normal, FormalParameters, AsyncGeneratorBody, funcEnv, strict).
        const closure = function_js_1.$Function.AsyncGeneratorFunctionCreate(ctx, 'normal', this, funcEnv, strict);
        // 8. Let prototype be ! ObjectCreate(%AsyncGeneratorPrototype%).
        const prototype = object_js_1.$Object.ObjectCreate(ctx, 'AsyncGenerator', intrinsics['%AsyncGeneratorPrototype%']);
        // 9. Perform ! DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        const $DefinePropertyOrThrowResult = operations_js_1.$DefinePropertyOrThrow(ctx, closure, intrinsics.$prototype, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.$prototype, {
            '[[Value]]': prototype,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.false,
        }));
        if ($DefinePropertyOrThrowResult.isAbrupt) {
            return $DefinePropertyOrThrowResult.enrichWith(ctx, this);
        }
        if (name !== void 0) {
            // 10. Perform SetFunctionName(closure, name).
            closure.SetFunctionName(ctx, name);
            // 11. Perform envRec.InitializeBinding(name, closure).
            funcEnv.InitializeBinding(ctx, name, closure);
        }
        // 12. Set closure.[[SourceText]] to the source text matched by AsyncGeneratorExpression.
        closure['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 13. Return closure.
        return closure;
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-runtime-semantics-evaluation
    // 14.7.14 Runtime Semantics: Evaluation
    $EvaluateAsync(ctx) {
        var _a, _b;
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.$EvaluateAsync(#${ctx.id})`);
        // AsyncFunctionExpression :
        //     async function ( FormalParameters ) { AsyncFunctionBody }
        // 1. If the function code for AsyncFunctionExpression is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        // 3. Let closure be ! AsyncFunctionCreate(Normal, FormalParameters, AsyncFunctionBody, scope, strict).
        // 4. Set closure.[[SourceText]] to the source text matched by AsyncFunctionExpression.
        // 5. Return closure.
        // AsyncFunctionExpression :
        //     async function BindingIdentifier ( FormalParameters ) { AsyncFunctionBody }
        // 1. If the function code for AsyncFunctionExpression is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        const scope = ctx.LexicalEnvironment;
        // 3. Let funcEnv be ! NewDeclarativeEnvironment(scope).
        const funcEnv = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, scope);
        // 4. Let envRec be funcEnv's EnvironmentRecord.
        // 5. Let name be StringValue of BindingIdentifier.
        const name = (_b = (_a = this.$name) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : void 0;
        if (name !== void 0) {
            // 6. Perform ! envRec.CreateImmutableBinding(name).
            funcEnv.CreateImmutableBinding(ctx, name, intrinsics.false); // TODO: we sure about this?
        }
        // 7. Let closure be ! AsyncFunctionCreate(Normal, FormalParameters, AsyncFunctionBody, funcEnv, strict).
        const closure = function_js_1.$Function.AsyncFunctionCreate(ctx, 'normal', this, funcEnv, strict);
        if (name !== void 0) {
            // 8. Perform ! SetFunctionName(closure, name).
            closure.SetFunctionName(ctx, name);
            // 9. Perform ! envRec.InitializeBinding(name, closure).
            funcEnv.InitializeBinding(ctx, name, closure);
        }
        // 10. Set closure.[[SourceText]] to the source text matched by AsyncFunctionExpression.
        closure['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 11. Return closure.
        return closure;
    }
    EvaluateNamed(ctx, name) {
        ctx.checkTimeout();
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-namedevaluation
        // 14.1.21 Runtime Semantics: NamedEvaluation
        // FunctionExpression :
        //     function ( FormalParameters ) { FunctionBody }
        // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-runtime-semantics-namedevaluation
        // 14.4.13 Runtime Semantics: NamedEvaluation
        // GeneratorExpression :
        //     function * ( FormalParameters ) { GeneratorBody }
        // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-definitions-namedevaluation
        // 14.5.13 Runtime Semantics: NamedEvaluation
        // AsyncGeneratorExpression :
        //     async function * ( FormalParameters ) { AsyncGeneratorBody }
        // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-runtime-semantics-namedevaluation
        // 14.7.13 Runtime Semantics: NamedEvaluation
        // AsyncFunctionExpression :
        //     async function ( FormalParameters ) { AsyncFunctionBody }
        // FunctionExpression : function ( FormalParameters ) { FunctionBody }
        // 1. Let closure be the result of evaluating this FunctionExpression.
        // 1. Let closure be the result of evaluating this GeneratorExpression.
        // 1. Let closure be the result of evaluating this AsyncGeneratorExpression.
        // 1. Let closure be the result of evaluating this AsyncFunctionExpression.
        const closure = this.Evaluate(ctx);
        if (closure.isAbrupt) {
            return closure.enrichWith(ctx, this);
        }
        // 2. Perform SetFunctionName(closure, name).
        closure.SetFunctionName(ctx, name);
        // 3. Return closure.
        return closure;
    }
}
exports.$FunctionExpression = $FunctionExpression;
class $FunctionDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.FunctionDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
        // 14.1.11 Static Semantics: IsConstantDeclaration
        // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isconstantdeclaration
        // 14.4.7 Static Semantics: IsConstantDeclaration
        // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isconstantdeclaration
        // 14.5.7 Static Semantics: IsConstantDeclaration
        // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsConstantDeclaration
        // 14.7.7 Static Semantics: IsConstantDeclaration
        this.IsConstantDeclaration = false;
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
        // 14.1.12 Static Semantics: IsFunctionDefinition
        // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isfunctiondefinition
        // 14.4.8 Static Semantics: IsFunctionDefinition
        // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isfunctiondefinition
        // 14.5.8 Static Semantics: IsFunctionDefinition
        // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsFunctionDefinition
        // 14.7.8 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = true;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
        // 15.2.3.9 Static Semantics: ModuleRequests
        this.ModuleRequests = kernel_1.emptyArray;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const intrinsics = realm['[[Intrinsics]]'];
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const DirectivePrologue = this.DirectivePrologue = _shared_js_1.GetDirectivePrologue(node.body.statements);
        if (this.DirectivePrologue.ContainsUseStrict) {
            ctx |= 65536 /* InStrictMode */;
        }
        this.$decorators = _shared_js_1.$decoratorList(node.decorators, this, ctx);
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new statements_js_1.$Block(node.body, this, ctx, -1);
        this.ContainsUseStrict = DirectivePrologue.ContainsUseStrict === true;
        const HasName = this.HasName = $name !== void 0;
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
        if ($name === void 0) {
            this.PropName = new undefined_js_1.$Undefined(realm);
        }
        else {
            this.PropName = $name.PropName;
        }
        if (_shared_js_1.hasBit(ctx, 4096 /* InExport */)) {
            if (_shared_js_1.hasBit(this.modifierFlags, typescript_1.ModifierFlags.Default)) {
                if (HasName) {
                    const [localName] = $name.BoundNames;
                    const BoundNames = this.BoundNames = [localName, intrinsics['*default*']];
                    this.ExportedBindings = BoundNames;
                    this.ExportedNames = [intrinsics['default']];
                    this.ExportEntries = [
                        new modules_js_1.ExportEntryRecord(
                        /* source */ this, 
                        /* ExportName */ intrinsics['default'], 
                        /* ModuleRequest */ intrinsics.null, 
                        /* ImportName */ intrinsics.null, 
                        /* LocalName */ localName),
                    ];
                }
                else {
                    const BoundNames = this.BoundNames = [intrinsics['*default*']];
                    this.ExportedBindings = BoundNames;
                    this.ExportedNames = [intrinsics['default']];
                    this.ExportEntries = [
                        new modules_js_1.ExportEntryRecord(
                        /* source */ this, 
                        /* ExportName */ intrinsics['default'], 
                        /* ModuleRequest */ intrinsics.null, 
                        /* ImportName */ intrinsics.null, 
                        /* LocalName */ intrinsics['*default*']),
                    ];
                }
            }
            else {
                // Must have a name, so we assume it does
                const BoundNames = this.BoundNames = $name.BoundNames;
                const [localName] = BoundNames;
                this.ExportedBindings = BoundNames;
                this.ExportedNames = BoundNames;
                this.ExportEntries = [
                    new modules_js_1.ExportEntryRecord(
                    /* source */ this, 
                    /* ExportName */ localName, 
                    /* ModuleRequest */ intrinsics.null, 
                    /* ImportName */ intrinsics.null, 
                    /* LocalName */ localName),
                ];
            }
        }
        else {
            // Must have a name, so we assume it does
            this.BoundNames = $name.BoundNames;
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
        }
        if (!_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Async)) {
            if (node.asteriskToken === void 0) {
                this.functionKind = 0 /* normal */;
            }
            else {
                this.functionKind = 4 /* generator */;
            }
        }
        else if (node.asteriskToken === void 0) {
            this.functionKind = 8 /* async */;
        }
        else {
            this.functionKind = 12 /* asyncGenerator */;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.FunctionDeclaration; }
    InstantiateFunctionObject(ctx, Scope) {
        switch (this.functionKind) {
            case 0 /* normal */:
                return this.$InstantiateFunctionObject(ctx, Scope);
            case 4 /* generator */:
                return this.$InstantiateGeneratorFunctionObject(ctx, Scope);
            case 12 /* asyncGenerator */:
                return this.$InstantiateAsyncGeneratorFunctionObject(ctx, Scope);
            case 8 /* async */:
                return this.$InstantiateAsyncFunctionObject(ctx, Scope);
        }
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-instantiatefunctionobject
    // 14.1.20 Runtime Semantics: InstantiateFunctionObject
    $InstantiateFunctionObject(ctx, Scope) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.$InstantiateFunctionObject(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // FunctionDeclaration :
        //     function ( FormalParameters ) { FunctionBody }
        // 1. Let F be FunctionCreate(Normal, FormalParameters, FunctionBody, scope, true).
        // 2. Perform MakeConstructor(F).
        // 3. Perform SetFunctionName(F, "default").
        // 4. Set F.[[SourceText]] to the source text matched by FunctionDeclaration.
        // 5. Return F.
        // FunctionDeclaration :
        //     function BindingIdentifier ( FormalParameters ) { FunctionBody }
        // 1. If the function code for FunctionDeclaration is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let name be StringValue of BindingIdentifier.
        const name = this.$name === void 0 ? intrinsics.default : this.$name.StringValue;
        // 3. Let F be FunctionCreate(Normal, FormalParameters, FunctionBody, scope, strict).
        const F = function_js_1.$Function.FunctionCreate(ctx, 'normal', this, Scope, strict);
        // 4. Perform MakeConstructor(F).
        F.MakeConstructor(ctx);
        // 5. Perform SetFunctionName(F, name).
        F.SetFunctionName(ctx, name);
        // 6. Set F.[[SourceText]] to the source text matched by FunctionDeclaration.
        F['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 7. Return F.
        return F;
    }
    // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-runtime-semantics-instantiatefunctionobject
    // 14.4.11 Runtime Semantics: InstantiateFunctionObject
    $InstantiateGeneratorFunctionObject(ctx, Scope) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.$InstantiateFunctionObject(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // GeneratorDeclaration :
        //     function * ( FormalParameters ) { GeneratorBody }
        // 1. Let F be GeneratorFunctionCreate(Normal, FormalParameters, GeneratorBody, scope, true).
        // 2. Let prototype be ObjectCreate(%GeneratorPrototype%).
        // 3. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        // 4. Perform SetFunctionName(F, "default").
        // 5. Set F.[[SourceText]] to the source text matched by GeneratorDeclaration.
        // 6. Return F.
        // GeneratorDeclaration :
        //     function * BindingIdentifier ( FormalParameters ) { GeneratorBody }
        // 1. If the function code for GeneratorDeclaration is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let name be StringValue of BindingIdentifier.
        const name = this.$name === void 0 ? intrinsics.default : this.$name.StringValue;
        // 3. Let F be GeneratorFunctionCreate(Normal, FormalParameters, GeneratorBody, scope, strict).
        const F = function_js_1.$Function.GeneratorFunctionCreate(ctx, 'normal', this, Scope, strict);
        // 4. Let prototype be ObjectCreate(%GeneratorPrototype%).
        const prototype = object_js_1.$Object.ObjectCreate(ctx, 'Generator', intrinsics['%GeneratorPrototype%']);
        // 5. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        const $DefinePropertyOrThrowResult = operations_js_1.$DefinePropertyOrThrow(ctx, F, intrinsics.$prototype, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.$prototype, {
            '[[Value]]': prototype,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.false,
        }));
        if ($DefinePropertyOrThrowResult.isAbrupt) {
            return $DefinePropertyOrThrowResult.enrichWith(ctx, this);
        }
        // 6. Perform SetFunctionName(F, name).
        F.SetFunctionName(ctx, name);
        // 7. Set F.[[SourceText]] to the source text matched by GeneratorDeclaration.
        F['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 8. Return F.
        return F;
    }
    // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-definitions-instantiatefunctionobject
    // 14.5.11 Runtime Semantics: InstantiateFunctionObject
    $InstantiateAsyncGeneratorFunctionObject(ctx, Scope) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.$InstantiateFunctionObject(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // AsyncGeneratorDeclaration :
        //     async function * ( FormalParameters ) { AsyncGeneratorBody }
        // 1. If the function code for AsyncGeneratorDeclaration is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let F be AsyncGeneratorFunctionCreate(Normal, FormalParameters, AsyncGeneratorBody, scope, strict).
        // 3. Let prototype be ObjectCreate(%AsyncGeneratorPrototype%).
        // 4. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        // 5. Perform SetFunctionName(F, "default").
        // 6. Set F.[[SourceText]] to the source text matched by AsyncGeneratorDeclaration.
        // 7. Return F.
        // AsyncGeneratorDeclaration :
        //     async function * BindingIdentifier ( FormalParameters ) { AsyncGeneratorBody }
        // 1. If the function code for AsyncGeneratorDeclaration is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let name be StringValue of BindingIdentifier.
        const name = this.$name === void 0 ? intrinsics.default : this.$name.StringValue;
        // 3. Let F be ! AsyncGeneratorFunctionCreate(Normal, FormalParameters, AsyncGeneratorBody, scope, strict).
        const F = function_js_1.$Function.GeneratorFunctionCreate(ctx, 'normal', this, Scope, strict);
        // 4. Let prototype be ! ObjectCreate(%AsyncGeneratorPrototype%).
        const prototype = object_js_1.$Object.ObjectCreate(ctx, 'AsyncGenerator', intrinsics['%AsyncGeneratorPrototype%']);
        // 5. Perform ! DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        const $DefinePropertyOrThrowResult = operations_js_1.$DefinePropertyOrThrow(ctx, F, intrinsics.$prototype, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.$prototype, {
            '[[Value]]': prototype,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.false,
        }));
        if ($DefinePropertyOrThrowResult.isAbrupt) {
            return $DefinePropertyOrThrowResult.enrichWith(ctx, this);
        }
        // 6. Perform ! SetFunctionName(F, name).
        F.SetFunctionName(ctx, name);
        // 7. Set F.[[SourceText]] to the source text matched by AsyncGeneratorDeclaration.
        F['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 8. Return F.
        return F;
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-InstantiateFunctionObject
    // 14.7.10 Runtime Semantics: InstantiateFunctionObject
    $InstantiateAsyncFunctionObject(ctx, Scope) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.$InstantiateFunctionObject(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // AsyncFunctionDeclaration :
        //     async function ( FormalParameters ) { AsyncFunctionBody }
        // 1. If the function code for AsyncFunctionDeclaration is strict mode code, let strict be true. Otherwise, let strict be false.
        // 2. Let F be ! AsyncFunctionCreate(Normal, FormalParameters, AsyncFunctionBody, scope, strict).
        // 3. Perform ! SetFunctionName(F, "default").
        // 4. Set F.[[SourceText]] to the source text matched by AsyncFunctionDeclaration.
        // 5. Return F.
        // AsyncFunctionDeclaration :
        //     async function BindingIdentifier ( FormalParameters ) { AsyncFunctionBody }
        // 1. If the function code for AsyncFunctionDeclaration is strict mode code, let strict be true. Otherwise, let strict be false.
        const strict = new boolean_js_1.$Boolean(realm, this.DirectivePrologue.ContainsUseStrict === true);
        // 2. Let name be StringValue of BindingIdentifier.
        const name = this.$name === void 0 ? intrinsics.default : this.$name.StringValue;
        // 3. Let F be ! AsyncFunctionCreate(Normal, FormalParameters, AsyncFunctionBody, scope, strict).
        const F = function_js_1.$Function.GeneratorFunctionCreate(ctx, 'normal', this, Scope, strict);
        // 4. Perform ! SetFunctionName(F, name).
        F.SetFunctionName(ctx, name);
        // 5. Set F.[[SourceText]] to the source text matched by AsyncFunctionDeclaration.
        F['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 6. Return F.
        return F;
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        return EvaluateBody(this, ctx, functionObject, argumentsList);
    }
    Evaluate(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluation
        // 14.1.22 Runtime Semantics: Evaluation
        // FunctionDeclaration :
        //     function BindingIdentifier ( FormalParameters ) { FunctionBody }
        // 1. Return NormalCompletion(empty).
        // FunctionDeclaration :
        //     function ( FormalParameters ) { FunctionBody }
        // 1. Return NormalCompletion(empty).
        return new empty_js_1.$Empty(realm, 1 /* normal */, intrinsics.empty, this);
    }
}
exports.$FunctionDeclaration = $FunctionDeclaration;
// http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
// 14.1.18 Runtime Semantics: EvaluateBody
function EvaluateBody(fn, ctx, functionObject, argumentsList) {
    ctx.checkTimeout();
    fn.logger.debug(`${fn.path}.EvaluateBody(#${ctx.id})`);
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // FunctionBody : FunctionStatementList
    // 1. Perform ? FunctionDeclarationInstantiation(functionObject, argumentsList).
    const fdiResult = $FunctionDeclarationInstantiation(ctx, functionObject, argumentsList);
    if (fdiResult.isAbrupt) {
        return fdiResult.enrichWith(ctx, fn);
    }
    // 2. Return the result of evaluating FunctionStatementList.
    return fn.$body.Evaluate(ctx); // $Block is guaranteed by $ArrowFunction.EvaluateBody
}
// http://www.ecma-international.org/ecma-262/#sec-functiondeclarationinstantiation
function $FunctionDeclarationInstantiation(ctx, func, argumentsList) {
    ctx.checkTimeout();
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let calleeContext be the running execution context.
    // 2. Let env be the LexicalEnvironment of calleeContext.
    // 3. Let envRec be env's EnvironmentRecord.
    const envRec = ctx.LexicalEnvironment;
    // 4. Let code be func.[[ECMAScriptCode]].
    const code = func['[[ECMAScriptCode]]'];
    // 5. Let strict be func.[[Strict]].
    const strict = func['[[Strict]]'];
    // 6. Let formals be func.[[FormalParameters]].
    const formals = code.$parameters;
    // 7. Let parameterNames be the BoundNames of formals.
    const parameterNames = formals.BoundNames;
    // 8. If parameterNames has any duplicate entries, let hasDuplicates be true. Otherwise, let hasDuplicates be false.
    const hasDuplicates = formals.hasDuplicates;
    // 9. Let simpleParameterList be IsSimpleParameterList of formals.
    const simpleParameterList = formals.IsSimpleParameterList;
    // 10. Let hasParameterExpressions be ContainsExpression of formals.
    const hasParameterExpressions = formals.ContainsExpression;
    // 11. Let varNames be the VarDeclaredNames of code.
    const varNames = code.VarDeclaredNames;
    // 12. Let varDeclarations be the VarScopedDeclarations of code.
    const varDeclarations = code.VarScopedDeclarations;
    // 13. Let lexicalNames be the LexicallyDeclaredNames of code.
    const lexicalNames = code.LexicallyDeclaredNames;
    // 14. Let functionNames be a new empty List.
    const functionNames = [];
    // 15. Let functionsToInitialize be a new empty List.
    const functionsToInitialize = [];
    let i = varDeclarations.length;
    let d;
    // 16. For each d in varDeclarations, in reverse list order, do
    while (--i >= 0) {
        d = varDeclarations[i];
        // 16. a. If d is neither a VariableDeclaration nor a ForBinding nor a BindingIdentifier, then
        if (d instanceof $FunctionDeclaration) {
            // 16. a. i. Assert: d is either a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration.
            // 16. a. ii. Let fn be the sole element of the BoundNames of d.
            const [fn] = d.BoundNames;
            // 16. a. iii. If fn is not an element of functionNames, then
            if (!functionNames.some(x => x.is(fn))) {
                // 16. a. iii. 1. Insert fn as the first element of functionNames.
                functionNames.unshift(fn);
                // 16. a. iii. 2. NOTE: If there are multiple function declarations for the same name, the last declaration is used.
                // 16. a. iii. 3. Insert d as the first element of functionsToInitialize.
                functionsToInitialize.unshift(d);
            }
        }
    }
    // 17. Let argumentsObjectNeeded be true.
    let argumentsObjectNeeded = true;
    // 18. If func.[[ThisMode]] is lexical, then
    if (func['[[ThisMode]]'] === 'lexical') {
        // 18. a. NOTE: Arrow functions never have an arguments objects.
        // 18. b. Set argumentsObjectNeeded to false.
        argumentsObjectNeeded = false;
    }
    // 19. Else if "arguments" is an element of parameterNames, then
    else if (parameterNames.some(x => x['[[Value]]'] === 'arguments')) {
        // 19. a. Set argumentsObjectNeeded to false.
        argumentsObjectNeeded = false;
    }
    // 20. Else if hasParameterExpressions is false, then
    else if (!hasParameterExpressions) {
        // 20. a. If "arguments" is an element of functionNames or if "arguments" is an element of lexicalNames, then
        if (functionNames.some(x => x['[[Value]]'] === 'arguments') || lexicalNames.some(x => x['[[Value]]'] === 'arguments')) {
            // 20. a. i. Set argumentsObjectNeeded to false.
            argumentsObjectNeeded = false;
        }
    }
    // 21. For each String paramName in parameterNames, do
    for (const paramName of parameterNames) {
        // 21. a. Let alreadyDeclared be envRec.HasBinding(paramName).
        const alreadyDeclared = envRec.HasBinding(ctx, paramName);
        // 21. b. NOTE: Early errors ensure that duplicate parameter names can only occur in non-strict functions that do not have parameter default values or rest parameters.
        // 21. c. If alreadyDeclared is false, then
        if (alreadyDeclared.isFalsey) {
            // 21. c. i. Perform ! envRec.CreateMutableBinding(paramName, false).
            envRec.CreateMutableBinding(ctx, paramName, intrinsics.false);
            // 21. c. ii. If hasDuplicates is true, then
            if (hasDuplicates) {
                // 21. c. ii. 1. Perform ! envRec.InitializeBinding(paramName, undefined).
                envRec.InitializeBinding(ctx, paramName, intrinsics.undefined);
            }
        }
    }
    let ao;
    let parameterBindings;
    // 22. If argumentsObjectNeeded is true, then
    if (argumentsObjectNeeded) {
        // 22. a. If strict is true or if simpleParameterList is false, then
        if (strict.isTruthy || !simpleParameterList) {
            // 22. a. i. Let ao be CreateUnmappedArgumentsObject(argumentsList).
            ao = arguments_js_1.$CreateUnmappedArgumentsObject(ctx, argumentsList);
        }
        // 22. b. Else,
        else {
            // 22. b. i. NOTE: mapped argument object is only provided for non-strict functions that don't have a rest parameter, any parameter default value initializers, or any destructured parameters.
            // 22. b. ii. Let ao be CreateMappedArgumentsObject(func, formals, argumentsList, envRec).
            ao = new arguments_js_1.$ArgumentsExoticObject(realm, func, formals, argumentsList, envRec);
        }
        // 22. c. If strict is true, then
        if (strict.isTruthy) {
            // 22. c. i. Perform ! envRec.CreateImmutableBinding("arguments", false).
            envRec.CreateImmutableBinding(ctx, intrinsics.$arguments, intrinsics.false);
        }
        // 22. d. Else,
        else {
            // 22. d. i. Perform ! envRec.CreateMutableBinding("arguments", false).
            envRec.CreateMutableBinding(ctx, intrinsics.$arguments, intrinsics.false);
        }
        // 22. e. Call envRec.InitializeBinding("arguments", ao).
        envRec.InitializeBinding(ctx, intrinsics.$arguments, ao);
        // 22. f. Let parameterBindings be a new List of parameterNames with "arguments" appended.
        parameterBindings = parameterNames.concat(intrinsics.$arguments);
    }
    // 23. Else,
    else {
        // 23. a. Let parameterBindings be parameterNames.
        parameterBindings = parameterNames;
    }
    // 24. Let iteratorRecord be CreateListIteratorRecord(argumentsList).
    const iteratorRecord = iteration_js_1.$CreateListIteratorRecord(ctx, argumentsList);
    // 25. If hasDuplicates is true, then
    if (hasDuplicates) {
        // 25. a. Perform ? IteratorBindingInitialization for formals with iteratorRecord and undefined as arguments.
        for (const formal of formals) {
            const result = formal.InitializeIteratorBinding(ctx, iteratorRecord, void 0);
            if (result === null || result === void 0 ? void 0 : result.isAbrupt) {
                return result;
            }
        }
    }
    // 26. Else,
    else {
        // 26. a. Perform ? IteratorBindingInitialization for formals with iteratorRecord and env as arguments.
        for (const formal of formals) {
            const result = formal.InitializeIteratorBinding(ctx, iteratorRecord, envRec);
            if (result === null || result === void 0 ? void 0 : result.isAbrupt) {
                return result;
            }
        }
    }
    let varEnvRec;
    // 27. If hasParameterExpressions is false, then
    if (!hasParameterExpressions) {
        // 27. a. NOTE: Only a single lexical environment is needed for the parameters and top-level vars.
        // 27. b. Let instantiatedVarNames be a copy of the List parameterBindings.
        const instantiatedVarNames = parameterBindings.slice();
        // 27. c. For each n in varNames, do
        for (const n of varNames) {
            // 27. c. i. If n is not an element of instantiatedVarNames, then
            if (!instantiatedVarNames.some(x => x.is(n))) {
                // 27. c. i. 1. Append n to instantiatedVarNames.
                instantiatedVarNames.push(n);
                // 27. c. i. 2. Perform ! envRec.CreateMutableBinding(n, false).
                envRec.CreateMutableBinding(ctx, n, intrinsics.false);
                // 27. c. i. 3. Call envRec.InitializeBinding(n, undefined).
                envRec.InitializeBinding(ctx, n, intrinsics.undefined);
            }
        }
        // 27. d. Let varEnv be env.
        // 27. e. Let varEnvRec be envRec.
        varEnvRec = envRec;
    }
    // 28. Else,
    else {
        // 28. a. NOTE: A separate Environment Record is needed to ensure that closures created by expressions in the formal parameter list do not have visibility of declarations in the function body.
        // 28. b. Let varEnv be NewDeclarativeEnvironment(env).
        // 28. c. Let varEnvRec be varEnv's EnvironmentRecord.
        varEnvRec = new environment_record_js_1.$DeclarativeEnvRec(code.logger, realm, envRec);
        // 28. d. Set the VariableEnvironment of calleeContext to varEnv.
        ctx.VariableEnvironment = varEnvRec;
        // 28. e. Let instantiatedVarNames be a new empty List.
        const instantiatedVarNames = [];
        // 28. f. For each n in varNames, do
        for (const n of varNames) {
            // 28. f. i. If n is not an element of instantiatedVarNames, then
            if (!instantiatedVarNames.some(x => x.is(n))) {
                // 28. f. i. 1. Append n to instantiatedVarNames.
                instantiatedVarNames.push(n);
                // 28. f. i. 2. Perform ! varEnvRec.CreateMutableBinding(n, false).
                varEnvRec.CreateMutableBinding(ctx, n, intrinsics.false);
                let initialValue;
                // 28. f. i. 3. If n is not an element of parameterBindings or if n is an element of functionNames, let initialValue be undefined.
                if (!parameterBindings.some(x => x.is(n))) {
                    initialValue = intrinsics.undefined;
                }
                // 28. f. i. 4. Else,
                else {
                    // 28. f. i. 4. a. Let initialValue be ! envRec.GetBindingValue(n, false).
                    initialValue = envRec.GetBindingValue(ctx, n, intrinsics.false);
                }
                // 28. f. i. 5. Call varEnvRec.InitializeBinding(n, initialValue).
                varEnvRec.InitializeBinding(ctx, n, initialValue);
                // 28. f. i. 6. NOTE: vars whose names are the same as a formal parameter, initially have the same value as the corresponding initialized parameter.
            }
        }
    }
    // 29. NOTE: Annex B.3.3.1 adds additional steps at this point.
    let lexEnvRec;
    // 30. If strict is false, then
    if (strict.isFalsey) {
        // 30. a. Let lexEnv be NewDeclarativeEnvironment(varEnv).
        lexEnvRec = new environment_record_js_1.$DeclarativeEnvRec(code.logger, realm, varEnvRec);
        // 30. b. NOTE: Non-strict functions use a separate lexical Environment Record for top-level lexical declarations so that a direct eval can determine whether any var scoped declarations introduced by the eval code conflict with pre-existing top-level lexically scoped declarations. This is not needed for strict functions because a strict direct eval always places all declarations into a new Environment Record.
    }
    // 31. Else, let lexEnv be varEnv.
    else {
        lexEnvRec = varEnvRec;
    }
    // 32. Let lexEnvRec be lexEnv's EnvironmentRecord.
    // 33. Set the LexicalEnvironment of calleeContext to lexEnv.
    ctx.LexicalEnvironment = lexEnvRec;
    // 34. Let lexDeclarations be the LexicallyScopedDeclarations of code.
    const lexDeclarations = code.LexicallyScopedDeclarations;
    // 35. For each element d in lexDeclarations, do
    for (const d of lexDeclarations) {
        // 35. a. NOTE: A lexically declared name cannot be the same as a function/generator declaration, formal parameter, or a var name. Lexically declared names are only instantiated here but not initialized.
        // 35. b. For each element dn of the BoundNames of d, do
        for (const dn of d.BoundNames) {
            // 35. b. i. If IsConstantDeclaration of d is true, then
            if (d.IsConstantDeclaration) {
                // 35. b. i. 1. Perform ! lexEnvRec.CreateImmutableBinding(dn, true).
                lexEnvRec.CreateImmutableBinding(ctx, dn, intrinsics.true);
            }
            // 35. b. ii. Else,
            else {
                // 35. b. ii. 1. Perform ! lexEnvRec.CreateMutableBinding(dn, false).
                lexEnvRec.CreateMutableBinding(ctx, dn, intrinsics.false);
            }
        }
    }
    // 36. For each Parse Node f in functionsToInitialize, do
    for (const f of functionsToInitialize) {
        // 36. a. Let fn be the sole element of the BoundNames of f.
        const [fn] = f.BoundNames;
        // TODO: probably not right
        if (f instanceof $FunctionDeclaration) {
            // 36. b. Let fo be the result of performing InstantiateFunctionObject for f with argument lexEnv.
            const fo = f.InstantiateFunctionObject(ctx, lexEnvRec);
            if (fo.isAbrupt) {
                return fo;
            }
            // 36. c. Perform ! varEnvRec.SetMutableBinding(fn, fo, false).
            varEnvRec.SetMutableBinding(ctx, fn, fo, intrinsics.false);
        }
    }
    // 37. Return NormalCompletion(empty).
    return new empty_js_1.$Empty(realm, 1 /* normal */, intrinsics.empty);
}
exports.$FunctionDeclarationInstantiation = $FunctionDeclarationInstantiation;
class $ArrowFunction {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ArrowFunction`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-boundnames
        // 14.2.2 Static Semantics: BoundNames
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-BoundNames
        // 14.8.3 Static Semantics: BoundNames
        this.BoundNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-hasname
        // 14.2.7 Static Semantics: HasName
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-HasName
        // 14.8.7 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-lexicallydeclarednames
        // 14.2.10 Static Semantics: LexicallyDeclaredNames
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-LexicallyDeclaredNames
        // 14.8.9 Static Semantics: LexicallyDeclaredNames
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-lexicallyscopeddeclarations
        // 14.2.11 Static Semantics: LexicallyScopedDeclarations
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-LexicallyScopedDeclarations
        // 14.8.10 Static Semantics: LexicallyScopedDeclarations
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-vardeclarednames
        // 14.2.12 Static Semantics: VarDeclaredNames
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-VarDeclaredNames
        // 14.8.11 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-varscopeddeclarations
        // 14.2.13 Static Semantics: VarScopedDeclarations
        // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-VarScopedDeclarations
        // 14.8.12 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (node.body.kind === typescript_1.SyntaxKind.Block) {
            const DirectivePrologue = this.DirectivePrologue = _shared_js_1.GetDirectivePrologue(node.body.statements);
            if (DirectivePrologue.ContainsUseStrict) {
                ctx |= 65536 /* InStrictMode */;
                this.ContainsUseStrict = true;
            }
            else {
                this.ContainsUseStrict = false;
            }
            this.$parameters = this.CoveredFormalsList = new $FormalParameterList(node.parameters, this, ctx);
            this.$body = new statements_js_1.$Block(node.body, this, ctx, -1);
        }
        else {
            this.DirectivePrologue = kernel_1.emptyArray;
            this.ContainsUseStrict = false;
            this.$parameters = this.CoveredFormalsList = new $FormalParameterList(node.parameters, this, ctx);
            this.$body = _shared_js_1.$assignmentExpression(node.body, this, ctx, -1);
        }
        this.functionKind = _shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Async) ? 8 /* async */ : 0 /* normal */;
    }
    get $kind() { return typescript_1.SyntaxKind.ArrowFunction; }
    // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-runtime-semantics-evaluation
    // 14.2.17 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ArrowFunction : ArrowParameters => ConciseBody
        // 1. If the function code for this ArrowFunction is strict mode code, let strict be true. Otherwise let strict be false.
        // 2. Let scope be the LexicalEnvironment of the running execution context.
        // 3. Let parameters be CoveredFormalsList of ArrowParameters.
        // 4. Let closure be FunctionCreate(Arrow, parameters, ConciseBody, scope, strict).
        // 5. Set closure.[[SourceText]] to the source text matched by ArrowFunction.
        // 6. Return closure.
        return intrinsics.undefined; // TODO: implement this
    }
    // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-runtime-semantics-evaluatebody
    // 14.2.15 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        ctx.checkTimeout();
        if (this.$body.$kind === typescript_1.SyntaxKind.Block) {
            return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
        }
        this.logger.debug(`${this.path}.EvaluateBody(#${ctx.id})`);
        // ConciseBody : AssignmentExpression
        // 1. Perform ? FunctionDeclarationInstantiation(functionObject, argumentsList).
        // 2. Let exprRef be the result of evaluating AssignmentExpression.
        // 3. Let exprValue be ? GetValue(exprRef).
        // 4. Return Completion { [[Type]]: return, [[Value]]: exprValue, [[Target]]: empty }.
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        return intrinsics.undefined; // TODO: implement this
    }
}
exports.$ArrowFunction = $ArrowFunction;
class MethodDefinitionRecord {
    constructor(key, closure) {
        this['[[Key]]'] = key;
        this['[[Closure]]'] = closure;
    }
    get isAbrupt() { return false; }
}
exports.MethodDefinitionRecord = MethodDefinitionRecord;
class $ConstructorDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ConstructorDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.functionKind = 0 /* normal */;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.$decorators = _shared_js_1.$decoratorList(node.decorators, this, ctx);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new statements_js_1.$Block(node.body, this, ctx, -1);
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.Constructor; }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-definemethod
    // 14.3.7 Runtime Semantics: DefineMethod
    DefineMethod(ctx, object, functionPrototype) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // NOTE: this logic and signature is adapted to the fact that this is always a constructor method
        // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }
        // 1. Let propKey be the result of evaluating PropertyName.
        const propKey = intrinsics.$constructor;
        // 2. ReturnIfAbrupt(propKey).
        // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
        const strict = intrinsics.true; // TODO: use static semantics
        // 4. Let scope be the running execution context's LexicalEnvironment.
        const scope = ctx.LexicalEnvironment;
        // 5. If functionPrototype is present as a parameter, then
        // 5. a. Let kind be Normal.
        // 5. b. Let prototype be functionPrototype.
        // 6. Else,
        // 6. a. Let kind be Method.
        // 6. b. Let prototype be the intrinsic object %FunctionPrototype%.
        // 7. Let closure be FunctionCreate(kind, UniqueFormalParameters, FunctionBody, scope, strict, prototype).
        const closure = function_js_1.$Function.FunctionCreate(ctx, 'normal', this, scope, strict, functionPrototype);
        // 8. Perform MakeMethod(closure, object).
        closure['[[HomeObject]]'] = object;
        // 9. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
        closure['[[SourceText]]'] = new string_js_1.$String(realm, this.parent.node.getText(this.mos.node));
        // 10. Return the Record { [[Key]]: propKey, [[Closure]]: closure }.
        return new MethodDefinitionRecord(propKey, closure);
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        return EvaluateBody(this, ctx, functionObject, argumentsList);
    }
}
exports.$ConstructorDeclaration = $ConstructorDeclaration;
class $ParameterDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ParameterDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = this.combinedModifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        ctx |= 16 /* InParameterDeclaration */;
        this.$decorators = _shared_js_1.$decoratorList(node.decorators, this, ctx);
        const $name = this.$name = _shared_js_1.$$bindingName(node.name, this, ctx, -1);
        this.BoundNames = $name.BoundNames;
        if (node.initializer === void 0) {
            this.$initializer = void 0;
            this.ContainsExpression = $name.ContainsExpression;
            this.HasInitializer = false;
            this.IsSimpleParameterList = $name.IsSimpleParameterList;
        }
        else {
            this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
            this.ContainsExpression = true;
            this.HasInitializer = true;
            this.IsSimpleParameterList = false;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.Parameter; }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-iteratorbindinginitialization
    // 14.1.19 Runtime Semantics: IteratorBindingInitialization
    InitializeIteratorBinding(ctx, iteratorRecord, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeIteratorBinding(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const BindingElement = this.$name;
        if (BindingElement.$kind === typescript_1.SyntaxKind.Identifier) {
            return BindingElement.InitializeIteratorBinding(ctx, iteratorRecord, environment, this.$initializer);
        }
        // FormalParameter : BindingElement
        if (!this.ContainsExpression) {
            // 1. If ContainsExpression of BindingElement is false, return the result of performing IteratorBindingInitialization for BindingElement using iteratorRecord and environment as the arguments.
            // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
            // 13.3.3.8 Runtime Semantics: IteratorBindingInitialization
            // NOTE: this section is duplicated in BindingElement
            // BindingElement : BindingPattern Initializer opt
            let v = intrinsics.undefined; // TODO: sure about this?
            // 1. If iteratorRecord.[[Done]] is false, then
            if (iteratorRecord['[[Done]]'].isFalsey) {
                // 1. a. Let next be IteratorStep(iteratorRecord).
                const next = iteration_js_1.$IteratorStep(ctx, iteratorRecord);
                // 1. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
                if (next.isAbrupt) {
                    iteratorRecord['[[Done]]'] = intrinsics.true;
                    // 1. c. ReturnIfAbrupt(next).
                    if (next.isAbrupt) {
                        return next;
                    }
                }
                // 1. d. If next is false, set iteratorRecord.[[Done]] to true.
                if (next.isFalsey) {
                    iteratorRecord['[[Done]]'] = intrinsics.true;
                }
                // 1. e. Else,
                else {
                    // 1. e. i. Let v be IteratorValue(next).
                    v = iteration_js_1.$IteratorValue(ctx, next);
                    // 1. e. ii. If v is an abrupt completion, set iteratorRecord.[[Done]] to true.
                    if (v.isAbrupt) {
                        iteratorRecord['[[Done]]'] = intrinsics.true;
                        // 1. e. iii. ReturnIfAbrupt(v).
                        if (v.isAbrupt) {
                            return v;
                        }
                    }
                }
            }
            // 2. If iteratorRecord.[[Done]] is true, let v be undefined.
            if (iteratorRecord['[[Done]]'].isTruthy) {
                v = intrinsics.undefined;
            }
            const initializer = this.$initializer;
            // 3. If Initializer is present and v is undefined, then
            if (initializer !== void 0 && v.isUndefined) {
                // 3. a. Let defaultValue be the result of evaluating Initializer.
                const defaultValue = initializer.Evaluate(ctx);
                // 3. b. Set v to ? GetValue(defaultValue).
                const $v = defaultValue.GetValue(ctx);
                if ($v.isAbrupt) {
                    return $v.enrichWith(ctx, this);
                }
            }
            // 4. Return the result of performing BindingInitialization of BindingPattern with v and environment as the arguments.
            return BindingElement.InitializeBinding(ctx, v, environment);
        }
        // TODO: implement the rest of this
        // 2. Let currentContext be the running execution context.
        // 3. Let originalEnv be the VariableEnvironment of currentContext.
        // 4. Assert: The VariableEnvironment and LexicalEnvironment of currentContext are the same.
        // 5. Assert: environment and originalEnv are the same.
        // 6. Let paramVarEnv be NewDeclarativeEnvironment(originalEnv).
        // 7. Set the VariableEnvironment of currentContext to paramVarEnv.
        // 8. Set the LexicalEnvironment of currentContext to paramVarEnv.
        // 9. Let result be the result of performing IteratorBindingInitialization for BindingElement using iteratorRecord and environment as the arguments.
        // 10. Set the VariableEnvironment of currentContext to originalEnv.
        // 11. Set the LexicalEnvironment of currentContext to originalEnv.
        // 12. Return result.
        // FunctionRestParameter : BindingRestElement
        // 1. If ContainsExpression of BindingRestElement is false, return the result of performing IteratorBindingInitialization for BindingRestElement using iteratorRecord and environment as the arguments.
        // 2. Let currentContext be the running execution context.
        // 3. Let originalEnv be the VariableEnvironment of currentContext.
        // 4. Assert: The VariableEnvironment and LexicalEnvironment of currentContext are the same.
        // 5. Assert: environment and originalEnv are the same.
        // 6. Let paramVarEnv be NewDeclarativeEnvironment(originalEnv).
        // 7. Set the VariableEnvironment of currentContext to paramVarEnv.
        // 8. Set the LexicalEnvironment of currentContext to paramVarEnv.
        // 9. Let result be the result of performing IteratorBindingInitialization for BindingRestElement using iteratorRecord and environment as the arguments.
        // 10. Set the VariableEnvironment of currentContext to originalEnv.
        // 11. Set the LexicalEnvironment of currentContext to originalEnv.
        // 12. Return result.
    }
}
exports.$ParameterDeclaration = $ParameterDeclaration;
//# sourceMappingURL=functions.js.map