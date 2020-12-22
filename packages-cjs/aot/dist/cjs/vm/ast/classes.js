"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$SemicolonClassElement = exports.$PropertyDeclaration = exports.$ClassDeclaration = exports.$ClassExpression = exports.$ExpressionWithTypeArguments = exports.$HeritageClause = exports.$expressionWithTypeArgumentsList = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const environment_record_js_1 = require("../types/environment-record.js");
const string_js_1 = require("../types/string.js");
const undefined_js_1 = require("../types/undefined.js");
const object_js_1 = require("../types/object.js");
const empty_js_1 = require("../types/empty.js");
const error_js_1 = require("../types/error.js");
const property_descriptor_js_1 = require("../types/property-descriptor.js");
const _shared_js_1 = require("./_shared.js");
const modules_js_1 = require("./modules.js");
const expressions_js_1 = require("./expressions.js");
const functions_js_1 = require("./functions.js");
function $expressionWithTypeArgumentsList(nodes, parent, ctx) {
    if (nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $ExpressionWithTypeArguments(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$expressionWithTypeArgumentsList = $expressionWithTypeArgumentsList;
class $HeritageClause {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.HeritageClause`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$types = $expressionWithTypeArgumentsList(node.types, this, ctx);
    }
    get $kind() { return typescript_1.SyntaxKind.HeritageClause; }
}
exports.$HeritageClause = $HeritageClause;
class $ExpressionWithTypeArguments {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ExpressionWithTypeArguments`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$LHSExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.ExpressionWithTypeArguments; }
}
exports.$ExpressionWithTypeArguments = $ExpressionWithTypeArguments;
// #endregion
class $ClassExpression {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ClassExpression`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
        // 14.6.3 Static Semantics: ConstructorMethod
        this.ConstructorMethod = void 0;
        // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
        // 14.6.7 Static Semantics: IsConstantDeclaration
        this.IsConstantDeclaration = false;
        // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
        // 14.6.8 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = true;
        const intrinsics = realm['[[Intrinsics]]'];
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        const $heritageClauses = this.$heritageClauses = _shared_js_1.$heritageClauseList(node.heritageClauses, this, ctx);
        const $members = this.$members = _shared_js_1.$$classElementList(node.members, this, ctx);
        this.ClassHeritage = $heritageClauses.find(h => h.node.token === typescript_1.SyntaxKind.ExtendsKeyword);
        if ($name === void 0) {
            this.BoundNames = [intrinsics['*default*']];
        }
        else {
            if (_shared_js_1.hasAllBits(modifierFlags, typescript_1.ModifierFlags.ExportDefault)) {
                this.BoundNames = [...$name.BoundNames, intrinsics['*default*']];
            }
            else {
                this.BoundNames = $name.BoundNames;
            }
        }
        const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [];
        const PrototypePropertyNameList = this.PrototypePropertyNameList = [];
        let $member;
        for (let i = 0, ii = $members.length; i < ii; ++i) {
            $member = $members[i];
            switch ($member.$kind) {
                case typescript_1.SyntaxKind.PropertyDeclaration:
                    break;
                case typescript_1.SyntaxKind.Constructor:
                    this.ConstructorMethod = $member;
                    break;
                case typescript_1.SyntaxKind.MethodDeclaration:
                case typescript_1.SyntaxKind.GetAccessor:
                case typescript_1.SyntaxKind.SetAccessor:
                    NonConstructorMethodDefinitions.push($member);
                    if (!$member.PropName.isEmpty && !$member.IsStatic) {
                        PrototypePropertyNameList.push($member.PropName);
                    }
                    break;
                case typescript_1.SyntaxKind.SemicolonClassElement:
            }
        }
        this.HasName = $name !== void 0;
    }
    get $kind() { return typescript_1.SyntaxKind.ClassExpression; }
    // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-namedevaluation
    // 14.6.15 Runtime Semantics: NamedEvaluation
    EvaluateNamed(ctx, name) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // ClassExpression : class ClassTail
        // 1. Return the result of ClassDefinitionEvaluation of ClassTail with arguments undefined and name.
        return $ClassDeclaration.prototype.EvaluateClassDefinition.call(this, ctx, intrinsics.undefined, name);
    }
    // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-evaluation
    // 14.6.16 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ClassExpression : class BindingIdentifier opt ClassTail
        // 1. If BindingIdentifieropt is not present, let className be undefined.
        // 2. Else, let className be StringValue of BindingIdentifier.
        const className = this.$name === void 0 ? intrinsics.undefined : this.$name.StringValue;
        // 3. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments className and className.
        const value = $ClassDeclaration.prototype.EvaluateClassDefinition.call(this, ctx, className, className);
        // 4. ReturnIfAbrupt(value).
        if (value.isAbrupt) {
            return value.enrichWith(ctx, this);
        }
        // 5. Set value.[[SourceText]] to the source text matched by ClassExpression.
        value['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 6. Return value.
        return value;
    }
}
exports.$ClassExpression = $ClassExpression;
class $ClassDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ClassDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
        // 14.6.7 Static Semantics: IsConstantDeclaration
        this.IsConstantDeclaration = false;
        // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
        // 14.6.8 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = true;
        this.VarDeclaredNames = kernel_1.emptyArray; // TODO: this is actually not explicitly specced. Need to double check
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
        // 15.2.3.8 Static Semantics: LexicallyScopedDeclarations
        this.LexicallyDeclaredNames = kernel_1.emptyArray; // TODO: this is actually not explicitly specced. Need to double check
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const intrinsics = realm['[[Intrinsics]]'];
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        this.$decorators = _shared_js_1.$decoratorList(node.decorators, this, ctx);
        let $name;
        if (node.name === void 0) {
            $name = this.$name = new undefined_js_1.$Undefined(realm, void 0, void 0, this);
        }
        else {
            $name = this.$name = new expressions_js_1.$Identifier(node.name, this, ctx, -1);
        }
        const $heritageClauses = this.$heritageClauses = _shared_js_1.$heritageClauseList(node.heritageClauses, this, ctx);
        const $members = this.$members = _shared_js_1.$$classElementList(node.members, this, ctx);
        this.ClassHeritage = $heritageClauses.find(h => h.node.token === typescript_1.SyntaxKind.ExtendsKeyword);
        const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [];
        const PrototypePropertyNameList = this.PrototypePropertyNameList = [];
        let $member;
        for (let i = 0, ii = $members.length; i < ii; ++i) {
            $member = $members[i];
            switch ($member.$kind) {
                case typescript_1.SyntaxKind.PropertyDeclaration:
                    break;
                case typescript_1.SyntaxKind.Constructor:
                    this.ConstructorMethod = $member;
                    break;
                case typescript_1.SyntaxKind.MethodDeclaration:
                case typescript_1.SyntaxKind.GetAccessor:
                case typescript_1.SyntaxKind.SetAccessor:
                    NonConstructorMethodDefinitions.push($member);
                    if (!$member.PropName.isEmpty && !$member.IsStatic) {
                        PrototypePropertyNameList.push($member.PropName);
                    }
                    break;
                case typescript_1.SyntaxKind.SemicolonClassElement:
            }
        }
        const HasName = this.HasName = !$name.isUndefined;
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
                this.LexicallyScopedDeclarations = [this];
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
                this.LexicallyScopedDeclarations = [this];
            }
        }
        else {
            // Must have a name, so we assume it does
            this.BoundNames = $name.BoundNames;
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
            this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        }
        this.ModuleRequests = kernel_1.emptyArray;
    }
    get $kind() { return typescript_1.SyntaxKind.ClassDeclaration; }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-classdefinitionevaluation
    // 14.6.13 Runtime Semantics: ClassDefinitionEvaluation
    EvaluateClassDefinition(ctx, classBinding, className) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // ClassTail : ClassHeritage opt { ClassBody opt }
        // 1. Let lex be the LexicalEnvironment of the running execution context.
        const lex = ctx.LexicalEnvironment;
        // 2. Let classScope be NewDeclarativeEnvironment(lex).
        const classScope = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, lex);
        // 3. Let classScopeEnvRec be classScope's EnvironmentRecord.
        // 4. If classBinding is not undefined, then
        if (!classBinding.isUndefined) {
            // 4. a. Perform classScopeEnvRec.CreateImmutableBinding(classBinding, true).
            classScope.CreateImmutableBinding(ctx, classBinding, intrinsics.true);
        }
        let protoParent;
        let constructorParent;
        // 5. If ClassHeritageopt is not present, then
        if (this.ClassHeritage === void 0) {
            // 5. a. Let protoParent be the intrinsic object %ObjectPrototype%.
            protoParent = intrinsics['%ObjectPrototype%'];
            // 5. b. Let constructorParent be the intrinsic object %FunctionPrototype%.
            constructorParent = intrinsics['%FunctionPrototype%'];
        }
        // 6. Else,
        else {
            // 6. a. Set the running execution context's LexicalEnvironment to classScope.
            ctx.LexicalEnvironment = classScope;
            // 6. b. Let superclassRef be the result of evaluating ClassHeritage.
            const superClassRef = this.ClassHeritage.$types[0].$expression.Evaluate(ctx);
            // 6. c. Set the running execution context's LexicalEnvironment to lex.
            ctx.LexicalEnvironment = lex;
            // 6. d. Let superclass be ? GetValue(superclassRef).
            const superClass = superClassRef.GetValue(ctx);
            if (superClass.isAbrupt) {
                return superClass.enrichWith(ctx, this);
            }
            // 6. e. If superclass is null, then
            if (superClass.isNull) {
                // 6. e. i. Let protoParent be null.
                protoParent = intrinsics.null;
                // 6. e. ii. Let constructorParent be the intrinsic object %FunctionPrototype%.
                constructorParent = intrinsics['%FunctionPrototype%'];
            }
            // 6. f. Else if IsConstructor(superclass) is false, throw a TypeError exception.
            else if (!superClass.isFunction) {
                return new error_js_1.$TypeError(realm, `Superclass is ${superClass}, but expected a function`);
            }
            // 6. g. Else,
            else {
                // 6. g. i. Let protoParent be ? Get(superclass, "prototype").
                const $protoParent = superClass['[[Get]]'](ctx, intrinsics.$prototype, superClass);
                if ($protoParent.isAbrupt) {
                    return $protoParent.enrichWith(ctx, this);
                }
                // 6. g. ii. If Type(protoParent) is neither Object nor Null, throw a TypeError exception.
                if (!$protoParent.isObject && !$protoParent.isNull) {
                    return new error_js_1.$TypeError(realm, `Superclass prototype is ${superClass}, but expected null or an object`);
                }
                protoParent = $protoParent;
                // 6. g. iii. Let constructorParent be superclass.
                constructorParent = superClass;
            }
        }
        // 7. Let proto be ObjectCreate(protoParent).
        const proto = new object_js_1.$Object(realm, 'proto', protoParent, 1 /* normal */, intrinsics.empty);
        let constructor;
        // 8. If ClassBodyopt is not present, let constructor be empty.
        if (this.ConstructorMethod === void 0) {
            constructor = intrinsics.empty;
        }
        // 9. Else, let constructor be ConstructorMethod of ClassBody.
        else {
            constructor = this.ConstructorMethod;
        }
        // 10. If constructor is empty, then
        if (constructor instanceof empty_js_1.$Empty) {
            // 10. a. If ClassHeritageopt is present, then
            if (this.ClassHeritage !== void 0) {
                // 10. a. i. Set constructor to the result of parsing the source text constructor(... args){ super (...args);} using the syntactic grammar with the goal symbol MethodDefinition[~Yield, ~Await].
                constructor = this.ConstructorMethod = new functions_js_1.$ConstructorDeclaration(typescript_1.createConstructor(void 0, void 0, [
                    typescript_1.createParameter(void 0, void 0, typescript_1.createToken(typescript_1.SyntaxKind.DotDotDotToken), typescript_1.createIdentifier('args')),
                ], typescript_1.createBlock([
                    typescript_1.createExpressionStatement(typescript_1.createCall(typescript_1.createSuper(), void 0, [
                        typescript_1.createSpread(typescript_1.createIdentifier('args')),
                    ])),
                ])), this, this.ctx, -1);
            }
            // 10. b. Else,
            else {
                // 10. b. i. Set constructor to the result of parsing the source text constructor(){ } using the syntactic grammar with the goal symbol MethodDefinition[~Yield, ~Await].
                constructor = this.ConstructorMethod = new functions_js_1.$ConstructorDeclaration(typescript_1.createConstructor(void 0, void 0, [], typescript_1.createBlock([])), this, this.ctx, -1);
            }
        }
        // 11. Set the running execution context's LexicalEnvironment to classScope.
        ctx.LexicalEnvironment = classScope;
        // 12. Let constructorInfo be the result of performing DefineMethod for constructor with arguments proto and constructorParent as the optional functionPrototype argument.
        const constructorInfo = constructor.DefineMethod(ctx, proto, constructorParent);
        // 13. Assert: constructorInfo is not an abrupt completion.
        // 14. Let F be constructorInfo.[[Closure]].
        const F = constructorInfo['[[Closure]]'];
        // 15. If ClassHeritageopt is present, set F.[[ConstructorKind]] to "derived".
        if (this.ClassHeritage !== void 0) {
            F['[[ConstructorKind]]'] = 'derived';
        }
        // 16. Perform MakeConstructor(F, false, proto).
        F.MakeConstructor(ctx, intrinsics.false, proto);
        // 17. Perform MakeClassConstructor(F).
        F['[[FunctionKind]]'] = 2 /* classConstructor */;
        // 18. If className is not undefined, then
        if (!className.isUndefined) {
            // 18. a. Perform SetFunctionName(F, className).
            F.SetFunctionName(ctx, className);
        }
        // 19. Perform CreateMethodProperty(proto, "constructor", F).
        proto['[[DefineOwnProperty]]'](ctx, intrinsics.$constructor, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.$constructor, {
            '[[Value]]': F,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.true,
        }));
        // 20. If ClassBodyopt is not present, let methods be a new empty List.
        // 21. Else, let methods be NonConstructorMethodDefinitions of ClassBody.
        const methods = this.NonConstructorMethodDefinitions;
        let status;
        // 22. For each ClassElement m in order from methods, do
        for (const m of methods) {
            // 22. a. If IsStatic of m is false, then
            if (!m.IsStatic) {
                // 22. a. i. Let status be the result of performing PropertyDefinitionEvaluation for m with arguments proto and false.
                status = m.EvaluatePropertyDefinition(ctx, proto, intrinsics.false);
            }
            // 22. b. Else,
            else {
                // 22. b. i. Let status be the result of performing PropertyDefinitionEvaluation for m with arguments F and false.
                status = m.EvaluatePropertyDefinition(ctx, F, intrinsics.false);
            }
            // 22. c. If status is an abrupt completion, then
            if (status.isAbrupt) {
                // 22. c. i. Set the running execution context's LexicalEnvironment to lex.
                ctx.LexicalEnvironment = lex;
                // 22. c. ii. Return Completion(status).
                return status;
            }
        }
        // 23. Set the running execution context's LexicalEnvironment to lex.
        ctx.LexicalEnvironment = lex;
        // 24. If classBinding is not undefined, then
        if (!classBinding.isUndefined) {
            // 24. a. Perform classScopeEnvRec.InitializeBinding(classBinding, F).
            classScope.InitializeBinding(ctx, classBinding, F);
        }
        // 25. Return F.
        return F;
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-bindingclassdeclarationevaluation
    // 14.6.14 Runtime Semantics: BindingClassDeclarationEvaluation
    EvaluateBindingClassDeclaration(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const name = this.$name;
        if (name.isUndefined) {
            // ClassDeclaration : class ClassTail
            // 1. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments undefined and "default".
            const value = this.EvaluateClassDefinition(ctx, intrinsics.undefined, intrinsics.default);
            // 2. ReturnIfAbrupt(value).
            if (value.isAbrupt) {
                return value.enrichWith(ctx, this);
            }
            // 3. Set value.[[SourceText]] to the source text matched by ClassDeclaration.
            value['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
            // 4. Return value.
            return value;
        }
        // ClassDeclaration : class BindingIdentifier ClassTail
        // 1. Let className be StringValue of BindingIdentifier.
        const className = name.StringValue;
        // 2. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments className and className.
        const value = this.EvaluateClassDefinition(ctx, className, className);
        // 3. ReturnIfAbrupt(value).
        if (value.isAbrupt) {
            return value.enrichWith(ctx, this);
        }
        // 4. Set value.[[SourceText]] to the source text matched by ClassDeclaration.
        value['[[SourceText]]'] = new string_js_1.$String(realm, this.node.getText(this.mos.node));
        // 5. Let env be the running execution context's LexicalEnvironment.
        // 6. Perform ? InitializeBoundName(className, value, env).
        const $InitializeBoundNameResult = ctx.LexicalEnvironment.InitializeBinding(ctx, className, value);
        if ($InitializeBoundNameResult.isAbrupt) {
            return $InitializeBoundNameResult.enrichWith(ctx, this);
        }
        // 7. Return value.
        return value;
    }
    // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-evaluation
    // 14.6.16 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // ClassDeclaration : class BindingIdentifier ClassTail
        // 1. Perform ? BindingClassDeclarationEvaluation of this ClassDeclaration.
        const $EvaluateBindingClassDeclarationResult = this.EvaluateBindingClassDeclaration(ctx);
        if ($EvaluateBindingClassDeclarationResult.isAbrupt) {
            return $EvaluateBindingClassDeclarationResult.enrichWith(ctx, this);
        }
        // 2. Return NormalCompletion(empty).
        return intrinsics.empty;
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        ctx.checkTimeout();
        return this.ConstructorMethod.EvaluateBody(ctx, functionObject, argumentsList);
    }
}
exports.$ClassDeclaration = $ClassDeclaration;
class $PropertyDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.PropertyDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.$decorators = _shared_js_1.$decoratorList(node.decorators, this, ctx);
        this.$name = _shared_js_1.$$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
        this.IsStatic = _shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Static);
    }
    get $kind() { return typescript_1.SyntaxKind.PropertyDeclaration; }
}
exports.$PropertyDeclaration = $PropertyDeclaration;
class $SemicolonClassElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.SemicolonClassElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
        // 14.6.9 Static Semantics: IsStatic
        this.IsStatic = false;
        // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
        // 14.3.5 Static Semantics: PropName
        this.PropName = empty_js_1.empty;
    }
    get $kind() { return typescript_1.SyntaxKind.SemicolonClassElement; }
}
exports.$SemicolonClassElement = $SemicolonClassElement;
//# sourceMappingURL=classes.js.map