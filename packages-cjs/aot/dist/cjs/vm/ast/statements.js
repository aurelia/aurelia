"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$CatchClause = exports.$DefaultClause = exports.$CaseClause = exports.$CaseBlock = exports.$$clauseList = exports.$DebuggerStatement = exports.$TryStatement = exports.$ThrowStatement = exports.$LabeledStatement = exports.$SwitchStatement = exports.$WithStatement = exports.$ReturnStatement = exports.$BreakStatement = exports.$ContinueStatement = exports.$ForOfStatement = exports.$ForInStatement = exports.$ForStatement = exports.$WhileStatement = exports.$DoStatement = exports.$IfStatement = exports.$ExpressionStatement = exports.$EmptyStatement = exports.$Block = exports.$VariableDeclarationList = exports.$variableDeclarationList = exports.$VariableDeclaration = exports.$VariableStatement = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const environment_record_js_1 = require("../types/environment-record.js");
const undefined_js_1 = require("../types/undefined.js");
const empty_js_1 = require("../types/empty.js");
const _shared_js_1 = require("./_shared.js");
const modules_js_1 = require("./modules.js");
const operations_js_1 = require("../operations.js");
class $VariableStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.VariableStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const intrinsics = realm['[[Intrinsics]]'];
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        ctx |= 4 /* InVariableStatement */;
        if (_shared_js_1.hasBit(this.modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $declarationList = this.$declarationList = new $VariableDeclarationList(node.declarationList, this, ctx);
        const isLexical = this.isLexical = $declarationList.isLexical;
        this.IsConstantDeclaration = $declarationList.IsConstantDeclaration;
        const BoundNames = this.BoundNames = $declarationList.BoundNames;
        this.VarDeclaredNames = $declarationList.VarDeclaredNames;
        this.VarScopedDeclarations = $declarationList.VarScopedDeclarations;
        if (_shared_js_1.hasBit(ctx, 4096 /* InExport */)) {
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = BoundNames.map(name => new modules_js_1.ExportEntryRecord(
            /* source */ this, 
            /* ExportName */ name, 
            /* ModuleRequest */ intrinsics.null, 
            /* ImportName */ intrinsics.null, 
            /* LocalName */ name));
            if (isLexical) {
                this.LexicallyScopedDeclarations = [this];
            }
            else {
                this.LexicallyScopedDeclarations = kernel_1.emptyArray;
            }
        }
        else {
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
            this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        }
        this.ModuleRequests = kernel_1.emptyArray;
    }
    get $kind() { return typescript_1.SyntaxKind.VariableStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-runtime-semantics-evaluation
    // 13.3.1.4 Runtime Semantics: Evaluation
    // http://www.ecma-international.org/ecma-262/#sec-variable-statement-runtime-semantics-evaluation
    // 13.3.2.4 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-runtime-semantics-evaluation
        // 13.3.1.4 Runtime Semantics: Evaluation
        // LexicalDeclaration : LetOrConst BindingList ;
        // 1. Let next be the result of evaluating BindingList.
        // 2. ReturnIfAbrupt(next).
        // 3. Return NormalCompletion(empty).
        // BindingList : BindingList , LexicalBinding
        // 1. Let next be the result of evaluating BindingList.
        // 2. ReturnIfAbrupt(next).
        // 3. Return the result of evaluating LexicalBinding.
        // LexicalBinding : BindingIdentifier
        // 1. Let lhs be ResolveBinding(StringValue of BindingIdentifier).
        // 2. Return InitializeReferencedBinding(lhs, undefined).
        // LexicalBinding : BindingIdentifier Initializer
        // 1. Let bindingId be StringValue of BindingIdentifier.
        // 2. Let lhs be ResolveBinding(bindingId).
        // 3. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 3. a. Let value be the result of performing NamedEvaluation for Initializer with argument bindingId.
        // 4. Else,
        // 4. a. Let rhs be the result of evaluating Initializer.
        // 4. b. Let value be ? GetValue(rhs).
        // 5. Return InitializeReferencedBinding(lhs, value).
        // LexicalBinding : BindingPattern Initializer
        // 1. Let rhs be the result of evaluating Initializer.
        // 2. Let value be ? GetValue(rhs).
        // 3. Let env be the running execution context's LexicalEnvironment.
        // 4. Return the result of performing BindingInitialization for BindingPattern using value and env as the arguments.
        // http://www.ecma-international.org/ecma-262/#sec-variable-statement-runtime-semantics-evaluation
        // 13.3.2.4 Runtime Semantics: Evaluation
        // VariableStatement : var VariableDeclarationList ;
        // 1. Let next be the result of evaluating VariableDeclarationList.
        // 2. ReturnIfAbrupt(next).
        // 3. Return NormalCompletion(empty).
        // VariableDeclarationList : VariableDeclarationList , VariableDeclaration
        // 1. Let next be the result of evaluating VariableDeclarationList.
        // 2. ReturnIfAbrupt(next).
        // 3. Return the result of evaluating VariableDeclaration.
        // VariableDeclaration : BindingIdentifier
        // 1. Return NormalCompletion(empty).
        // VariableDeclaration : BindingIdentifier Initializer
        // 1. Let bindingId be StringValue of BindingIdentifier.
        // 2. Let lhs be ? ResolveBinding(bindingId).
        // 3. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 3. a. Let value be the result of performing NamedEvaluation for Initializer with argument bindingId.
        // 4. Else,
        // 4. a. Let rhs be the result of evaluating Initializer.
        // 4. b. Let value be ? GetValue(rhs).
        // 5. Return ? PutValue(lhs, value).
        // VariableDeclaration : BindingPattern Initializer
        // 1. Let rhs be the result of evaluating Initializer.
        // 2. Let rval be ? GetValue(rhs).
        // 3. Return the result of performing BindingInitialization for BindingPattern passing rval and undefined as arguments.
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$VariableStatement = $VariableStatement;
class $VariableDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.VariableDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(ctx, 4 /* InVariableStatement */)) {
            this.combinedModifierFlags = modifierFlags | parent.combinedModifierFlags;
        }
        else {
            this.combinedModifierFlags = modifierFlags;
        }
        const $name = this.$name = _shared_js_1.$$bindingName(node.name, this, ctx, -1);
        // Clear this flag because it's used inside $Identifier to declare locals/exports
        // and we don't want to do that on the identifiers in types/initializers.
        ctx = _shared_js_1.clearBit(ctx, 4 /* InVariableStatement */);
        this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
        this.BoundNames = $name.BoundNames;
        if (_shared_js_1.hasBit(ctx, 32768 /* IsVar */)) { // TODO: what about parameter and for declarations?
            this.VarDeclaredNames = this.BoundNames;
            this.VarScopedDeclarations = [this];
            this.IsConstantDeclaration = false;
        }
        else {
            this.VarDeclaredNames = kernel_1.emptyArray;
            this.VarScopedDeclarations = kernel_1.emptyArray;
            this.IsConstantDeclaration = _shared_js_1.hasBit(ctx, 8192 /* IsConst */);
        }
    }
    get $kind() { return typescript_1.SyntaxKind.VariableDeclaration; }
    InitializeBinding(ctx, value) {
        var _a, _b;
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const bindingName = this.$name;
        const kind = bindingName.$kind;
        const boundNames = bindingName.BoundNames;
        const envRec = ctx.LexicalEnvironment;
        if (((_a = boundNames === null || boundNames === void 0 ? void 0 : boundNames.length) !== null && _a !== void 0 ? _a : 0) > 0) {
            switch (kind) {
                // http://www.ecma-international.org/ecma-262/#sec-identifiers-runtime-semantics-bindinginitialization
                // 12.1.5 Runtime Semantics: BindingInitialization
                // http://www.ecma-international.org/ecma-262/#sec-initializeboundname
                // 12.1.5.1 Runtime Semantics: InitializeBoundName ( name , value , environment )
                case typescript_1.SyntaxKind.Identifier: {
                    const name = (_b = boundNames[0]) === null || _b === void 0 ? void 0 : _b.GetValue(ctx);
                    // 1. Assert: Type(name) is String.
                    // 2. If environment is not undefined, then
                    if (envRec !== void 0) {
                        // 2. a. Let env be the EnvironmentRecord component of environment.
                        // 2. b. Perform env.InitializeBinding(name, value).
                        envRec.InitializeBinding(ctx, name, value);
                        // 2. c. Return NormalCompletion(undefined).
                        return realm['[[Intrinsics]]'].undefined;
                    }
                    else {
                        // 3. Else,
                        // 3. a. Let lhs be ResolveBinding(name).
                        const lhs = realm.ResolveBinding(name);
                        if (lhs.isAbrupt) {
                            return lhs.enrichWith(ctx, this);
                        } // TODO: is this correct? spec doesn't say it
                        // 3. b. Return ? PutValue(lhs, value).
                        return lhs.PutValue(ctx, value).enrichWith(ctx, this);
                    }
                }
                case typescript_1.SyntaxKind.ObjectBindingPattern:
                    bindingName.InitializeBinding(ctx, value, envRec);
                    break;
                case typescript_1.SyntaxKind.ArrayBindingPattern:
                    // TODO
                    break;
            }
        }
        return ctx.Realm['[[Intrinsics]]'].empty;
    }
}
exports.$VariableDeclaration = $VariableDeclaration;
function $variableDeclarationList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $VariableDeclaration(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$variableDeclarationList = $variableDeclarationList;
class $VariableDeclarationList {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.VariableDeclarationList`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.isLexical = (node.flags & (typescript_1.NodeFlags.Const | typescript_1.NodeFlags.Let)) > 0;
        this.IsConstantDeclaration = (node.flags & typescript_1.NodeFlags.Const) > 0;
        if (_shared_js_1.hasBit(ctx, 4 /* InVariableStatement */)) {
            this.combinedModifierFlags = parent.modifierFlags;
        }
        else {
            this.combinedModifierFlags = typescript_1.ModifierFlags.None;
        }
        if (_shared_js_1.hasBit(node.flags, typescript_1.NodeFlags.Const)) {
            ctx |= 8192 /* IsConst */;
        }
        else if (_shared_js_1.hasBit(node.flags, typescript_1.NodeFlags.Let)) {
            ctx |= 16384 /* IsLet */;
        }
        else {
            ctx |= 32768 /* IsVar */;
        }
        const $declarations = this.$declarations = $variableDeclarationList(node.declarations, this, ctx);
        this.BoundNames = $declarations.flatMap(_shared_js_1.getBoundNames);
        this.VarDeclaredNames = $declarations.flatMap(_shared_js_1.getVarDeclaredNames);
        this.VarScopedDeclarations = $declarations.flatMap(_shared_js_1.getVarScopedDeclarations);
    }
    get $kind() { return typescript_1.SyntaxKind.VariableDeclarationList; }
}
exports.$VariableDeclarationList = $VariableDeclarationList;
// #region Statements
class $Block {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.Block`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const $statements = this.$statements = _shared_js_1.$$tsStatementList(node.statements, this, ctx);
        const LexicallyDeclaredNames = this.LexicallyDeclaredNames = [];
        const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [];
        const TopLevelLexicallyDeclaredNames = this.TopLevelLexicallyDeclaredNames = [];
        const TopLevelLexicallyScopedDeclarations = this.TopLevelLexicallyScopedDeclarations = [];
        const TopLevelVarDeclaredNames = this.TopLevelVarDeclaredNames = [];
        const TopLevelVarScopedDeclarations = this.TopLevelVarScopedDeclarations = [];
        const VarDeclaredNames = this.VarDeclaredNames = [];
        const VarScopedDeclarations = this.VarScopedDeclarations = [];
        const len = $statements.length;
        let $statement;
        for (let i = 0; i < len; ++i) {
            $statement = $statements[i];
            switch ($statement.$kind) {
                case typescript_1.SyntaxKind.FunctionDeclaration:
                    LexicallyDeclaredNames.push(...$statement.BoundNames);
                    LexicallyScopedDeclarations.push($statement);
                    TopLevelVarDeclaredNames.push(...$statement.BoundNames);
                    TopLevelVarScopedDeclarations.push($statement);
                    break;
                case typescript_1.SyntaxKind.ClassDeclaration:
                    LexicallyDeclaredNames.push(...$statement.BoundNames);
                    LexicallyScopedDeclarations.push($statement);
                    TopLevelLexicallyDeclaredNames.push(...$statement.BoundNames);
                    TopLevelLexicallyScopedDeclarations.push($statement);
                    break;
                case typescript_1.SyntaxKind.VariableStatement:
                    if ($statement.isLexical) {
                        LexicallyDeclaredNames.push(...$statement.BoundNames);
                        LexicallyScopedDeclarations.push($statement);
                        TopLevelLexicallyDeclaredNames.push(...$statement.BoundNames);
                        TopLevelLexicallyScopedDeclarations.push($statement);
                    }
                    else {
                        TopLevelVarDeclaredNames.push(...$statement.VarDeclaredNames);
                        TopLevelVarScopedDeclarations.push(...$statement.VarScopedDeclarations);
                        VarDeclaredNames.push(...$statement.VarDeclaredNames);
                        VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
                    }
                    break;
                case typescript_1.SyntaxKind.LabeledStatement:
                    LexicallyDeclaredNames.push(...$statement.LexicallyDeclaredNames);
                    LexicallyScopedDeclarations.push(...$statement.LexicallyScopedDeclarations);
                    TopLevelVarDeclaredNames.push(...$statement.TopLevelVarDeclaredNames);
                    TopLevelVarScopedDeclarations.push(...$statement.TopLevelVarScopedDeclarations);
                    VarDeclaredNames.push(...$statement.VarDeclaredNames);
                    VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.Block:
                case typescript_1.SyntaxKind.IfStatement:
                case typescript_1.SyntaxKind.DoStatement:
                case typescript_1.SyntaxKind.WhileStatement:
                case typescript_1.SyntaxKind.ForStatement:
                case typescript_1.SyntaxKind.ForInStatement:
                case typescript_1.SyntaxKind.ForOfStatement:
                case typescript_1.SyntaxKind.WithStatement:
                case typescript_1.SyntaxKind.SwitchStatement:
                case typescript_1.SyntaxKind.TryStatement:
                    TopLevelVarDeclaredNames.push(...$statement.VarDeclaredNames);
                    TopLevelVarScopedDeclarations.push(...$statement.VarScopedDeclarations);
                    VarDeclaredNames.push(...$statement.VarDeclaredNames);
                    VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.Block; }
    // http://www.ecma-international.org/ecma-262/#sec-block-runtime-semantics-evaluation
    // 13.2.13 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const $statements = this.$statements;
        // Block : { }
        // 1. Return NormalCompletion(empty).
        if ($statements.length === 0) {
            return intrinsics.empty;
        }
        // Block : { StatementList }
        // 1. Let oldEnv be the running execution context's LexicalEnvironment.
        const oldEnv = ctx.LexicalEnvironment;
        // 2. Let blockEnv be NewDeclarativeEnvironment(oldEnv).
        const blockEnv = ctx.LexicalEnvironment = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, oldEnv);
        // 3. Perform BlockDeclarationInstantiation(StatementList, blockEnv).
        const $BlockDeclarationInstantiationResult = _shared_js_1.BlockDeclarationInstantiation(ctx, this.LexicallyScopedDeclarations, blockEnv);
        if ($BlockDeclarationInstantiationResult.isAbrupt) {
            return $BlockDeclarationInstantiationResult;
        }
        // 4. Set the running execution context's LexicalEnvironment to blockEnv.
        realm.stack.push(ctx);
        // 5. Let blockValue be the result of evaluating StatementList.
        const blockValue = _shared_js_1.evaluateStatementList(ctx, $statements);
        // 6. Set the running execution context's LexicalEnvironment to oldEnv.
        realm.stack.pop();
        ctx.LexicalEnvironment = oldEnv;
        // 7. Return blockValue.
        return blockValue;
    }
}
exports.$Block = $Block;
class $EmptyStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.EmptyStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
    }
    get $kind() { return typescript_1.SyntaxKind.EmptyStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-empty-statement-runtime-semantics-evaluation
    // 13.4.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // EmptyStatement : ;
        // 1. Return NormalCompletion(empty).
        return intrinsics.empty;
    }
}
exports.$EmptyStatement = $EmptyStatement;
class $ExpressionStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ExpressionStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.ExpressionStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-expression-statement-runtime-semantics-evaluation
    // 13.5.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ExpressionStatement : Expression ;
        // 1. Let exprRef be the result of evaluating Expression.
        // 2. Return ? GetValue(exprRef).
        return this.$expression.Evaluate(ctx).GetValue(ctx).enrichWith(ctx, this);
    }
}
exports.$ExpressionStatement = $ExpressionStatement;
class $IfStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.IfStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $thenStatement = this.$thenStatement = _shared_js_1.$$esLabelledItem(node.thenStatement, this, ctx, -1);
        if (node.elseStatement === void 0) {
            this.$elseStatement = void 0;
            this.VarDeclaredNames = $thenStatement.VarDeclaredNames;
            this.VarScopedDeclarations = $thenStatement.VarScopedDeclarations;
        }
        else {
            const $elseStatement = this.$elseStatement = _shared_js_1.$$esLabelledItem(node.elseStatement, this, ctx, -1);
            this.VarDeclaredNames = [
                ...$thenStatement.VarDeclaredNames,
                ...$elseStatement.VarDeclaredNames,
            ];
            this.VarScopedDeclarations = [
                ...$thenStatement.VarScopedDeclarations,
                ...$elseStatement.VarScopedDeclarations,
            ];
        }
    }
    get $kind() { return typescript_1.SyntaxKind.IfStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-if-statement-runtime-semantics-evaluation
    // 13.6.7 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const { $expression, $thenStatement, $elseStatement } = this;
        const exprRef = $expression.Evaluate(ctx);
        const exprValue = exprRef.GetValue(ctx).ToBoolean(ctx);
        if ($elseStatement !== undefined) {
            // IfStatement : if ( Expression ) Statement else Statement
            // 1. Let exprRef be the result of evaluating Expression.
            // 2. Let exprValue be ToBoolean(? GetValue(exprRef)).
            let stmtCompletion;
            // 3. If exprValue is true, then
            if (exprValue.is(intrinsics.true)) {
                // 3. a. Let stmtCompletion be the result of evaluating the first Statement.
                stmtCompletion = _shared_js_1.evaluateStatement(ctx, $thenStatement);
            }
            else {
                // 4. Else,
                // 4. a. Let stmtCompletion be the result of evaluating the second Statement.
                stmtCompletion = _shared_js_1.evaluateStatement(ctx, $elseStatement);
            }
            // 5. Return Completion(UpdateEmpty(stmtCompletion, undefined)).
            stmtCompletion.UpdateEmpty(intrinsics.undefined);
            return stmtCompletion;
        }
        else {
            // IfStatement : if ( Expression ) Statement
            // 1. Let exprRef be the result of evaluating Expression.
            // 2. Let exprValue be ToBoolean(? GetValue(exprRef)).
            let stmtCompletion;
            // 3. If exprValue is false, then
            if (exprValue.is(intrinsics.false)) {
                // 3. a. Return NormalCompletion(undefined).
                return new undefined_js_1.$Undefined(realm);
            }
            else {
                // 4. Else,
                // 4. a. Let stmtCompletion be the result of evaluating Statement.
                stmtCompletion = _shared_js_1.evaluateStatement(ctx, $thenStatement);
                // 4. b. Return Completion(UpdateEmpty(stmtCompletion, undefined)).
                stmtCompletion.UpdateEmpty(intrinsics.undefined);
                return stmtCompletion;
            }
        }
    }
}
exports.$IfStatement = $IfStatement;
class $DoStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.DoStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.DoStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-runtime-semantics-labelledevaluation
    // 13.7.2.6 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx, labelSet) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // IterationStatement : do Statement while ( Expression ) ;
        const expr = this.$expression;
        const stmt = this.$statement;
        // 1. Let V be undefined.
        let V = intrinsics.undefined;
        // 2. Repeat,
        while (true) {
            // 2. a. Let stmtResult be the result of evaluating Statement.
            const stmtResult = _shared_js_1.evaluateStatement(ctx, stmt);
            // 2. b. If LoopContinues(stmtResult, labelSet) is false, return Completion(UpdateEmpty(stmtResult, V)).
            if (operations_js_1.$LoopContinues(ctx, stmtResult, labelSet).isFalsey) {
                return stmtResult.UpdateEmpty(V);
            }
            // 2. c. If stmtResult.[[Value]] is not empty, set V to stmtResult.[[Value]].
            if (!stmtResult.isEmpty) {
                V = stmtResult;
            }
            // 2. d. Let exprRef be the result of evaluating Expression.
            const exprRef = expr.Evaluate(ctx);
            // 2. e. Let exprValue be ? GetValue(exprRef).
            const exprValue = exprRef.GetValue(ctx);
            if (exprValue.isAbrupt) {
                return exprValue.enrichWith(ctx, this);
            }
            // 2. f. If ToBoolean(exprValue) is false, return NormalCompletion(V).
            const bool = exprValue.ToBoolean(ctx);
            if (bool.isAbrupt) {
                return bool.enrichWith(ctx, this);
            }
            if (bool.isFalsey) {
                return V.ToCompletion(1 /* normal */, intrinsics.empty);
            }
        }
    }
}
exports.$DoStatement = $DoStatement;
class $WhileStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.WhileStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.WhileStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-while-statement-runtime-semantics-labelledevaluation
    // 13.7.3.6 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx, labelSet) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // IterationStatement : while ( Expression ) Statement
        const expr = this.$expression;
        const stmt = this.$statement;
        // 1. Let V be undefined.
        let V = intrinsics.undefined;
        // 2. Repeat,
        while (true) {
            // 2. a. Let exprRef be the result of evaluating Expression.
            const exprRef = expr.Evaluate(ctx);
            // 2. b. Let exprValue be ? GetValue(exprRef).
            const exprValue = exprRef.GetValue(ctx);
            if (exprValue.isAbrupt) {
                return exprValue.enrichWith(ctx, this);
            }
            // 2. c. If ToBoolean(exprValue) is false, return NormalCompletion(V).
            const bool = exprValue.ToBoolean(ctx);
            if (bool.isAbrupt) {
                return bool.enrichWith(ctx, this);
            }
            if (bool.isFalsey) {
                return V.ToCompletion(1 /* normal */, intrinsics.empty);
            }
            // 2. d. Let stmtResult be the result of evaluating Statement.
            const stmtResult = _shared_js_1.evaluateStatement(ctx, stmt);
            // 2. e. If LoopContinues(stmtResult, labelSet) is false, return Completion(UpdateEmpty(stmtResult, V)).
            if (operations_js_1.$LoopContinues(ctx, stmtResult, labelSet).isFalsey) {
                return stmtResult.UpdateEmpty(V);
            }
            // 2. f. If stmtResult.[[Value]] is not empty, set V to stmtResult.[[Value]].
            if (!stmtResult.isEmpty) {
                V = stmtResult;
            }
        }
    }
}
exports.$WhileStatement = $WhileStatement;
class $ForStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ForStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.$condition = _shared_js_1.$assignmentExpression(node.condition, this, ctx, -1);
        this.$incrementor = _shared_js_1.$assignmentExpression(node.incrementor, this, ctx, -1);
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        if (node.initializer === void 0) {
            this.$initializer = void 0;
            this.VarDeclaredNames = $statement.VarDeclaredNames;
            this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        }
        else {
            if (node.initializer.kind === typescript_1.SyntaxKind.VariableDeclarationList) {
                const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer, this, ctx);
                if ($initializer.isLexical) {
                    this.VarDeclaredNames = $statement.VarDeclaredNames;
                    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
                }
                else {
                    this.VarDeclaredNames = [
                        ...$initializer.VarDeclaredNames,
                        ...$statement.VarDeclaredNames,
                    ];
                    this.VarScopedDeclarations = [
                        ...$initializer.VarScopedDeclarations,
                        ...$statement.VarScopedDeclarations,
                    ];
                }
            }
            else {
                this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
                this.VarDeclaredNames = $statement.VarDeclaredNames;
                this.VarScopedDeclarations = $statement.VarScopedDeclarations;
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ForStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-for-statement-runtime-semantics-labelledevaluation
    // 13.7.4.7 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // IterationStatement : for ( Expression opt ; Expression opt ; Expression opt ) Statement
        // 1. If the first Expression is present, then
        // 1. a. Let exprRef be the result of evaluating the first Expression.
        // 1. b. Perform ? GetValue(exprRef).
        // 2. Return ? ForBodyEvaluation(the second Expression, the third Expression, Statement, « », labelSet).
        // IterationStatement : for ( var VariableDeclarationList ; Expression opt ; Expression opt ) Statement
        // 1. Let varDcl be the result of evaluating VariableDeclarationList.
        // 2. ReturnIfAbrupt(varDcl).
        // 3. Return ? ForBodyEvaluation(the first Expression, the second Expression, Statement, « », labelSet).
        // IterationStatement : for ( LexicalDeclaration Expression opt ; Expression opt ) Statement
        // 1. Let oldEnv be the running execution context's LexicalEnvironment.
        // 2. Let loopEnv be NewDeclarativeEnvironment(oldEnv).
        // 3. Let loopEnvRec be loopEnv's EnvironmentRecord.
        // 4. Let isConst be the result of performing IsConstantDeclaration of LexicalDeclaration.
        // 5. Let boundNames be the BoundNames of LexicalDeclaration.
        // 6. For each element dn of boundNames, do
        // 6. a. If isConst is true, then
        // 6. a. i. Perform ! loopEnvRec.CreateImmutableBinding(dn, true).
        // 6. b. Else,
        // 6. b. i. Perform ! loopEnvRec.CreateMutableBinding(dn, false).
        // 7. Set the running execution context's LexicalEnvironment to loopEnv.
        // 8. Let forDcl be the result of evaluating LexicalDeclaration.
        // 9. If forDcl is an abrupt completion, then
        // 9. a. Set the running execution context's LexicalEnvironment to oldEnv.
        // 9. b. Return Completion(forDcl).
        // 10. If isConst is false, let perIterationLets be boundNames; otherwise let perIterationLets be « ».
        // 11. Let bodyResult be ForBodyEvaluation(the first Expression, the second Expression, Statement, perIterationLets, labelSet).
        // 12. Set the running execution context's LexicalEnvironment to oldEnv.
        // 13. Return Completion(bodyResult).
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$ForStatement = $ForStatement;
class $ForInStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ForInStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        if (node.initializer.kind === typescript_1.SyntaxKind.VariableDeclarationList) {
            const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer, this, ctx);
            if ($initializer.isLexical) {
                this.BoundNames = $initializer.BoundNames;
                this.VarDeclaredNames = $statement.VarDeclaredNames;
                this.VarScopedDeclarations = $statement.VarScopedDeclarations;
            }
            else {
                this.BoundNames = kernel_1.emptyArray;
                this.VarDeclaredNames = [
                    ...$initializer.VarDeclaredNames,
                    ...$statement.VarDeclaredNames,
                ];
                this.VarScopedDeclarations = [
                    ...$initializer.VarScopedDeclarations,
                    ...$statement.VarScopedDeclarations,
                ];
            }
        }
        else {
            this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
            this.BoundNames = kernel_1.emptyArray;
            this.VarDeclaredNames = $statement.VarDeclaredNames;
            this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ForInStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-labelledevaluation
    // 13.7.5.11 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // IterationStatement : for ( LeftHandSideExpression in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, enumerate, assignment, labelSet).
        // IterationStatement : for ( var ForBinding in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, enumerate, varBinding, labelSet).
        // IterationStatement : for ( ForDeclaration in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, enumerate, lexicalBinding, labelSet).
        // IterationStatement : for ( LeftHandSideExpression of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet).
        // IterationStatement : for ( var ForBinding of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet).
        // IterationStatement : for ( ForDeclaration of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet).
        // IterationStatement : for await ( LeftHandSideExpression of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet, async).
        // IterationStatement : for await ( var ForBinding of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet, async).
        // IterationStatement : for await ( ForDeclaration of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet, async).
        return intrinsics.empty; // TODO: implement this
    }
    // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-evaluation
    // 13.7.5.14 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ForBinding : BindingIdentifier
        // 1. Let bindingId be StringValue of BindingIdentifier.
        // 2. Return ? ResolveBinding(bindingId).
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$ForInStatement = $ForInStatement;
class $ForOfStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ForOfStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        if (node.initializer.kind === typescript_1.SyntaxKind.VariableDeclarationList) {
            const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer, this, ctx);
            if ($initializer.isLexical) {
                this.BoundNames = $initializer.BoundNames;
                this.VarDeclaredNames = $statement.VarDeclaredNames;
                this.VarScopedDeclarations = $statement.VarScopedDeclarations;
            }
            else {
                this.BoundNames = kernel_1.emptyArray;
                this.VarDeclaredNames = [
                    ...$initializer.VarDeclaredNames,
                    ...$statement.VarDeclaredNames,
                ];
                this.VarScopedDeclarations = [
                    ...$initializer.VarScopedDeclarations,
                    ...$statement.VarScopedDeclarations,
                ];
            }
        }
        else {
            this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
            this.BoundNames = kernel_1.emptyArray;
            this.VarDeclaredNames = $statement.VarDeclaredNames;
            this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ForOfStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-labelledevaluation
    // 13.7.5.11 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // IterationStatement : for ( LeftHandSideExpression in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, enumerate, assignment, labelSet).
        // IterationStatement : for ( var ForBinding in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, enumerate, varBinding, labelSet).
        // IterationStatement : for ( ForDeclaration in Expression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, Expression, enumerate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, enumerate, lexicalBinding, labelSet).
        // IterationStatement : for ( LeftHandSideExpression of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet).
        // IterationStatement : for ( var ForBinding of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet).
        // IterationStatement : for ( ForDeclaration of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet).
        // IterationStatement : for await ( LeftHandSideExpression of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet, async).
        // IterationStatement : for await ( var ForBinding of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet, async).
        // IterationStatement : for await ( ForDeclaration of AssignmentExpression ) Statement
        // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, async-iterate).
        // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet, async).
        return intrinsics.empty; // TODO: implement this
    }
    // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-evaluation
    // 13.7.5.14 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$ForOfStatement = $ForOfStatement;
class $ContinueStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ContinueStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.$label = _shared_js_1.$identifier(node.label, this, ctx | 2048 /* IsLabelReference */, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.ContinueStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-continue-statement-runtime-semantics-evaluation
    // 13.8.3 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ContinueStatement : continue ;
        // 1. Return Completion { [[Type]]: continue, [[Value]]: empty, [[Target]]: empty }.
        if (this.$label === void 0) {
            return new empty_js_1.$Empty(realm, 3 /* continue */, intrinsics.empty, this);
        }
        // ContinueStatement : continue LabelIdentifier ;
        // 1. Let label be the StringValue of LabelIdentifier.
        // 2. Return Completion { [[Type]]: continue, [[Value]]: empty, [[Target]]: label }.
        return new empty_js_1.$Empty(realm, 3 /* continue */, this.$label.StringValue, this);
    }
}
exports.$ContinueStatement = $ContinueStatement;
class $BreakStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.BreakStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.$label = _shared_js_1.$identifier(node.label, this, ctx | 2048 /* IsLabelReference */, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.BreakStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-break-statement-runtime-semantics-evaluation
    // 13.9.3 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // BreakStatement : break ;
        // 1. Return Completion { [[Type]]: break, [[Value]]: empty, [[Target]]: empty }.
        if (this.$label === void 0) {
            return new empty_js_1.$Empty(realm, 2 /* break */, intrinsics.empty, this);
        }
        // BreakStatement : break LabelIdentifier ;
        // 1. Let label be the StringValue of LabelIdentifier.
        // 2. Return Completion { [[Type]]: break, [[Value]]: empty, [[Target]]: label }.
        return new empty_js_1.$Empty(realm, 2 /* break */, this.$label.StringValue, this);
    }
}
exports.$BreakStatement = $BreakStatement;
class $ReturnStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ReturnStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        if (node.expression === void 0) {
            this.$expression = void 0;
        }
        else {
            this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ReturnStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-return-statement
    // 13.10 The return Statement
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ReturnStatement : return ;
        // 1. Return Completion { [[Type]]: return, [[Value]]: undefined, [[Target]]: empty }.
        if (this.$expression === void 0) {
            return new undefined_js_1.$Undefined(realm, 4 /* return */);
        }
        // ReturnStatement : return Expression ;
        // 1. Let exprRef be the result of evaluating Expression.
        const exprRef = this.$expression.Evaluate(ctx);
        // 2. Let exprValue be ? GetValue(exprRef).
        const exprValue = exprRef.GetValue(ctx);
        if (exprValue.isAbrupt) {
            return exprValue.enrichWith(ctx, this);
        }
        // 3. If ! GetGeneratorKind() is async, set exprValue to ? Await(exprValue). // TODO
        // 4. Return Completion { [[Type]]: return, [[Value]]: exprValue, [[Target]]: empty }.
        return exprValue.ToCompletion(4 /* return */, intrinsics.empty);
    }
}
exports.$ReturnStatement = $ReturnStatement;
class $WithStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.WithStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.WithStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-with-statement-runtime-semantics-evaluation
    // 13.11.7 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // WithStatement : with ( Expression ) Statement
        // 1. Let val be the result of evaluating Expression.
        // 2. Let obj be ? ToObject(? GetValue(val)).
        // 3. Let oldEnv be the running execution context's LexicalEnvironment.
        // 4. Let newEnv be NewObjectEnvironment(obj, oldEnv).
        // 5. Set the withEnvironment flag of newEnv's EnvironmentRecord to true.
        // 6. Set the running execution context's LexicalEnvironment to newEnv.
        // 7. Let C be the result of evaluating Statement.
        // 8. Set the running execution context's LexicalEnvironment to oldEnv.
        // 9. Return Completion(UpdateEmpty(C, undefined)).
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$WithStatement = $WithStatement;
class $SwitchStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.SwitchStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $caseBlock = this.$caseBlock = new $CaseBlock(node.caseBlock, this, ctx);
        this.LexicallyDeclaredNames = $caseBlock.LexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $caseBlock.LexicallyScopedDeclarations;
        this.VarDeclaredNames = $caseBlock.VarDeclaredNames;
        this.VarScopedDeclarations = $caseBlock.VarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.SwitchStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-switch-statement-runtime-semantics-evaluation
    // 13.12.11 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const realm = ctx.Realm;
        // SwitchStatement : switch ( Expression ) CaseBlock
        // 1. Let exprRef be the result of evaluating Expression.
        // 2. Let switchValue be ? GetValue(exprRef).
        const switchValue = this.$expression.Evaluate(ctx).GetValue(ctx);
        if (switchValue.isAbrupt) {
            return switchValue.enrichWith(ctx, this);
        }
        // 3. Let oldEnv be the running execution context's LexicalEnvironment.
        const oldEnv = ctx.LexicalEnvironment;
        // 4. Let blockEnv be NewDeclarativeEnvironment(oldEnv).
        const blockEnv = ctx.LexicalEnvironment = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, oldEnv);
        // 5. Perform BlockDeclarationInstantiation(CaseBlock, blockEnv).
        const $BlockDeclarationInstantiationResult = _shared_js_1.BlockDeclarationInstantiation(ctx, this.LexicallyScopedDeclarations, blockEnv);
        if ($BlockDeclarationInstantiationResult.isAbrupt) {
            return $BlockDeclarationInstantiationResult;
        }
        // 6. Set the running execution context's LexicalEnvironment to blockEnv.
        realm.stack.push(ctx);
        // 7. Let R be the result of performing CaseBlockEvaluation of CaseBlock with argument switchValue.
        const R = this.EvaluateCaseBlock(ctx, switchValue);
        // 8. Set the running execution context's LexicalEnvironment to oldEnv.
        realm.stack.pop();
        ctx.LexicalEnvironment = oldEnv;
        // 9. Return R.
        return R;
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-caseblockevaluation
    // 13.12.9 Runtime Semantics: CaseBlockEvaluation
    EvaluateCaseBlock(ctx, switchValue) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const { $caseBlock: { $clauses: clauses } } = this;
        const { undefined: $undefined, empty } = realm['[[Intrinsics]]'];
        // CaseBlock : { }
        // 1. Return NormalCompletion(undefined).
        if (clauses.length === 0) {
            return new undefined_js_1.$Undefined(realm);
        }
        let V = $undefined;
        const defaultClauseIndex = clauses.findIndex((clause) => clause.$kind === typescript_1.SyntaxKind.DefaultClause);
        class CaseClausesEvaluationResult {
            constructor(result, found, isAbrupt) {
                this.result = result;
                this.found = found;
                this.isAbrupt = isAbrupt;
            }
        }
        const evaluateCaseClauses = (inclusiveStartIndex, exclusiveEndIndex, found = false) => {
            // 1. Let V be undefined.
            // 2. Let A be the List of CaseClause items in CaseClauses, in source text order.
            // 3. Let found be false.
            // 4. For each CaseClause C in A, do
            for (let i = inclusiveStartIndex; i < exclusiveEndIndex; i++) {
                const C = clauses[i];
                // 4. a. If found is false, then
                if (!found) {
                    // 4. a. i. Set found to ? CaseClauseIsSelected(C, input).
                    found = this.IsCaseClauseSelected(ctx, C, switchValue);
                }
                // 4. b. If found is true, then
                if (found) {
                    // 4. b. i. Let R be the result of evaluating C.
                    const R = _shared_js_1.evaluateStatementList(ctx, C.$statements);
                    // 4. b. ii. If R.[[Value]] is not empty, set V to R.[[Value]].
                    if (R.hasValue) {
                        V = R;
                    }
                    // 4. b. iii. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
                    if (R.isAbrupt) {
                        return new CaseClausesEvaluationResult(R.enrichWith(ctx, this).UpdateEmpty(V), found, true);
                    }
                }
            }
            // 5. Return NormalCompletion(V).
            return new CaseClausesEvaluationResult(V.ToCompletion(1 /* normal */, intrinsics.empty), found, false);
        };
        // CaseBlock : { CaseClauses }
        if (defaultClauseIndex === -1) {
            return evaluateCaseClauses(0, clauses.length).result;
        }
        // CaseBlock : { CaseClauses opt DefaultClause CaseClauses opt }
        // 1. Let V be undefined.
        // 2. If the first CaseClauses is present, then
        // 2. a. Let A be the List of CaseClause items in the first CaseClauses, in source text order.
        // 3. Else,
        // 3. a. Let A be « ».
        // 4. Let found be false.
        // 5. For each CaseClause C in A, do
        // 5. a. If found is false, then
        // 5. a. i. Set found to ? CaseClauseIsSelected(C, input).
        // 5. b. If found is true, then
        // 5. b. i. Let R be the result of evaluating C.
        // 5. b. ii. If R.[[Value]] is not empty, set V to R.[[Value]].
        // 5. b. iii. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
        let { result, found, isAbrupt } = evaluateCaseClauses(0, defaultClauseIndex);
        if (isAbrupt) {
            return result;
        }
        // 6. Let foundInB be false.
        // 7. If the second CaseClauses is present, then
        // 7. a. Let B be the List of CaseClause items in the second CaseClauses, in source text order.
        // 8. Else,
        // 8. a. Let B be « ».
        // 9. If found is false, then
        if (!found) {
            // 9. a. For each CaseClause C in B, do
            // 9. a. i. If foundInB is false, then
            // 9. a. i. 1. Set foundInB to ? CaseClauseIsSelected(C, input).
            // 9. a. ii. If foundInB is true, then
            // 9. a. ii. 1. Let R be the result of evaluating CaseClause C.
            // 9. a. ii. 2. If R.[[Value]] is not empty, set V to R.[[Value]].
            // 9. a. ii. 3. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
            // 10. If foundInB is true, return NormalCompletion(V).
            ({ result, isAbrupt, found } = evaluateCaseClauses(defaultClauseIndex + 1, clauses.length));
            if (isAbrupt || found) {
                return result;
            }
        }
        // 11. Let R be the result of evaluating DefaultClause.
        // 12. If R.[[Value]] is not empty, set V to R.[[Value]].
        // 13. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
        ({ result, isAbrupt } = evaluateCaseClauses(defaultClauseIndex, defaultClauseIndex + 1, true));
        if (isAbrupt) {
            return result;
        }
        // 14. For each CaseClause C in B (NOTE: this is another complete iteration of the second CaseClauses), do
        // 14. a. Let R be the result of evaluating CaseClause C.
        // 14. b. If R.[[Value]] is not empty, set V to R.[[Value]].
        // 14. c. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
        // 15. Return NormalCompletion(V).
        return evaluateCaseClauses(defaultClauseIndex + 1, clauses.length, true).result;
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-caseclauseisselected
    // 13.12.10 Runtime Semantics: CaseClauseIsSelected ( C , input )
    IsCaseClauseSelected(ctx, clause, switchValue) {
        ctx.checkTimeout();
        // 1. Assert: C is an instance of the production CaseClause:caseExpression:StatementListopt .
        // 2. Let exprRef be the result of evaluating the Expression of C.
        // 3. Let clauseSelector be ? GetValue(exprRef).
        // 4. Return the result of performing Strict Equality Comparison input === clauseSelector.
        return clause.$expression.Evaluate(ctx).GetValue(ctx)['[[Value]]'] === switchValue['[[Value]]'];
    }
}
exports.$SwitchStatement = $SwitchStatement;
class $LabeledStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.LabeledStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevellexicallydeclarednames
        // 13.13.8 Static Semantics: TopLevelLexicallyDeclaredNames
        this.TopLevelLexicallyDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevellexicallyscopeddeclarations
        // 13.13.9 Static Semantics: TopLevelLexicallyScopedDeclarations
        this.TopLevelLexicallyScopedDeclarations = kernel_1.emptyArray;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        this.$label = _shared_js_1.$identifier(node.label, this, ctx | 1024 /* IsLabel */, -1);
        const $statement = this.$statement = _shared_js_1.$$esLabelledItem(node.statement, this, ctx, -1);
        if ($statement.$kind === typescript_1.SyntaxKind.FunctionDeclaration) {
            this.LexicallyDeclaredNames = $statement.BoundNames;
            this.LexicallyScopedDeclarations = [$statement];
            this.TopLevelVarDeclaredNames = $statement.BoundNames;
            this.TopLevelVarScopedDeclarations = [$statement];
            this.VarDeclaredNames = kernel_1.emptyArray;
            this.VarScopedDeclarations = kernel_1.emptyArray;
        }
        else {
            this.LexicallyDeclaredNames = kernel_1.emptyArray;
            this.LexicallyScopedDeclarations = kernel_1.emptyArray;
            if ($statement.$kind === typescript_1.SyntaxKind.LabeledStatement) {
                this.TopLevelVarDeclaredNames = $statement.TopLevelVarDeclaredNames;
                this.TopLevelVarScopedDeclarations = $statement.TopLevelVarScopedDeclarations;
            }
            else {
                this.TopLevelVarDeclaredNames = $statement.VarDeclaredNames;
                this.TopLevelVarScopedDeclarations = $statement.VarScopedDeclarations;
            }
            this.VarDeclaredNames = $statement.VarDeclaredNames;
            this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.LabeledStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-runtime-semantics-labelledevaluation
    // 13.13.14 Runtime Semantics: LabelledEvaluation
    EvaluateLabelled(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
        // LabelledStatement : LabelIdentifier : LabelledItem
        // 1. Let label be the StringValue of LabelIdentifier.
        // 2. Append label as an element of labelSet.
        // 3. Let stmtResult be LabelledEvaluation of LabelledItem with argument labelSet.
        // 4. If stmtResult.[[Type]] is break and SameValue(stmtResult.[[Target]], label) is true, then
        // 4. a. Set stmtResult to NormalCompletion(stmtResult.[[Value]]).
        // 5. Return Completion(stmtResult).
        // LabelledItem : Statement
        // 1. If Statement is either a LabelledStatement or a BreakableStatement, then
        // 1. a. Return LabelledEvaluation of Statement with argument labelSet.
        // 2. Else,
        // 2. a. Return the result of evaluating Statement.
        // LabelledItem : FunctionDeclaration
        // 1. Return the result of evaluating FunctionDeclaration.
        return intrinsics.undefined; // TODO: implement this
    }
    // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-runtime-semantics-evaluation
    // 13.13.15 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // LabelledStatement : LabelIdentifier : LabelledItem
        // 1. Let newLabelSet be a new empty List.
        // 2. Return LabelledEvaluation of this LabelledStatement with argument newLabelSet.
        return intrinsics.undefined; // TODO: implement this
    }
}
exports.$LabeledStatement = $LabeledStatement;
class $ThrowStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ThrowStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.ThrowStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-throw-statement-runtime-semantics-evaluation
    // 13.14.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // ThrowStatement : throw Expression ;
        // 1. Let exprRef be the result of evaluating Expression.
        const exprRef = this.$expression.Evaluate(ctx);
        // 2. Let exprValue be ? GetValue(exprRef).
        const exprValue = exprRef.GetValue(ctx);
        if (exprValue.isAbrupt) {
            return exprValue.enrichWith(ctx, this);
        }
        // 3. Return ThrowCompletion(exprValue).
        return exprValue.ToCompletion(5 /* throw */, intrinsics.empty);
    }
}
exports.$ThrowStatement = $ThrowStatement;
class $TryStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.TryStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        const $tryBlock = this.$tryBlock = new $Block(node.tryBlock, this, ctx, -1);
        if (node.catchClause === void 0) {
            // finallyBlock must be defined
            this.$catchClause = void 0;
            const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock, this, ctx, -1);
            this.VarDeclaredNames = [
                ...$tryBlock.VarDeclaredNames,
                ...$finallyBlock.VarDeclaredNames,
            ];
            this.VarScopedDeclarations = [
                ...$tryBlock.VarScopedDeclarations,
                ...$finallyBlock.VarScopedDeclarations,
            ];
        }
        else if (node.finallyBlock === void 0) {
            // catchClause must be defined
            const $catchClause = this.$catchClause = new $CatchClause(node.catchClause, this, ctx);
            this.$finallyBlock = void 0;
            this.VarDeclaredNames = [
                ...$tryBlock.VarDeclaredNames,
                ...$catchClause.VarDeclaredNames,
            ];
            this.VarScopedDeclarations = [
                ...$tryBlock.VarScopedDeclarations,
                ...$catchClause.VarScopedDeclarations,
            ];
        }
        else {
            const $catchClause = this.$catchClause = new $CatchClause(node.catchClause, this, ctx);
            const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock, this, ctx, -1);
            this.VarDeclaredNames = [
                ...$tryBlock.VarDeclaredNames,
                ...$catchClause.VarDeclaredNames,
                ...$finallyBlock.VarDeclaredNames,
            ];
            this.VarScopedDeclarations = [
                ...$tryBlock.VarScopedDeclarations,
                ...$catchClause.VarScopedDeclarations,
                ...$finallyBlock.VarScopedDeclarations,
            ];
        }
    }
    get $kind() { return typescript_1.SyntaxKind.TryStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-try-statement-runtime-semantics-evaluation
    // 13.15.8 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const realm = ctx.Realm;
        // TryStatement : try Block Catch
        // 1. Let B be the result of evaluating Block.
        // 2. If B.[[Type]] is throw, let C be CatchClauseEvaluation of Catch with argument B.[[Value]].
        // 3. Else, let C be B.
        // 4. Return Completion(UpdateEmpty(C, undefined)).
        // TryStatement : try Block Finally
        // 1. Let B be the result of evaluating Block.
        // 2. Let F be the result of evaluating Finally.
        // 3. If F.[[Type]] is normal, set F to B.
        // 4. Return Completion(UpdateEmpty(F, undefined)).
        // TryStatement : try Block Catch Finally
        // 1. Let B be the result of evaluating Block.
        // 2. If B.[[Type]] is throw, let C be CatchClauseEvaluation of Catch with argument B.[[Value]].
        // 3. Else, let C be B.
        // 4. Let F be the result of evaluating Finally.
        // 5. If F.[[Type]] is normal, set F to C.
        // 6. Return Completion(UpdateEmpty(F, undefined)).
        let result = this.$tryBlock.Evaluate(ctx);
        if (this.$catchClause !== void 0) {
            result = result['[[Type]]'] === 5 /* throw */ ? this.EvaluateCatchClause(ctx, result.GetValue(ctx)) : result; // TODO: fix types
        }
        const $finallyBlock = this.$finallyBlock;
        if ($finallyBlock !== void 0) {
            const F = $finallyBlock.Evaluate(ctx);
            result = F['[[Type]]'] !== 1 /* normal */ ? F : result;
        }
        result.UpdateEmpty(realm['[[Intrinsics]]'].undefined);
        return result;
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-catchclauseevaluation
    // 13.15.7 Runtime Semantics: CatchClauseEvaluation
    EvaluateCatchClause(ctx, thrownValue) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const catchClause = this.$catchClause;
        const varDeclarations = catchClause === null || catchClause === void 0 ? void 0 : catchClause.$variableDeclaration;
        const hasCatchParamteres = varDeclarations !== void 0;
        // Catch : catch Block
        // 1. Return the result of evaluating Block.
        // Catch : catch ( CatchParameter ) Block
        // 1. Let oldEnv be the running execution context's LexicalEnvironment.
        const oldEnv = ctx.LexicalEnvironment;
        if (hasCatchParamteres) {
            // 2. Let catchEnv be NewDeclarativeEnvironment(oldEnv).
            // 3. Let catchEnvRec be catchEnv's EnvironmentRecord.
            ctx.LexicalEnvironment = new environment_record_js_1.$DeclarativeEnvRec(this.logger, realm, oldEnv);
            // 4. For each element argName of the BoundNames of CatchParameter, do
            // 4. a. Perform ! catchEnvRec.CreateMutableBinding(argName, false).
            catchClause === null || catchClause === void 0 ? void 0 : catchClause.CreateBinding(ctx, realm);
            // 5. Set the running execution context's LexicalEnvironment to catchEnv.
            realm.stack.push(ctx);
            // 6. Let status be the result of performing BindingInitialization for CatchParameter passing thrownValue and catchEnv as arguments.
            const status = varDeclarations === null || varDeclarations === void 0 ? void 0 : varDeclarations.InitializeBinding(ctx, thrownValue);
            // 7. If status is an abrupt completion, then
            if (status === null || status === void 0 ? void 0 : status.isAbrupt) {
                // 7. a. Set the running execution context's LexicalEnvironment to oldEnv.
                realm.stack.pop();
                ctx.LexicalEnvironment = oldEnv;
                // 7. b. Return Completion(status).
                return status;
            }
        }
        // 8. Let B be the result of evaluating Block.
        const B = catchClause === null || catchClause === void 0 ? void 0 : catchClause.$block.Evaluate(ctx);
        // 9. Set the running execution context's LexicalEnvironment to oldEnv.
        if (hasCatchParamteres) {
            realm.stack.pop();
            ctx.LexicalEnvironment = oldEnv;
        }
        // 10. Return Completion(B).
        return B; // TODO fix typings
    }
}
exports.$TryStatement = $TryStatement;
class $DebuggerStatement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.DebuggerStatement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
        // 13.1.5 Static Semantics: VarDeclaredNames
        this.VarDeclaredNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
        // 13.1.6 Static Semantics: VarScopedDeclarations
        this.VarScopedDeclarations = kernel_1.emptyArray;
    }
    get $kind() { return typescript_1.SyntaxKind.DebuggerStatement; }
    // http://www.ecma-international.org/ecma-262/#sec-debugger-statement-runtime-semantics-evaluation
    // 13.16.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // DebuggerStatement : debugger ;
        // 1. If an implementation-defined debugging facility is available and enabled, then
        // 1. a. Perform an implementation-defined debugging action.
        // 1. b. Let result be an implementation-defined Completion value.
        // 2. Else,
        // 2. a. Let result be NormalCompletion(empty).
        // 3. Return result.
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$DebuggerStatement = $DebuggerStatement;
function $$clauseList(nodes, parent, ctx) {
    const len = nodes.length;
    let node;
    const $nodes = [];
    for (let i = 0; i < len; ++i) {
        node = nodes[i];
        switch (node.kind) {
            case typescript_1.SyntaxKind.CaseClause:
                $nodes[i] = new $CaseClause(node, parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.DefaultClause:
                $nodes[i] = new $DefaultClause(node, parent, ctx, i);
                break;
        }
    }
    return $nodes;
}
exports.$$clauseList = $$clauseList;
class $CaseBlock {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.CaseBlock`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const $clauses = this.$clauses = $$clauseList(node.clauses, this, ctx);
        this.LexicallyDeclaredNames = $clauses.flatMap(_shared_js_1.getLexicallyDeclaredNames);
        this.LexicallyScopedDeclarations = $clauses.flatMap(_shared_js_1.getLexicallyScopedDeclarations);
        this.VarDeclaredNames = $clauses.flatMap(_shared_js_1.getVarDeclaredNames);
        this.VarScopedDeclarations = $clauses.flatMap(_shared_js_1.getVarScopedDeclarations);
    }
    get $kind() { return typescript_1.SyntaxKind.CaseBlock; }
}
exports.$CaseBlock = $CaseBlock;
class $CaseClause {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.CaseClause`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        const $statements = this.$statements = _shared_js_1.$$tsStatementList(node.statements, this, ctx);
        this.LexicallyDeclaredNames = $statements.flatMap(_shared_js_1.getLexicallyDeclaredNames);
        this.LexicallyScopedDeclarations = $statements.flatMap(_shared_js_1.getLexicallyScopedDeclarations);
        this.VarDeclaredNames = $statements.flatMap(_shared_js_1.getVarDeclaredNames);
        this.VarScopedDeclarations = $statements.flatMap(_shared_js_1.getVarScopedDeclarations);
    }
    get $kind() { return typescript_1.SyntaxKind.CaseClause; }
}
exports.$CaseClause = $CaseClause;
class $DefaultClause {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.DefaultClause`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const $statements = this.$statements = _shared_js_1.$$tsStatementList(node.statements, this, ctx);
        this.LexicallyDeclaredNames = $statements.flatMap(_shared_js_1.getLexicallyDeclaredNames);
        this.LexicallyScopedDeclarations = $statements.flatMap(_shared_js_1.getLexicallyScopedDeclarations);
        this.VarDeclaredNames = $statements.flatMap(_shared_js_1.getVarDeclaredNames);
        this.VarScopedDeclarations = $statements.flatMap(_shared_js_1.getVarScopedDeclarations);
    }
    get $kind() { return typescript_1.SyntaxKind.DefaultClause; }
}
exports.$DefaultClause = $DefaultClause;
class $CatchClause {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.CatchClause`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        ctx |= 32 /* InCatchClause */;
        if (node.variableDeclaration === void 0) {
            this.$variableDeclaration = void 0;
        }
        else {
            this.$variableDeclaration = new $VariableDeclaration(node.variableDeclaration, this, ctx, -1);
        }
        const $block = this.$block = new $Block(node.block, this, ctx, -1);
        this.VarDeclaredNames = $block.VarDeclaredNames;
        this.VarScopedDeclarations = $block.VarScopedDeclarations;
    }
    get $kind() { return typescript_1.SyntaxKind.CatchClause; }
    CreateBinding(ctx, realm) {
        var _a, _b;
        ctx.checkTimeout();
        for (const argName of (_b = (_a = this.$variableDeclaration) === null || _a === void 0 ? void 0 : _a.BoundNames) !== null && _b !== void 0 ? _b : []) {
            ctx.LexicalEnvironment.CreateMutableBinding(ctx, argName, realm['[[Intrinsics]]'].false);
        }
    }
}
exports.$CatchClause = $CatchClause;
// #endregion
//# sourceMappingURL=statements.js.map