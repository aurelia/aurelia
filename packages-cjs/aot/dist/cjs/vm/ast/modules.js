"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$QualifiedName = exports.$ExternalModuleReference = exports.$ModuleBlock = exports.$NamespaceExportDeclaration = exports.$ExportSpecifier = exports.$NamedExports = exports.$ExportDeclaration = exports.$ExportAssignment = exports.ExportEntryRecord = exports.$NamespaceImport = exports.$ImportSpecifier = exports.$NamedImports = exports.$ImportClause = exports.$ImportDeclaration = exports.$ImportEqualsDeclaration = exports.ImportEntryRecord = exports.$ModuleDeclaration = exports.$DocumentFragment = exports.$ESModule = exports.$ESScript = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const realm_js_1 = require("../realm.js");
const environment_record_js_1 = require("../types/environment-record.js");
const namespace_js_1 = require("../exotics/namespace.js");
const string_js_1 = require("../types/string.js");
const undefined_js_1 = require("../types/undefined.js");
const number_js_1 = require("../types/number.js");
const null_js_1 = require("../types/null.js");
const empty_js_1 = require("../types/empty.js");
const error_js_1 = require("../types/error.js");
const list_js_1 = require("../types/list.js");
const _shared_js_1 = require("./_shared.js");
const expressions_js_1 = require("./expressions.js");
const classes_js_1 = require("./classes.js");
const statements_js_1 = require("./statements.js");
const functions_js_1 = require("./functions.js");
const types_js_1 = require("./types.js");
const literals_js_1 = require("./literals.js");
const string_js_2 = require("../globals/string.js");
// http://www.ecma-international.org/ecma-262/#sec-scripts
class $ESScript {
    constructor(logger, $file, node, realm) {
        this.logger = logger;
        this.$file = $file;
        this.node = node;
        this.realm = realm;
        this.disposed = false;
        this.mos = this;
        this.parent = this;
        this.ctx = 0 /* None */;
        this.depth = 0;
        const intrinsics = realm['[[Intrinsics]]'];
        this.ExecutionResult = intrinsics.empty;
        this['[[Environment]]'] = intrinsics.undefined;
        this.path = `ESScript<(...)${$file.rootlessPath}>`;
        this.logger = logger.root;
        let ctx = 0 /* None */;
        this.DirectivePrologue = _shared_js_1.GetDirectivePrologue(node.statements);
        if (this.DirectivePrologue.ContainsUseStrict) {
            ctx |= 65536 /* InStrictMode */;
        }
        const LexicallyDeclaredNames = this.LexicallyDeclaredNames = [];
        const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [];
        const VarDeclaredNames = this.VarDeclaredNames = [];
        const VarScopedDeclarations = this.VarScopedDeclarations = [];
        const $statements = this.$statements = [];
        const statements = node.statements;
        let stmt;
        let $stmt;
        let s = 0;
        for (let i = 0, ii = statements.length; i < ii; ++i) {
            stmt = statements[i];
            switch (stmt.kind) {
                case typescript_1.SyntaxKind.VariableStatement:
                    $stmt = $statements[s] = new statements_js_1.$VariableStatement(stmt, this, ctx, s);
                    ++s;
                    if ($stmt.isLexical) {
                        LexicallyDeclaredNames.push(...$stmt.BoundNames);
                        LexicallyScopedDeclarations.push($stmt);
                    }
                    else {
                        VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                        VarScopedDeclarations.push($stmt);
                    }
                    break;
                case typescript_1.SyntaxKind.FunctionDeclaration:
                    $stmt = $statements[s] = new functions_js_1.$FunctionDeclaration(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.BoundNames);
                    VarScopedDeclarations.push($stmt);
                    break;
                case typescript_1.SyntaxKind.ClassDeclaration:
                    $stmt = $statements[s] = new classes_js_1.$ClassDeclaration(stmt, this, ctx, s);
                    ++s;
                    LexicallyDeclaredNames.push(...$stmt.BoundNames);
                    LexicallyScopedDeclarations.push($stmt);
                    break;
                case typescript_1.SyntaxKind.Block:
                    $stmt = $statements[s] = new statements_js_1.$Block(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.EmptyStatement:
                    $stmt = $statements[s] = new statements_js_1.$EmptyStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ExpressionStatement:
                    $stmt = $statements[s] = new statements_js_1.$ExpressionStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.IfStatement:
                    $stmt = $statements[s] = new statements_js_1.$IfStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.DoStatement:
                    $stmt = $statements[s] = new statements_js_1.$DoStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.WhileStatement:
                    $stmt = $statements[s] = new statements_js_1.$WhileStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForInStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForInStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForOfStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForOfStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ContinueStatement:
                    $stmt = $statements[s] = new statements_js_1.$ContinueStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.BreakStatement:
                    $stmt = $statements[s] = new statements_js_1.$BreakStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ReturnStatement:
                    $stmt = $statements[s] = new statements_js_1.$ReturnStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.WithStatement:
                    $stmt = $statements[s] = new statements_js_1.$WithStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.SwitchStatement:
                    $stmt = $statements[s] = new statements_js_1.$SwitchStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.LabeledStatement:
                    $stmt = $statements[s] = new statements_js_1.$LabeledStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.TopLevelVarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.TopLevelVarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ThrowStatement:
                    $stmt = $statements[s] = new statements_js_1.$ThrowStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.TryStatement:
                    $stmt = $statements[s] = new statements_js_1.$TryStatement(stmt, this, ctx, s);
                    ++s;
                    VarDeclaredNames.push(...$stmt.VarDeclaredNames);
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.DebuggerStatement:
                    $stmt = $statements[s] = new statements_js_1.$DebuggerStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                default:
                    throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
            }
        }
    }
    get isNull() { return false; }
    get isScript() { return true; }
    get isModule() { return false; }
    // http://www.ecma-international.org/ecma-262/#sec-globaldeclarationinstantiation
    // 15.1.11 Runtime Semantics: GlobalDeclarationInstantiation ( script , env )
    InstantiateGlobalDeclaration(ctx, env) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const script = this;
        // 1. Let envRec be env's EnvironmentRecord.
        const envRec = env;
        // 2. Assert: envRec is a global Environment Record.
        // 3. Let lexNames be the LexicallyDeclaredNames of script.
        const lexNames = script.LexicallyDeclaredNames;
        // 4. Let varNames be the VarDeclaredNames of script.
        const varNames = script.VarDeclaredNames;
        // 5. For each name in lexNames, do
        for (const name of lexNames) {
            // 5. a. If envRec.HasVarDeclaration(name) is true, throw a SyntaxError exception.
            if (envRec.HasVarDeclaration(ctx, name).isTruthy) {
                return new error_js_1.$SyntaxError(realm, `${name} is already var-declared in global scope`).enrichWith(ctx, this);
            }
            // 5. b. If envRec.HasLexicalDeclaration(name) is true, throw a SyntaxError exception.
            if (envRec.HasLexicalDeclaration(ctx, name).isTruthy) {
                return new error_js_1.$SyntaxError(realm, `${name} is already lexically-declared in global scope`).enrichWith(ctx, this);
            }
            // 5. c. Let hasRestrictedGlobal be ? envRec.HasRestrictedGlobalProperty(name).
            const hasRestrictedGlobal = envRec.HasRestrictedGlobalProperty(ctx, name);
            if (hasRestrictedGlobal.isAbrupt) {
                return hasRestrictedGlobal.enrichWith(ctx, this);
            }
            // 5. d. If hasRestrictedGlobal is true, throw a SyntaxError exception.
            if (hasRestrictedGlobal.isTruthy) {
                return new error_js_1.$SyntaxError(realm, `${name} is a restricted global property`).enrichWith(ctx, this);
            }
        }
        // 6. For each name in varNames, do
        for (const name of varNames) {
            // 6. a. If envRec.HasLexicalDeclaration(name) is true, throw a SyntaxError exception.
            if (envRec.HasLexicalDeclaration(ctx, name).isTruthy) {
                return new error_js_1.$SyntaxError(realm, `${name} is already lexically-declared in global scope`).enrichWith(ctx, this);
            }
        }
        // 7. Let varDeclarations be the VarScopedDeclarations of script.
        const varDeclarations = script.VarScopedDeclarations;
        // 8. Let functionsToInitialize be a new empty List.
        const functionsToInitialize = [];
        // 9. Let declaredFunctionNames be a new empty List.
        const declaredFunctionNames = new string_js_2.$StringSet();
        // 10. For each d in varDeclarations, in reverse list order, do
        for (let i = varDeclarations.length - 1; i >= 0; --i) {
            const d = varDeclarations[i];
            // 10. a. If d is neither a VariableDeclaration nor a ForBinding nor a BindingIdentifier, then
            if (d instanceof functions_js_1.$FunctionDeclaration) {
                // 10. a. i. Assert: d is either a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration.
                // 10. a. ii. NOTE: If there are multiple function declarations for the same name, the last declaration is used.
                // 10. a. iii. Let fn be the sole element of the BoundNames of d.
                const [fn] = d.BoundNames;
                // 10. a. iv. If fn is not an element of declaredFunctionNames, then
                if (!declaredFunctionNames.has(fn)) {
                    // 10. a. iv. 1. Let fnDefinable be ? envRec.CanDeclareGlobalFunction(fn).
                    const fnDefinable = envRec.CanDeclareGlobalFunction(ctx, fn);
                    if (fnDefinable.isAbrupt) {
                        return fnDefinable.enrichWith(ctx, this);
                    }
                    // 10. a. iv. 2. If fnDefinable is false, throw a TypeError exception.
                    if (fnDefinable.isFalsey) {
                        return new error_js_1.$TypeError(realm, `function declaration ${fn} cannot be defined in global scope.`).enrichWith(ctx, this);
                    }
                    // 10. a. iv. 3. Append fn to declaredFunctionNames.
                    declaredFunctionNames.add(fn);
                    // 10. a. iv. 4. Insert d as the first element of functionsToInitialize.
                    functionsToInitialize.unshift(d);
                }
            }
        }
        // 11. Let declaredVarNames be a new empty List.
        const declaredVarNames = new string_js_2.$StringSet();
        // 12. For each d in varDeclarations, do
        for (const d of varDeclarations) {
            // 12. a. If d is a VariableDeclaration, a ForBinding, or a BindingIdentifier, then
            if (!(d instanceof functions_js_1.$FunctionDeclaration)) {
                // 12. a. i. For each String vn in the BoundNames of d, do
                for (const vn of d.BoundNames) {
                    // 12. a. i. 1. If vn is not an element of declaredFunctionNames, then
                    if (!declaredFunctionNames.has(vn)) {
                        // 12. a. i. 1. a. Let vnDefinable be ? envRec.CanDeclareGlobalVar(vn).
                        const vnDefinable = envRec.CanDeclareGlobalVar(ctx, vn);
                        if (vnDefinable.isAbrupt) {
                            return vnDefinable.enrichWith(ctx, this);
                        }
                        // 12. a. i. 1. b. If vnDefinable is false, throw a TypeError exception.
                        if (vnDefinable.isFalsey) {
                            return new error_js_1.$TypeError(realm, `var declaration ${vn} cannot be defined in global scope.`).enrichWith(ctx, this);
                        }
                        // 12. a. i. 1. c. If vn is not an element of declaredVarNames, then
                        if (!declaredVarNames.has(vn)) {
                            // 12. a. i. 1. c. i. Append vn to declaredVarNames.
                            declaredVarNames.add(vn);
                        }
                    }
                }
            }
        }
        // 13. NOTE: No abnormal terminations occur after this algorithm step if the global object is an ordinary object. However, if the global object is a Proxy exotic object it may exhibit behaviours that cause abnormal terminations in some of the following steps.
        // 14. NOTE: Annex B.3.3.2 adds additional steps at this point.
        // 15. Let lexDeclarations be the LexicallyScopedDeclarations of script.
        const lexDeclarations = script.LexicallyScopedDeclarations;
        // 16. For each element d in lexDeclarations, do
        for (const d of lexDeclarations) {
            // 16. a. NOTE: Lexically declared names are only instantiated here but not initialized.
            // 16. b. For each element dn of the BoundNames of d, do
            for (const dn of d.BoundNames) {
                // 16. b. i. If IsConstantDeclaration of d is true, then
                if (d.IsConstantDeclaration) {
                    // 16. b. i. 1. Perform ? envRec.CreateImmutableBinding(dn, true).
                    const $CreateImmutableBindingResult = envRec.CreateImmutableBinding(ctx, dn, intrinsics.true);
                    if ($CreateImmutableBindingResult.isAbrupt) {
                        return $CreateImmutableBindingResult.enrichWith(ctx, this);
                    }
                }
                // 16. b. ii. Else,
                else {
                    // 16. b. ii. 1. Perform ? envRec.CreateMutableBinding(dn, false).
                    const $CreateImmutableBindingResult = envRec.CreateImmutableBinding(ctx, dn, intrinsics.false);
                    if ($CreateImmutableBindingResult.isAbrupt) {
                        return $CreateImmutableBindingResult.enrichWith(ctx, this);
                    }
                }
            }
        }
        // 17. For each Parse Node f in functionsToInitialize, do
        for (const f of functionsToInitialize) {
            // 17. a. Let fn be the sole element of the BoundNames of f.
            const [fn] = f.BoundNames;
            // 17. b. Let fo be the result of performing InstantiateFunctionObject for f with argument env.
            const fo = f.InstantiateFunctionObject(ctx, env);
            if (fo.isAbrupt) {
                return fo.enrichWith(ctx, this);
            }
            // 17. c. Perform ? envRec.CreateGlobalFunctionBinding(fn, fo, false).
            const $CreateGlobalFunctionBindingResult = envRec.CreateGlobalFunctionBinding(ctx, fn, fo, intrinsics.false);
            if ($CreateGlobalFunctionBindingResult.isAbrupt) {
                return $CreateGlobalFunctionBindingResult.enrichWith(ctx, this);
            }
        }
        // 18. For each String vn in declaredVarNames, in list order, do
        for (const vn of declaredVarNames) {
            // 18. a. Perform ? envRec.CreateGlobalVarBinding(vn, false).
            const $CreateGlobalVarBindingResult = envRec.CreateGlobalVarBinding(ctx, vn, intrinsics.false);
            if ($CreateGlobalVarBindingResult.isAbrupt) {
                return $CreateGlobalVarBindingResult.enrichWith(ctx, this);
            }
        }
        // 19. Return NormalCompletion(empty).
        return new empty_js_1.$Empty(realm);
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-scriptevaluation
    // 15.1.10 ScriptEvaluation ( scriptRecord )
    EvaluateScript(ctx) {
        const scriptRecord = this;
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const stack = realm.stack;
        // 1. Let globalEnv be scriptRecord.[[Realm]].[[GlobalEnv]].
        const globalEnv = scriptRecord.realm['[[GlobalEnv]]'];
        // 2. Let scriptCxt be a new ECMAScript code execution context.
        const scriptCxt = new realm_js_1.ExecutionContext(realm);
        // 3. Set the Function of scriptCxt to null.
        // 4. Set the Realm of scriptCxt to scriptRecord.[[Realm]].
        // 5. Set the ScriptOrModule of scriptCxt to scriptRecord.
        scriptCxt.ScriptOrModule = scriptRecord;
        // 6. Set the VariableEnvironment of scriptCxt to globalEnv.
        scriptCxt.VariableEnvironment = globalEnv;
        // 7. Set the LexicalEnvironment of scriptCxt to globalEnv.
        scriptCxt.LexicalEnvironment = globalEnv;
        // 8. Suspend the currently running execution context.
        ctx.suspend();
        // 9. Push scriptCxt on to the execution context stack; scriptCxt is now the running execution context.
        stack.push(scriptCxt);
        // 10. Let scriptBody be scriptRecord.[[ECMAScriptCode]].
        const scriptBody = scriptRecord;
        // 11. Let result be GlobalDeclarationInstantiation(scriptBody, globalEnv).
        let result = scriptBody.InstantiateGlobalDeclaration(scriptCxt, globalEnv);
        // 12. If result.[[Type]] is normal, then
        if (result['[[Type]]'] === 1 /* normal */) {
            // 12. a. Set result to the result of evaluating scriptBody.
            const $statements = scriptBody.$statements;
            let $statement;
            let sl = (void 0);
            for (let i = 0, ii = $statements.length; i < ii; ++i) {
                $statement = $statements[i];
                switch ($statement.$kind) {
                    case typescript_1.SyntaxKind.VariableStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.FunctionDeclaration:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ClassDeclaration:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.Block:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.EmptyStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ExpressionStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.IfStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.DoStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt, new string_js_2.$StringSet());
                        break;
                    case typescript_1.SyntaxKind.WhileStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt, new string_js_2.$StringSet());
                        break;
                    case typescript_1.SyntaxKind.ForStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ForInStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ForOfStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ContinueStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.BreakStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ReturnStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.WithStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.SwitchStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.LabeledStatement:
                        sl = $statement.EvaluateLabelled(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.ThrowStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.TryStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    case typescript_1.SyntaxKind.DebuggerStatement:
                        sl = $statement.Evaluate(scriptCxt);
                        break;
                    default:
                        throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[$statement.$kind]}.`);
                }
                if (sl.isAbrupt) {
                    sl.enrichWith(ctx, this);
                    break;
                }
            }
            result = sl;
        }
        // 13. If result.[[Type]] is normal and result.[[Value]] is empty, then
        if (result['[[Type]]'] === 1 /* normal */ && result.isEmpty) {
            // 13. a. Set result to NormalCompletion(undefined).
            result = new undefined_js_1.$Undefined(realm);
        }
        // 14. Suspend scriptCxt and remove it from the execution context stack.
        scriptCxt.suspend();
        stack.pop();
        // 15. Assert: The execution context stack is not empty.
        // 16. Resume the context that is now on the top of the execution context stack as the running execution context.
        ctx.resume();
        // 17. Return Completion(result).
        return result;
    }
}
exports.$ESScript = $ESScript;
// http://www.ecma-international.org/ecma-262/#sec-abstract-module-records
// http://www.ecma-international.org/ecma-262/#sec-cyclic-module-records
// http://www.ecma-international.org/ecma-262/#sec-source-text-module-records
class $ESModule {
    constructor(logger, $file, node, realm, pkg, moduleResolver, compilerOptions) {
        this.logger = logger;
        this.$file = $file;
        this.node = node;
        this.realm = realm;
        this.pkg = pkg;
        this.moduleResolver = moduleResolver;
        this.compilerOptions = compilerOptions;
        this.disposed = false;
        this.mos = this;
        this.parent = this;
        this.ctx = 0 /* None */;
        this.depth = 0;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const intrinsics = realm['[[Intrinsics]]'];
        this.ExecutionResult = intrinsics.empty;
        this['[[Environment]]'] = intrinsics.undefined;
        this['[[Namespace]]'] = intrinsics.undefined;
        this.path = `ESModule<(...)${$file.rootlessPath}>`;
        this.logger = logger.root;
        let ctx = 0 /* None */;
        this.DirectivePrologue = _shared_js_1.GetDirectivePrologue(node.statements);
        if (this.DirectivePrologue.ContainsUseStrict) {
            ctx |= 65536 /* InStrictMode */;
        }
        const ExportedBindings = this.ExportedBindings = [];
        const ExportedNames = this.ExportedNames = [];
        const ExportEntries = this.ExportEntries = [];
        const ImportEntries = this.ImportEntries = [];
        const ImportedLocalNames = this.ImportedLocalNames = [];
        const ModuleRequests = this.ModuleRequests = [];
        const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [];
        const VarScopedDeclarations = this.VarScopedDeclarations = [];
        const $statements = this.$statements = [];
        const statements = node.statements;
        let stmt;
        let $stmt;
        let s = 0;
        for (let i = 0, ii = statements.length; i < ii; ++i) {
            stmt = statements[i];
            switch (stmt.kind) {
                case typescript_1.SyntaxKind.ModuleDeclaration:
                    $stmt = $statements[s] = new $ModuleDeclaration(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.NamespaceExportDeclaration:
                    $stmt = $statements[s] = new $NamespaceExportDeclaration(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ImportEqualsDeclaration:
                    $stmt = $statements[s] = new $ImportEqualsDeclaration(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ImportDeclaration:
                    $stmt = $statements[s] = new $ImportDeclaration(stmt, this, ctx, s);
                    ++s;
                    ImportEntries.push(...$stmt.ImportEntries);
                    ImportedLocalNames.push(...$stmt.ImportEntries.map(_shared_js_1.getLocalName));
                    ModuleRequests.push(...$stmt.ModuleRequests);
                    break;
                case typescript_1.SyntaxKind.ExportAssignment:
                    $stmt = $statements[s] = new $ExportAssignment(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ExportDeclaration:
                    $stmt = $statements[s] = new $ExportDeclaration(stmt, this, ctx, s);
                    ++s;
                    ExportedBindings.push(...$stmt.ExportedBindings);
                    ExportedNames.push(...$stmt.ExportedNames);
                    ExportEntries.push(...$stmt.ExportEntries);
                    ModuleRequests.push(...$stmt.ModuleRequests);
                    LexicallyScopedDeclarations.push(...$stmt.LexicallyScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.VariableStatement:
                    $stmt = $statements[s] = new statements_js_1.$VariableStatement(stmt, this, ctx, s);
                    ++s;
                    if ($stmt.isLexical) {
                        LexicallyScopedDeclarations.push($stmt);
                    }
                    else {
                        VarScopedDeclarations.push($stmt);
                    }
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    break;
                case typescript_1.SyntaxKind.FunctionDeclaration:
                    // Skip overload signature
                    if (stmt.body === void 0) {
                        continue;
                    }
                    $stmt = $statements[s] = new functions_js_1.$FunctionDeclaration(stmt, this, ctx, s);
                    ++s;
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    LexicallyScopedDeclarations.push($stmt);
                    break;
                case typescript_1.SyntaxKind.ClassDeclaration:
                    $stmt = $statements[s] = new classes_js_1.$ClassDeclaration(stmt, this, ctx, s);
                    ++s;
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    LexicallyScopedDeclarations.push($stmt);
                    break;
                case typescript_1.SyntaxKind.InterfaceDeclaration:
                    $stmt = $statements[s] = new types_js_1.$InterfaceDeclaration(stmt, this, ctx, s);
                    ++s;
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    break;
                case typescript_1.SyntaxKind.TypeAliasDeclaration:
                    $stmt = $statements[s] = new types_js_1.$TypeAliasDeclaration(stmt, this, ctx, s);
                    ++s;
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    break;
                case typescript_1.SyntaxKind.EnumDeclaration:
                    $stmt = $statements[s] = new types_js_1.$EnumDeclaration(stmt, this, ctx, s);
                    ++s;
                    if (_shared_js_1.hasBit($stmt.modifierFlags, typescript_1.ModifierFlags.Export)) {
                        ExportedBindings.push(...$stmt.ExportedBindings);
                        ExportedNames.push(...$stmt.ExportedNames);
                        ExportEntries.push(...$stmt.ExportEntries);
                    }
                    break;
                case typescript_1.SyntaxKind.Block:
                    $stmt = $statements[s] = new statements_js_1.$Block(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.EmptyStatement:
                    $stmt = $statements[s] = new statements_js_1.$EmptyStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ExpressionStatement:
                    $stmt = $statements[s] = new statements_js_1.$ExpressionStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.IfStatement:
                    $stmt = $statements[s] = new statements_js_1.$IfStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.DoStatement:
                    $stmt = $statements[s] = new statements_js_1.$DoStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.WhileStatement:
                    $stmt = $statements[s] = new statements_js_1.$WhileStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForInStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForInStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ForOfStatement:
                    $stmt = $statements[s] = new statements_js_1.$ForOfStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ContinueStatement:
                    $stmt = $statements[s] = new statements_js_1.$ContinueStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.BreakStatement:
                    $stmt = $statements[s] = new statements_js_1.$BreakStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.ReturnStatement:
                    $stmt = $statements[s] = new statements_js_1.$ReturnStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.WithStatement:
                    $stmt = $statements[s] = new statements_js_1.$WithStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.SwitchStatement:
                    $stmt = $statements[s] = new statements_js_1.$SwitchStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.LabeledStatement:
                    $stmt = $statements[s] = new statements_js_1.$LabeledStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.ThrowStatement:
                    $stmt = $statements[s] = new statements_js_1.$ThrowStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                case typescript_1.SyntaxKind.TryStatement:
                    $stmt = $statements[s] = new statements_js_1.$TryStatement(stmt, this, ctx, s);
                    ++s;
                    VarScopedDeclarations.push(...$stmt.VarScopedDeclarations);
                    break;
                case typescript_1.SyntaxKind.DebuggerStatement:
                    $stmt = $statements[s] = new statements_js_1.$DebuggerStatement(stmt, this, ctx, s);
                    ++s;
                    break;
                default:
                    throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
            }
        }
        // http://www.ecma-international.org/ecma-262/#sec-parsemodule
        // 15.2.1.17.1 ParseModule ( sourceText , realm , hostDefined )
        // 1. Assert: sourceText is an ECMAScript source text (see clause 10).
        // 2. Parse sourceText using Module as the goal symbol and analyse the parse result for any Early Error conditions. If the parse was successful and no early errors were found, let body be the resulting parse tree. Otherwise, let body be a List of one or more SyntaxError or ReferenceError objects representing the parsing errors and/or early errors. Parsing and early error detection may be interweaved in an implementation-dependent manner. If more than one parsing error or early error is present, the number and ordering of error objects in the list is implementation-dependent, but at least one must be present.
        // 3. If body is a List of errors, return body.
        // 4. Let requestedModules be the ModuleRequests of body.
        const requestedModules = ModuleRequests;
        // 5. Let importEntries be ImportEntries of body.
        const importEntries = ImportEntries;
        // 6. Let importedBoundNames be ImportedLocalNames(importEntries).
        const importedBoundNames = ImportedLocalNames;
        // 7. Let indirectExportEntries be a new empty List.
        const indirectExportEntries = [];
        // 8. Let localExportEntries be a new empty List.
        const localExportEntries = [];
        // 9. Let starExportEntries be a new empty List.
        const starExportEntries = [];
        // 10. Let exportEntries be ExportEntries of body.
        const exportEntries = ExportEntries;
        let ee;
        // 11. For each ExportEntry Record ee in exportEntries, do
        for (let i = 0, ii = exportEntries.length; i < ii; ++i) {
            ee = exportEntries[i];
            // 11. a. If ee.[[ModuleRequest]] is null, then
            if (ee.ModuleRequest.isNull) {
                // 11. a. i. If ee.[[LocalName]] is not an element of importedBoundNames, then
                if (!importedBoundNames.some(x => x.is(ee.LocalName))) {
                    // 11. a. i. 1. Append ee to localExportEntries.
                    localExportEntries.push(ee);
                }
                // 11. a. ii. Else,
                else {
                    // 11. a. ii. 1. Let ie be the element of importEntries whose [[LocalName]] is the same as ee.[[LocalName]].
                    const ie = importEntries.find(x => x.LocalName.is(ee.LocalName));
                    // 11. a. ii. 2. If ie.[[ImportName]] is "*", then
                    if (ie.ImportName['[[Value]]'] === '*') {
                        // 11. a. ii. 2. a. Assert: This is a re-export of an imported module namespace object.
                        // 11. a. ii. 2. b. Append ee to localExportEntries.
                        localExportEntries.push(ee);
                    }
                    // 11. a. ii. 3. Else this is a re-export of a single name,
                    else {
                        // 11. a. ii. 3. a. Append the ExportEntry Record { [[ModuleRequest]]: ie.[[ModuleRequest]], [[ImportName]]: ie.[[ImportName]], [[LocalName]]: null, [[ExportName]]: ee.[[ExportName]] } to indirectExportEntries.
                        indirectExportEntries.push(new ExportEntryRecord(
                        /* source */ this, 
                        /* ExportName */ ee.ExportName, 
                        /* ModuleRequest */ ie.ModuleRequest, 
                        /* ImportName */ ie.ImportName, 
                        /* LocalName */ intrinsics.null));
                    }
                }
            }
            // 11. b. Else if ee.[[ImportName]] is "*", then
            else if (ee.ImportName['[[Value]]'] === '*') {
                // 11. b. i. Append ee to starExportEntries.
                starExportEntries.push(ee);
            }
            // 11. c. Else,
            else {
                // 11. c. i. Append ee to indirectExportEntries.
                indirectExportEntries.push(ee);
            }
        }
        // 12. Return Source Text Module Record { [[Realm]]: Realm, [[Environment]]: undefined, [[Namespace]]: undefined, [[Status]]: "uninstantiated", [[EvaluationError]]: undefined, [[HostDefined]]: hostDefined, [[ECMAScriptCode]]: body, [[RequestedModules]]: requestedModules, [[ImportEntries]]: importEntries, [[LocalExportEntries]]: localExportEntries, [[IndirectExportEntries]]: indirectExportEntries, [[StarExportEntries]]: starExportEntries, [[DFSIndex]]: undefined, [[DFSAncestorIndex]]: undefined }.
        this.Status = 'uninstantiated';
        this.DFSIndex = void 0;
        this.DFSAncestorIndex = void 0;
        this.RequestedModules = requestedModules;
        this.IndirectExportEntries = indirectExportEntries;
        this.LocalExportEntries = localExportEntries;
        this.StarExportEntries = starExportEntries;
        this.logger.trace(`RequestedModules: `, requestedModules);
        this.logger.trace(`ImportEntries: `, importEntries);
        this.logger.trace(`IndirectExportEntries: `, indirectExportEntries);
        this.logger.trace(`LocalExportEntries: `, localExportEntries);
        this.logger.trace(`StarExportEntries: `, starExportEntries);
    }
    get isAbrupt() { return false; }
    get $kind() { return typescript_1.SyntaxKind.SourceFile; }
    get isNull() { return false; }
    get isScript() { return false; }
    get isModule() { return true; }
    // http://www.ecma-international.org/ecma-262/#sec-moduledeclarationinstantiation
    // 15.2.1.16.1 Instantiate ( ) Concrete Method
    Instantiate(ctx) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const start = Date.now();
        this.logger.debug(`${this.path}.[Instantiate] starting`);
        // TODO: this is temporary. Should be done by RunJobs
        if (realm.stack.top.ScriptOrModule.isNull) {
            realm.stack.top.ScriptOrModule = this;
        }
        // 1. Let module be this Cyclic Module Record.
        // 2. Assert: module.[[Status]] is not "instantiating" or "evaluating".
        // 3. Let stack be a new empty List.
        const stack = [];
        // 4. Let result be InnerModuleInstantiation(module, stack, 0).
        const result = this._InnerModuleInstantiation(ctx, stack, new number_js_1.$Number(realm, 0));
        // 5. If result is an abrupt completion, then
        if (result.isAbrupt) {
            // 5. a. For each module m in stack, do
            for (const m of stack) {
                // 5. a. i. Assert: m.[[Status]] is "instantiating".
                // 5. a. ii. Set m.[[Status]] to "uninstantiated".
                m.Status = 'uninstantiated';
                // 5. a. iii. Set m.[[Environment]] to undefined.
                m['[[Environment]]'] = intrinsics.undefined;
                // 5. a. iv. Set m.[[DFSIndex]] to undefined.
                m.DFSIndex = void 0;
                // 5. a. v. Set m.[[DFSAncestorIndex]] to undefined.
                m.DFSAncestorIndex = void 0;
            }
            // 5. b. Assert: module.[[Status]] is "uninstantiated".
            // 5. c. Return result.
            return result;
        }
        // 6. Assert: module.[[Status]] is "instantiated" or "evaluated".
        // 7. Assert: stack is empty.
        // 8. Return undefined.
        const end = Date.now();
        this.logger.debug(`${this.path}.[Instantiate] done in ${Math.round(end - start)}ms`);
        return new undefined_js_1.$Undefined(realm);
    }
    // http://www.ecma-international.org/ecma-262/#sec-innermoduleinstantiation
    // 15.2.1.16.1.1 InnerModuleInstantiation ( module , stack , idx )
    /** @internal */
    _InnerModuleInstantiation(ctx, stack, idx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}._InnerModuleInstantiation(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If module is not a Cyclic Module Record, then
        // 1. a. Perform ? module.Evaluate(ctx).
        // 1. b. Return idx.
        // We only deal with cyclic module records for now
        // 2. If module.[[Status]] is "instantiating", "instantiated", or "evaluated", then
        if (this.Status === 'instantiating' || this.Status === 'instantiated' || this.Status === 'evaluated') {
            // 2. Return idx.
            return idx;
        }
        // 3. Assert: module.[[Status]] is "uninstantiated".
        // 4. Set module.[[Status]] to "instantiating".
        this.Status = 'instantiating';
        // 5. Set module.[[DFSIndex]] to idx.
        this.DFSIndex = idx['[[Value]]'];
        // 6. Set module.[[DFSAncestorIndex]] to idx.
        this.DFSAncestorIndex = idx['[[Value]]'];
        // 7. Increase idx by 1.
        idx = new number_js_1.$Number(realm, idx['[[Value]]'] + 1);
        // 8. Append module to stack.
        stack.push(this);
        // 9. For each String required that is an element of module.[[RequestedModules]], do
        for (const required of this.RequestedModules) {
            // 9. a. Let requiredModule be ? HostResolveImportedModule(module, required).
            const requiredModule = this.moduleResolver.ResolveImportedModule(ctx, this, required);
            if (requiredModule.isAbrupt) {
                return requiredModule.enrichWith(ctx, this);
            }
            // 9. b. Set idx to ? InnerModuleInstantiation(requiredModule, stack, idx).
            const $idx = requiredModule._InnerModuleInstantiation(ctx, stack, idx);
            if ($idx.isAbrupt) {
                return $idx.enrichWith(ctx, this);
            }
            idx = $idx;
            // 9. c. Assert: requiredModule.[[Status]] is either "instantiating", "instantiated", or "evaluated".
            // 9. d. Assert: requiredModule.[[Status]] is "instantiating" if and only if requiredModule is in stack.
            // 9. e. If requiredModule.[[Status]] is "instantiating", then
            if (requiredModule instanceof $ESModule && requiredModule.Status === 'instantiating') {
                // 9. e. i. Assert: requiredModule is a Cyclic Module Record.
                this.logger.warn(`[_InnerModuleInstantiation] ${requiredModule.$file.name} is a cyclic module record`);
                // 9. e. ii. Set module.[[DFSAncestorIndex]] to min(module.[[DFSAncestorIndex]], requiredModule.[[DFSAncestorIndex]]).
                this.DFSAncestorIndex = Math.min(this.DFSAncestorIndex, requiredModule.DFSAncestorIndex);
            }
        }
        // 10. Perform ? module.InitializeEnvironment().
        const $InitializeEnvironmentResult = this.InitializeEnvironment(ctx);
        if ($InitializeEnvironmentResult.isAbrupt) {
            return $InitializeEnvironmentResult.enrichWith(ctx, this);
        }
        // 11. Assert: module occurs exactly once in stack.
        // 12. Assert: module.[[DFSAncestorIndex]] is less than or equal to module.[[DFSIndex]].
        // 13. If module.[[DFSAncestorIndex]] equals module.[[DFSIndex]], then
        if (this.DFSAncestorIndex === this.DFSIndex) {
            // 13. a. Let done be false.
            let done = false;
            // 13. b. Repeat, while done is false,
            while (!done) {
                // 13. b. i. Let requiredModule be the last element in stack.
                // 13. b. ii. Remove the last element of stack.
                const requiredModule = stack.pop();
                // 13. b. iii. Set requiredModule.[[Status]] to "instantiated".
                requiredModule.Status = 'instantiated';
                // 13. b. iv. If requiredModule and module are the same Module Record, set done to true.
                if (requiredModule === this) {
                    done = true;
                }
            }
        }
        // 14. Return idx.
        return idx;
    }
    // http://www.ecma-international.org/ecma-262/#sec-source-text-module-record-initialize-environment
    // 15.2.1.17.4 InitializeEnvironment ( ) Concrete Method
    InitializeEnvironment(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeEnvironment(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let module be this Source Text Module Record.
        // 2. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
        for (const e of this.IndirectExportEntries) {
            // 2. a. Let resolution be ? module.ResolveExport(e.[[ExportName]], « »).
            const resolution = this.ResolveExport(ctx, e.ExportName, new realm_js_1.ResolveSet());
            if (resolution.isAbrupt) {
                return resolution.enrichWith(ctx, this);
            }
            // 2. b. If resolution is null or "ambiguous", throw a SyntaxError exception.
            if (resolution.isNull || resolution.isAmbiguous) {
                return new error_js_1.$SyntaxError(realm, `ResolveExport(${e.ExportName}) returned ${resolution}`);
            }
            // 2. c. Assert: resolution is a ResolvedBinding Record.
        }
        // 3. Assert: All named exports from module are resolvable.
        // 4. Let realm be module.[[Realm]].
        // 5. Assert: Realm is not undefined.
        // 6. Let env be NewModuleEnvironment(realm.[[GlobalEnv]]).
        const envRec = new environment_record_js_1.$ModuleEnvRec(this.logger, realm, realm['[[GlobalEnv]]']);
        // 7. Set module.[[Environment]] to env.
        this['[[Environment]]'] = envRec;
        // 8. Let envRec be env's EnvironmentRecord.
        // 9. For each ImportEntry Record in in module.[[ImportEntries]], do
        for (const ie of this.ImportEntries) {
            // 9. a. Let importedModule be ! HostResolveImportedModule(module, in.[[ModuleRequest]]).
            const importedModule = this.moduleResolver.ResolveImportedModule(ctx, this, ie.ModuleRequest);
            // 9. b. NOTE: The above call cannot fail because imported module requests are a subset of module.[[RequestedModules]], and these have been resolved earlier in this algorithm.
            // 9. c. If in.[[ImportName]] is "*", then
            if (ie.ImportName['[[Value]]'] === '*') {
                // 9. c. i. Let namespace be ? GetModuleNamespace(importedModule).
                const namespace = (function (mod) {
                    // http://www.ecma-international.org/ecma-262/#sec-getmodulenamespace
                    // 15.2.1.19 Runtime Semantics: GetModuleNamespace ( module )
                    // 1. Assert: module is an instance of a concrete subclass of Module Record.
                    // 2. Assert: module.[[Status]] is not "uninstantiated".
                    // 3. Let namespace be module.[[Namespace]].
                    let namespace = mod['[[Namespace]]'];
                    // 4. If namespace is undefined, then
                    if (namespace.isUndefined) {
                        // 4. a. Let exportedNames be ? module.GetExportedNames(« »).
                        const exportedNames = mod.GetExportedNames(ctx, new Set());
                        if (exportedNames.isAbrupt) {
                            return exportedNames.enrichWith(ctx, mod);
                        }
                        // 4. b. Let unambiguousNames be a new empty List.
                        const unambiguousNames = new list_js_1.$List();
                        // 4. c. For each name that is an element of exportedNames, do
                        for (const name of exportedNames) {
                            // 4. c. i. Let resolution be ? module.ResolveExport(name, « »).
                            const resolution = mod.ResolveExport(ctx, name, new realm_js_1.ResolveSet());
                            if (resolution.isAbrupt) {
                                return resolution.enrichWith(ctx, mod);
                            }
                            // 4. c. ii. If resolution is a ResolvedBinding Record, append name to unambiguousNames.
                            if (resolution instanceof realm_js_1.ResolvedBindingRecord) {
                                unambiguousNames.push(name);
                            }
                        }
                        // 4. d. Set namespace to ModuleNamespaceCreate(module, unambiguousNames).
                        namespace = new namespace_js_1.$NamespaceExoticObject(realm, mod, unambiguousNames);
                    }
                    // 5. Return namespace.
                    return namespace;
                })(importedModule);
                // 9. c. ii. Perform ! envRec.CreateImmutableBinding(in.[[LocalName]], true).
                envRec.CreateImmutableBinding(ctx, ie.LocalName, intrinsics.true);
                // 9. c. iii. Call envRec.InitializeBinding(in.[[LocalName]], namespace).
                if (namespace.isAbrupt) {
                    return namespace.enrichWith(ctx, this);
                } // TODO: sure about this? Spec doesn't say it
                envRec.InitializeBinding(ctx, ie.LocalName, namespace);
            }
            // 9. d. Else,
            else {
                // 9. d. i. Let resolution be ? importedModule.ResolveExport(in.[[ImportName]], « »).
                const resolution = importedModule.ResolveExport(ctx, ie.ImportName, new realm_js_1.ResolveSet());
                if (resolution.isAbrupt) {
                    return resolution.enrichWith(ctx, this);
                }
                // 9. d. ii. If resolution is null or "ambiguous", throw a SyntaxError exception.
                if (resolution.isNull || resolution.isAmbiguous) {
                    return new error_js_1.$SyntaxError(realm, `ResolveExport(${ie.ImportName}) returned ${resolution}`);
                }
                // 9. d. iii. Call envRec.CreateImportBinding(in.[[LocalName]], resolution.[[Module]], resolution.[[BindingName]]).
                envRec.CreateImportBinding(ctx, ie.LocalName, resolution.Module, resolution.BindingName);
            }
        }
        // 10. Let code be module.[[ECMAScriptCode]].
        // 11. Let varDeclarations be the VarScopedDeclarations of code.
        const varDeclarations = this.VarScopedDeclarations;
        // 12. Let declaredVarNames be a new empty List.
        const declaredVarNames = new list_js_1.$List();
        // 13. For each element d in varDeclarations, do
        for (const d of varDeclarations) {
            // 13. a. For each element dn of the BoundNames of d, do
            for (const dn of d.BoundNames) {
                // 13. a. i. If dn is not an element of declaredVarNames, then
                if (!declaredVarNames.$contains(dn)) {
                    // 13. a. i. 1. Perform ! envRec.CreateMutableBinding(dn, false).
                    envRec.CreateMutableBinding(ctx, dn, intrinsics.false);
                    // 13. a. i. 2. Call envRec.InitializeBinding(dn, undefined).
                    envRec.InitializeBinding(ctx, dn, intrinsics.undefined);
                    // 13. a. i. 3. Append dn to declaredVarNames.
                    declaredVarNames.push(dn);
                }
            }
        }
        // 14. Let lexDeclarations be the LexicallyScopedDeclarations of code.
        const lexDeclarations = this.LexicallyScopedDeclarations;
        // 15. For each element d in lexDeclarations, do
        for (const d of lexDeclarations) {
            // 15. a. For each element dn of the BoundNames of d, do
            for (const dn of d.BoundNames) {
                // 15. a. i. If IsConstantDeclaration of d is true, then
                if (d.IsConstantDeclaration) {
                    // 15. a. i. 1. Perform ! envRec.CreateImmutableBinding(dn, true).
                    envRec.CreateImmutableBinding(ctx, dn, intrinsics.true);
                }
                // 15. a. ii. Else,
                else {
                    // 15. a. ii. 1. Perform ! envRec.CreateMutableBinding(dn, false).
                    envRec.CreateMutableBinding(ctx, dn, intrinsics.false);
                    // 15. a. iii. If d is a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration, then
                    if (d.$kind === typescript_1.SyntaxKind.FunctionDeclaration) {
                        // 15. a. iii. 1. Let fo be the result of performing InstantiateFunctionObject for d with argument env.
                        const fo = d.InstantiateFunctionObject(ctx, envRec);
                        if (fo.isAbrupt) {
                            return fo.enrichWith(ctx, this);
                        }
                        // 15. a. iii. 2. Call envRec.InitializeBinding(dn, fo).
                        envRec.InitializeBinding(ctx, dn, fo);
                    }
                }
            }
        }
        // 16. Return NormalCompletion(empty).
        return new empty_js_1.$Empty(realm);
    }
    // http://www.ecma-international.org/ecma-262/#sec-getexportednames
    // 15.2.1.17.2 GetExportedNames ( exportStarSet ) Concrete Method
    GetExportedNames(ctx, exportStarSet) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let module be this Source Text Module Record.
        const mod = this;
        // 2. If exportStarSet contains module, then
        if (exportStarSet.has(mod)) {
            // 2. a. Assert: We've reached the starting point of an import * circularity.
            // 2. b. Return a new empty List.
            return new list_js_1.$List();
        }
        // 3. Append module to exportStarSet.
        exportStarSet.add(mod);
        // 4. Let exportedNames be a new empty List.
        const exportedNames = new list_js_1.$List();
        // 5. For each ExportEntry Record e in module.[[LocalExportEntries]], do
        for (const e of mod.LocalExportEntries) {
            // 5. a. Assert: module provides the direct binding for this export.
            // 5. b. Append e.[[ExportName]] to exportedNames.
            exportedNames.push(e.ExportName);
        }
        // 6. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
        for (const e of mod.IndirectExportEntries) {
            // 6. a. Assert: module imports a specific binding for this export.
            // 6. b. Append e.[[ExportName]] to exportedNames.
            exportedNames.push(e.ExportName);
        }
        // 7. For each ExportEntry Record e in module.[[StarExportEntries]], do
        for (const e of mod.StarExportEntries) {
            // 7. a. Let requestedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
            const requestedModule = this.moduleResolver.ResolveImportedModule(ctx, mod, e.ModuleRequest);
            if (requestedModule.isAbrupt) {
                return requestedModule.enrichWith(ctx, this);
            }
            // 7. b. Let starNames be ? requestedModule.GetExportedNames(exportStarSet).
            const starNames = requestedModule.GetExportedNames(ctx, exportStarSet);
            if (starNames.isAbrupt) {
                return starNames.enrichWith(ctx, this);
            }
            // 7. c. For each element n of starNames, do
            for (const n of starNames) {
                // 7. c. i. If SameValue(n, "default") is false, then
                if (n['[[Value]]'] !== 'default') {
                    // 7. c. i. 1. If n is not an element of exportedNames, then
                    if (!exportedNames.$contains(n)) {
                        // 7. c. i. 1. a. Append n to exportedNames.
                        exportedNames.push(n);
                    }
                }
            }
        }
        // 8. Return exportedNames.
        return exportedNames;
    }
    // http://www.ecma-international.org/ecma-262/#sec-resolveexport
    // 15.2.1.17.3 ResolveExport ( exportName , resolveSet ) Concrete Method
    ResolveExport(ctx, exportName, resolveSet) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let module be this Source Text Module Record.
        // 2. For each Record { [[Module]], [[ExportName]] } r in resolveSet, do
        // 2. a. If module and r.[[Module]] are the same Module Record and SameValue(exportName, r.[[ExportName]]) is true, then
        if (resolveSet.has(this, exportName)) {
            // 2. a. i. Assert: This is a circular import request.
            // 2. a. ii. Return null.
            this.logger.warn(`[ResolveExport] Circular import: ${exportName}`);
            return new null_js_1.$Null(realm);
        }
        // 3. Append the Record { [[Module]]: module, [[ExportName]]: exportName } to resolveSet.
        resolveSet.add(this, exportName);
        // 4. For each ExportEntry Record e in module.[[LocalExportEntries]], do
        for (const e of this.LocalExportEntries) {
            // 4. a. If SameValue(exportName, e.[[ExportName]]) is true, then
            if (exportName.is(e.ExportName)) {
                // 4. a. i. Assert: module provides the direct binding for this export.
                this.logger.debug(`${this.path}.[ResolveExport] found direct binding for ${exportName['[[Value]]']}`);
                // 4. a. ii. Return ResolvedBinding Record { [[Module]]: module, [[BindingName]]: e.[[LocalName]] }.
                return new realm_js_1.ResolvedBindingRecord(this, e.LocalName);
            }
        }
        // 5. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
        for (const e of this.IndirectExportEntries) {
            // 5. a. If SameValue(exportName, e.[[ExportName]]) is true, then
            if (exportName.is(e.ExportName)) {
                // 5. a. i. Assert: module imports a specific binding for this export.
                this.logger.debug(`${this.path}.[ResolveExport] found specific imported binding for ${exportName['[[Value]]']}`);
                // 5. a. ii. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
                const importedModule = this.moduleResolver.ResolveImportedModule(ctx, this, e.ModuleRequest);
                if (importedModule.isAbrupt) {
                    return importedModule.enrichWith(ctx, this);
                }
                // 5. a. iii. Return importedModule.ResolveExport(e.[[ImportName]], resolveSet).
                return importedModule.ResolveExport(ctx, e.ImportName, resolveSet);
            }
        }
        // 6. If SameValue(exportName, "default") is true, then
        if (exportName['[[Value]]'] === 'default') {
            // 6. a. Assert: A default export was not explicitly defined by this module.
            // 6. b. Return null.
            this.logger.warn(`[ResolveExport] No default export defined`);
            return new null_js_1.$Null(realm);
            // 6. c. NOTE: A default export cannot be provided by an export *.
        }
        // 7. Let starResolution be null.
        let starResolution = new null_js_1.$Null(realm);
        // 8. For each ExportEntry Record e in module.[[StarExportEntries]], do
        for (const e of this.StarExportEntries) {
            // 8. a. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
            const importedModule = this.moduleResolver.ResolveImportedModule(ctx, this, e.ModuleRequest);
            if (importedModule.isAbrupt) {
                return importedModule.enrichWith(ctx, this);
            }
            // 8. b. Let resolution be ? importedModule.ResolveExport(exportName, resolveSet).
            const resolution = importedModule.ResolveExport(ctx, exportName, resolveSet);
            if (resolution.isAbrupt) {
                return resolution.enrichWith(ctx, this);
            }
            // 8. c. If resolution is "ambiguous", return "ambiguous".
            if (resolution.isAmbiguous) {
                this.logger.warn(`[ResolveExport] ambiguous resolution for ${exportName['[[Value]]']}`);
                return resolution;
            }
            // 8. d. If resolution is not null, then
            if (!resolution.isNull) {
                // 8. d. i. Assert: resolution is a ResolvedBinding Record.
                // 8. d. ii. If starResolution is null, set starResolution to resolution.
                if (starResolution.isNull) {
                    starResolution = resolution;
                }
                // 8. d. iii. Else,
                else {
                    // 8. d. iii. 1. Assert: There is more than one * import that includes the requested name.
                    // 8. d. iii. 2. If resolution.[[Module]] and starResolution.[[Module]] are not the same Module Record or SameValue(resolution.[[BindingName]], starResolution.[[BindingName]]) is false, return "ambiguous".
                    if (!(resolution.Module === starResolution.Module && resolution.BindingName.is(starResolution.BindingName))) {
                        this.logger.warn(`[ResolveExport] ambiguous resolution for ${exportName['[[Value]]']}`);
                        return new string_js_1.$String(realm, 'ambiguous');
                    }
                }
            }
        }
        if (starResolution.isNull) {
            this.logger.warn(`[ResolveExport] starResolution is null for ${exportName['[[Value]]']}`);
        }
        // 9. Return starResolution.
        return starResolution;
    }
    // http://www.ecma-international.org/ecma-262/#sec-moduleevaluation
    // 15.2.1.16.2 Evaluate ( ) Concrete Method
    EvaluateModule(ctx) {
        this.logger.debug(`${this.path}.EvaluateModule()`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let module be this Cyclic Module Record.
        // 2. Assert: module.[[Status]] is "instantiated" or "evaluated".
        // 3. Let stack be a new empty List.
        const stack = [];
        // 4. Let result be InnerModuleEvaluation(module, stack, 0).
        const result = this.EvaluateModuleInner(ctx, stack, 0);
        // 5. If result is an abrupt completion, then
        if (result.isAbrupt) {
            // 5. a. For each module m in stack, do
            for (const m of stack) {
                // 5. a. i. Assert: m.[[Status]] is "evaluating".
                // 5. a. ii. Set m.[[Status]] to "evaluated".
                m.Status = 'evaluated';
                // 5. a. iii. Set m.[[EvaluationError]] to result.
                // TODO
            }
            // 5. b. Assert: module.[[Status]] is "evaluated" and module.[[EvaluationError]] is result.
            // 5. c. Return result.
            return result;
        }
        // 6. Assert: module.[[Status]] is "evaluated" and module.[[EvaluationError]] is undefined.
        // 7. Assert: stack is empty.
        // 8. Return undefined.
        return new undefined_js_1.$Undefined(realm, 1 /* normal */, intrinsics.empty, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-innermoduleevaluation
    // 15.2.1.16.2.1 InnerModuleEvaluation ( module , stack , idx )
    EvaluateModuleInner(ctx, stack, idx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.EvaluateModuleInner(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If module is not a Cyclic Module Record, then
        // 1. a. Perform ? module.Evaluate(ctx).
        // 1. b. Return idx.
        // 2. If module.[[Status]] is "evaluated", then
        if (this.Status === 'evaluated') {
            // 2. a. If module.[[EvaluationError]] is undefined, return idx.
            return new number_js_1.$Number(realm, idx); // TODO
            // 2. b. Otherwise return module.[[EvaluationError]].
        }
        // 3. If module.[[Status]] is "evaluating", return idx.
        if (this.Status === 'evaluating') {
            return new number_js_1.$Number(realm, idx);
        }
        // 4. Assert: module.[[Status]] is "instantiated".
        // 5. Set module.[[Status]] to "evaluating".
        this.Status = 'evaluating';
        // 6. Set module.[[DFSIndex]] to idx.
        this.DFSIndex = idx;
        // 7. Set module.[[DFSAncestorIndex]] to idx.
        this.DFSAncestorIndex = idx;
        // 8. Increase idx by 1.
        ++idx;
        // 9. Append module to stack.
        stack.push(this);
        // 10. For each String required that is an element of module.[[RequestedModules]], do
        for (const required of this.RequestedModules) {
            // 10. a. Let requiredModule be ! HostResolveImportedModule(module, required).
            const requiredModule = this.moduleResolver.ResolveImportedModule(ctx, this, required); // TODO
            // 10. b. NOTE: Instantiate must be completed successfully prior to invoking this method, so every requested module is guaranteed to resolve successfully.
            // 10. c. Set idx to ? InnerModuleEvaluation(requiredModule, stack, idx).
            const $EvaluateModuleInnerResult = requiredModule.EvaluateModuleInner(ctx, stack, idx);
            if ($EvaluateModuleInnerResult.isAbrupt) {
                return $EvaluateModuleInnerResult.enrichWith(ctx, this);
            }
            idx = $EvaluateModuleInnerResult['[[Value]]'];
            // 10. d. Assert: requiredModule.[[Status]] is either "evaluating" or "evaluated".
            // 10. e. Assert: requiredModule.[[Status]] is "evaluating" if and only if requiredModule is in stack.
            // 10. f. If requiredModule.[[Status]] is "evaluating", then
            if (requiredModule.Status === 'evaluating') {
                // 10. f. i. Assert: requiredModule is a Cyclic Module Record.
                // 10. f. ii. Set module.[[DFSAncestorIndex]] to min(module.[[DFSAncestorIndex]], requiredModule.[[DFSAncestorIndex]]).
                this.DFSAncestorIndex = Math.min(this.DFSAncestorIndex, requiredModule.DFSAncestorIndex);
            }
        }
        // 11. Perform ? module.ExecuteModule().
        const $ExecuteModuleResult = this.ExecutionResult = this.ExecuteModule(ctx);
        if ($ExecuteModuleResult.isAbrupt) {
            return $ExecuteModuleResult.enrichWith(ctx, this);
        }
        // 12. Assert: module occurs exactly once in stack.
        // 13. Assert: module.[[DFSAncestorIndex]] is less than or equal to module.[[DFSIndex]].
        // 14. If module.[[DFSAncestorIndex]] equals module.[[DFSIndex]], then
        if (this.DFSAncestorIndex === this.DFSIndex) {
            // 14. a. Let done be false.
            let done = false;
            // 14. b. Repeat, while done is false,
            while (!done) {
                // 14. b. i. Let requiredModule be the last element in stack.
                // 14. b. ii. Remove the last element of stack.
                const requiredModule = stack.pop();
                // 14. b. iii. Set requiredModule.[[Status]] to "evaluated".
                requiredModule.Status = 'evaluated';
                // 14. b. iv. If requiredModule and module are the same Module Record, set done to true.
                if (requiredModule === this) {
                    done = true;
                }
            }
        }
        // 15. Return idx.
        return new number_js_1.$Number(realm, idx);
    }
    // http://www.ecma-international.org/ecma-262/#sec-source-text-module-record-execute-module
    // 15.2.1.17.5 ExecuteModule ( ) Concrete Method
    ExecuteModule(ctx) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.ExecuteModule(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let module be this Source Text Module Record.
        // 2. Let moduleCxt be a new ECMAScript code execution context.
        const moduleCxt = new realm_js_1.ExecutionContext(this.realm);
        // 3. Set the Function of moduleCxt to null.
        moduleCxt.Function = intrinsics.null;
        // 4. Assert: module.[[Realm]] is not undefined.
        // 5. Set the Realm of moduleCxt to module.[[Realm]].
        // 6. Set the ScriptOrModule of moduleCxt to module.
        moduleCxt.ScriptOrModule = this;
        // 7. Assert: module has been linked and declarations in its module environment have been instantiated.
        // 8. Set the VariableEnvironment of moduleCxt to module.[[Environment]].
        moduleCxt.VariableEnvironment = this['[[Environment]]'];
        // 9. Set the LexicalEnvironment of moduleCxt to module.[[Environment]].
        moduleCxt.LexicalEnvironment = this['[[Environment]]'];
        // 10. Suspend the currently running execution context.
        const stack = realm.stack;
        ctx.suspend();
        // 11. Push moduleCxt on to the execution context stack; moduleCxt is now the running execution context.
        stack.push(moduleCxt);
        // 12. Let result be the result of evaluating module.[[ECMAScriptCode]].
        const result = this.Evaluate(moduleCxt);
        // 13. Suspend moduleCxt and remove it from the execution context stack.
        moduleCxt.suspend();
        stack.pop();
        // 14. Resume the context that is now on the top of the execution context stack as the running execution context.
        ctx.resume();
        // 15. Return Completion(result).
        return result;
    }
    // http://www.ecma-international.org/ecma-262/#sec-module-semantics-runtime-semantics-evaluation
    // 15.2.1.21 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        const $statements = this.$statements;
        // Module : [empty]
        // 1. Return NormalCompletion(undefined).
        // ModuleBody : ModuleItemList
        // 1. Let result be the result of evaluating ModuleItemList.
        // 2. If result.[[Type]] is normal and result.[[Value]] is empty, then
        // 2. a. Return NormalCompletion(undefined).
        // 3. Return Completion(result).
        // ModuleItemList : ModuleItemList ModuleItem
        // 1. Let sl be the result of evaluating ModuleItemList.
        // 2. ReturnIfAbrufpt(sl).
        // 3. Let s be the result of evaluating ModuleItem.
        // 4. Return Completion(UpdateEmpty(s, sl)).
        // ModuleItem : ImportDeclaration
        // 1. Return NormalCompletion(empty).
        let $statement;
        let sl = (void 0);
        for (let i = 0, ii = $statements.length; i < ii; ++i) {
            $statement = $statements[i];
            switch ($statement.$kind) {
                case typescript_1.SyntaxKind.ModuleDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.NamespaceExportDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ImportEqualsDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ImportDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ExportAssignment:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ExportDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.VariableStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.FunctionDeclaration:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ClassDeclaration:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.InterfaceDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.TypeAliasDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.EnumDeclaration:
                    // sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.Block:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.EmptyStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ExpressionStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.IfStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.DoStatement:
                    sl = $statement.EvaluateLabelled(ctx, new string_js_2.$StringSet());
                    break;
                case typescript_1.SyntaxKind.WhileStatement:
                    sl = $statement.EvaluateLabelled(ctx, new string_js_2.$StringSet());
                    break;
                case typescript_1.SyntaxKind.ForStatement:
                    sl = $statement.EvaluateLabelled(ctx);
                    break;
                case typescript_1.SyntaxKind.ForInStatement:
                    sl = $statement.EvaluateLabelled(ctx);
                    break;
                case typescript_1.SyntaxKind.ForOfStatement:
                    sl = $statement.EvaluateLabelled(ctx);
                    break;
                case typescript_1.SyntaxKind.ContinueStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.BreakStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.ReturnStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.WithStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.SwitchStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.LabeledStatement:
                    sl = $statement.EvaluateLabelled(ctx);
                    break;
                case typescript_1.SyntaxKind.ThrowStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.TryStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                case typescript_1.SyntaxKind.DebuggerStatement:
                    sl = $statement.Evaluate(ctx);
                    break;
                default:
                    throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[$statement.$kind]}.`);
            }
            if (sl.isAbrupt) {
                return sl.enrichWith(ctx, this);
            }
        }
        return sl;
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        this['[[Environment]]'] = void 0;
        this['[[Namespace]]'] = void 0;
        this.mos = void 0;
        this.parent = void 0;
        this.$statements = void 0;
        this.DirectivePrologue = void 0;
        this.ExecutionResult = void 0;
        this.ExportedBindings = void 0;
        this.ExportedNames = void 0;
        this.ExportEntries = void 0;
        this.ImportEntries = void 0;
        this.ImportedLocalNames = void 0;
        this.ModuleRequests = void 0;
        this.LexicallyScopedDeclarations = void 0;
        this.VarScopedDeclarations = void 0;
        this.TypeDeclarations = void 0;
        this.RequestedModules = void 0;
        this.LocalExportEntries = void 0;
        this.IndirectExportEntries = void 0;
        this.StarExportEntries = void 0;
        this.logger = void 0;
        this.$file = void 0;
        this.node = void 0;
        this.realm = void 0;
        this.pkg = void 0;
        this.moduleResolver = void 0;
        this.compilerOptions = void 0;
    }
}
exports.$ESModule = $ESModule;
class $DocumentFragment {
    constructor(logger, $file, node, realm, pkg) {
        this.logger = logger;
        this.$file = $file;
        this.node = node;
        this.realm = realm;
        this.pkg = pkg;
        this.documentFragment = this;
        this.parent = this;
        this.ctx = 0 /* None */;
        this.depth = 0;
        const intrinsics = realm['[[Intrinsics]]'];
        this['[[Environment]]'] = intrinsics.undefined;
        this['[[Namespace]]'] = intrinsics.undefined;
        this.logger = logger.root;
        this.path = `DocumentFragment<(...)${$file.rootlessPath}>`;
    }
    get isNull() { return false; }
    get isAbrupt() { return false; }
    ResolveExport(ctx, exportName, resolveSet) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.[ResolveExport] returning content as '${exportName['[[Value]]']}'`);
        return new realm_js_1.ResolvedBindingRecord(this, exportName);
    }
    GetExportedNames(ctx, exportStarSet) {
        ctx.checkTimeout();
        return new list_js_1.$List();
    }
    Instantiate(ctx) {
        ctx.checkTimeout();
        return ctx.Realm['[[Intrinsics]]'].undefined;
    }
    /** @internal */
    _InnerModuleInstantiation(ctx, stack, idx) {
        ctx.checkTimeout();
        return idx;
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
}
exports.$DocumentFragment = $DocumentFragment;
class $ModuleDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ModuleDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (node.name.kind === typescript_1.SyntaxKind.Identifier) {
            this.$name = new expressions_js_1.$Identifier(node.name, this, ctx, -1);
        }
        else {
            this.$name = new literals_js_1.$StringLiteral(node.name, this, ctx, -1);
        }
        if (node.body === void 0) {
            this.$body = void 0;
        }
        else {
            switch (node.body.kind) {
                case typescript_1.SyntaxKind.Identifier:
                    this.$body = new expressions_js_1.$Identifier(node.body, this, ctx, -1);
                    break;
                case typescript_1.SyntaxKind.ModuleBlock:
                    this.$body = new $ModuleBlock(node.body, this, ctx);
                    break;
                case typescript_1.SyntaxKind.ModuleDeclaration:
                    this.$body = new $ModuleDeclaration(node.body, this, ctx, -1);
                    break;
                default:
                    throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ModuleDeclaration; }
}
exports.$ModuleDeclaration = $ModuleDeclaration;
// http://www.ecma-international.org/ecma-262/#importentry-record
/**
 * | Import Statement Form          | MR        | IN          | LN        |
 * |:-------------------------------|:----------|:------------|:----------|
 * | `import v from "mod";`         | `"mod"`   | `"default"` | `"v"`     |
 * | `import * as ns from "mod";`   | `"mod"`   | `"*"`       | `"ns"`    |
 * | `import {x} from "mod";`       | `"mod"`   | `"x"`       | `"x"`     |
 * | `import {x as v} from "mod";`  | `"mod"`   | `"x"`       | `"v"`     |
 * | `import "mod";`                | N/A       | N/A         | N/A       |
 */
class ImportEntryRecord {
    constructor(source, ModuleRequest, ImportName, LocalName) {
        this.source = source;
        this.ModuleRequest = ModuleRequest;
        this.ImportName = ImportName;
        this.LocalName = LocalName;
    }
}
exports.ImportEntryRecord = ImportEntryRecord;
/**
 * One of:
 * - import x = require("mod");
 * - import x = M.x;
 */
class $ImportEqualsDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ImportEqualsDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        switch (node.moduleReference.kind) {
            case typescript_1.SyntaxKind.Identifier:
                this.$moduleReference = new expressions_js_1.$Identifier(node.moduleReference, this, ctx, -1);
                break;
            case typescript_1.SyntaxKind.QualifiedName:
                this.$moduleReference = new $QualifiedName(node.moduleReference, this, ctx);
                break;
            case typescript_1.SyntaxKind.ExternalModuleReference:
                this.$moduleReference = new $ExternalModuleReference(node.moduleReference, this, ctx);
                break;
            default:
                throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ImportEqualsDeclaration; }
}
exports.$ImportEqualsDeclaration = $ImportEqualsDeclaration;
// In case of:
// import "mod"  => importClause = undefined, moduleSpecifier = "mod"
// In rest of the cases, module specifier is string literal corresponding to module
// ImportClause information is shown at its declaration below.
class $ImportDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ImportDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        const $moduleSpecifier = this.$moduleSpecifier = new literals_js_1.$StringLiteral(node.moduleSpecifier, this, ctx, -1);
        const moduleSpecifier = this.moduleSpecifier = $moduleSpecifier.StringValue;
        if (node.importClause === void 0) {
            this.$importClause = new undefined_js_1.$Undefined(realm, void 0, void 0, this);
            this.BoundNames = kernel_1.emptyArray;
            this.ImportEntries = kernel_1.emptyArray;
        }
        else {
            const $importClause = this.$importClause = new $ImportClause(node.importClause, this, ctx);
            this.BoundNames = $importClause.BoundNames;
            this.ImportEntries = $importClause.ImportEntriesForModule;
        }
        this.ModuleRequests = [moduleSpecifier];
    }
    get $kind() { return typescript_1.SyntaxKind.ImportDeclaration; }
}
exports.$ImportDeclaration = $ImportDeclaration;
// In case of:
// import d from "mod" => name = d, namedBinding = undefined
// import * as ns from "mod" => name = undefined, namedBinding: NamespaceImport = { name: ns }
// import d, * as ns from "mod" => name = d, namedBinding: NamespaceImport = { name: ns }
// import { a, b as x } from "mod" => name = undefined, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
// import d, { a, b as x } from "mod" => name = d, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
class $ImportClause {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.ImportClause`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const intrinsics = realm['[[Intrinsics]]'];
        const moduleSpecifier = this.moduleSpecifier = parent.moduleSpecifier;
        const BoundNames = this.BoundNames = [];
        const ImportEntriesForModule = this.ImportEntriesForModule = [];
        if (node.name === void 0) {
            this.$name = new undefined_js_1.$Undefined(realm, void 0, void 0, this);
        }
        else {
            const $name = this.$name = new expressions_js_1.$Identifier(node.name, this, ctx, -1);
            const [localName] = $name.BoundNames;
            BoundNames.push(localName);
            ImportEntriesForModule.push(new ImportEntryRecord(
            /* source */ this, 
            /* ModuleRequest */ moduleSpecifier, 
            /* ImportName */ intrinsics.default, 
            /* LocalName */ localName));
        }
        if (node.namedBindings === void 0) {
            this.$namedBindings = void 0;
        }
        else {
            if (node.namedBindings.kind === typescript_1.SyntaxKind.NamespaceImport) {
                const $namedBindings = this.$namedBindings = new $NamespaceImport(node.namedBindings, this, ctx);
                BoundNames.push(...$namedBindings.BoundNames);
                ImportEntriesForModule.push(...$namedBindings.ImportEntriesForModule);
            }
            else {
                const $namedBindings = this.$namedBindings = new $NamedImports(node.namedBindings, this, ctx);
                BoundNames.push(...$namedBindings.BoundNames);
                ImportEntriesForModule.push(...$namedBindings.ImportEntriesForModule);
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ImportClause; }
}
exports.$ImportClause = $ImportClause;
class $NamedImports {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.NamedImports`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.moduleSpecifier = parent.moduleSpecifier;
        const $elements = this.$elements = node.elements.map(x => new $ImportSpecifier(x, this, ctx));
        this.BoundNames = $elements.flatMap(_shared_js_1.getBoundNames);
        this.ImportEntriesForModule = $elements.flatMap(_shared_js_1.getImportEntriesForModule);
    }
    get $kind() { return typescript_1.SyntaxKind.NamedImports; }
}
exports.$NamedImports = $NamedImports;
class $ImportSpecifier {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.ImportSpecifier`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        let $propertyName;
        if (node.propertyName === void 0) {
            $propertyName = this.$propertyName = new undefined_js_1.$Undefined(realm, void 0, void 0, this);
        }
        else {
            $propertyName = this.$propertyName = new expressions_js_1.$Identifier(node.propertyName, this, ctx, -1);
        }
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        const BoundNames = this.BoundNames = this.$name.BoundNames;
        const moduleSpecifier = parent.moduleSpecifier;
        if ($propertyName.isUndefined) {
            const [localName] = BoundNames;
            this.ImportEntriesForModule = [
                new ImportEntryRecord(
                /* source */ this, 
                /* ModuleRequest */ moduleSpecifier, 
                /* ImportName */ localName, 
                /* LocalName */ localName),
            ];
        }
        else {
            const importName = $propertyName.StringValue;
            const localName = $name.StringValue;
            this.ImportEntriesForModule = [
                new ImportEntryRecord(
                /* source */ this, 
                /* ModuleRequest */ moduleSpecifier, 
                /* ImportName */ importName, 
                /* LocalName */ localName),
            ];
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ImportSpecifier; }
}
exports.$ImportSpecifier = $ImportSpecifier;
class $NamespaceImport {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.NamespaceImport`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const intrinsics = realm['[[Intrinsics]]'];
        const $name = this.$name = new expressions_js_1.$Identifier(node.name, this, ctx, -1);
        this.BoundNames = $name.BoundNames;
        const moduleSpecifier = parent.moduleSpecifier;
        const localName = $name.StringValue;
        this.ImportEntriesForModule = [
            new ImportEntryRecord(
            /* source */ this, 
            /* ModuleRequest */ moduleSpecifier, 
            /* ImportName */ intrinsics['*'], 
            /* LocalName */ localName),
        ];
    }
    get $kind() { return typescript_1.SyntaxKind.NamespaceImport; }
}
exports.$NamespaceImport = $NamespaceImport;
/**
 * | Export Statement Form           | EN           | MR            | IN         | LN            |
 * |:--------------------------------|:-------------|:--------------|:-----------|:--------------|
 * | `export var v;`                 | `"v"`        | `null`        | `null`     | `"v"`         |
 * | `export default function f(){}` | `"default"`  | `null`        | `null`     | `"f"`         |
 * | `export default function(){}`   | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export default 42;`            | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export {x};`                   | `"x"`        | `null`        | `null`     | `"x"`         |
 * | `export {v as x};`              | `"x"`        | `null`        | `null`     | `"v"`         |
 * | `export {x} from "mod";`        | `"x"`        | `"mod"`       | `"x"`      | `null`        |
 * | `export {v as x} from "mod";`   | `"x"`        | `"mod"`       | `"v"`      | `null`        |
 * | `export * from "mod";`          | `null`       | `"mod"`       | `"*"`      | `null`        |
 */
class ExportEntryRecord {
    constructor(source, ExportName, ModuleRequest, ImportName, LocalName) {
        this.source = source;
        this.ExportName = ExportName;
        this.ModuleRequest = ModuleRequest;
        this.ImportName = ImportName;
        this.LocalName = LocalName;
    }
}
exports.ExportEntryRecord = ExportEntryRecord;
class $ExportAssignment {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ExportAssignment`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const intrinsics = realm['[[Intrinsics]]'];
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        this.BoundNames = [intrinsics['*default*']];
    }
    get $kind() { return typescript_1.SyntaxKind.ExportAssignment; }
}
exports.$ExportAssignment = $ExportAssignment;
class $ExportDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ExportDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-boundnames
        // 15.2.3.2 Static Semantics: BoundNames
        this.BoundNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
        // 15.2.3.3 Static Semantics: ExportedBindings
        this.ExportedBindings = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-isconstantdeclaration
        // 15.2.3.7 Static Semantics: IsConstantDeclaration
        this.IsConstantDeclaration = false;
        // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
        // 15.2.3.8 Static Semantics: LexicallyScopedDeclarations
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.TypeDeclarations = kernel_1.emptyArray;
        this.IsType = false;
        const intrinsics = realm['[[Intrinsics]]'];
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        let moduleSpecifier;
        if (node.moduleSpecifier === void 0) {
            this.$moduleSpecifier = void 0;
            moduleSpecifier = this.moduleSpecifier = intrinsics.null;
            this.ModuleRequests = kernel_1.emptyArray;
        }
        else {
            const $moduleSpecifier = this.$moduleSpecifier = new literals_js_1.$StringLiteral(node.moduleSpecifier, this, ctx, -1);
            moduleSpecifier = this.moduleSpecifier = $moduleSpecifier.StringValue;
            this.ModuleRequests = [moduleSpecifier];
        }
        if (node.exportClause === void 0) {
            this.$exportClause = void 0;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = [
                new ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ intrinsics.null, 
                /* ModuleRequest */ moduleSpecifier, 
                /* ImportName */ intrinsics['*'], 
                /* LocalName */ intrinsics.null),
            ];
        }
        else {
            // @ts-ignore - TODO(fkleuver): update AOT to use new TS 3.8 ast
            const $exportClause = this.$exportClause = new $NamedExports(node.exportClause, this, ctx);
            this.ExportedNames = $exportClause.ExportedNames;
            this.ExportEntries = $exportClause.ExportEntriesForModule;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ExportDeclaration; }
}
exports.$ExportDeclaration = $ExportDeclaration;
class $NamedExports {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.NamedExports`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.moduleSpecifier = parent.moduleSpecifier;
        const $elements = this.$elements = node.elements.map(x => new $ExportSpecifier(x, this, ctx));
        this.ExportedNames = $elements.flatMap(_shared_js_1.getExportedNames);
        this.ExportEntriesForModule = $elements.flatMap(_shared_js_1.getExportEntriesForModule);
        this.ReferencedBindings = $elements.flatMap(_shared_js_1.getReferencedBindings);
    }
    get $kind() { return typescript_1.SyntaxKind.NamedExports; }
}
exports.$NamedExports = $NamedExports;
class $ExportSpecifier {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.ExportSpecifier`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const intrinsics = realm['[[Intrinsics]]'];
        let $propertyName;
        if (node.propertyName === void 0) {
            $propertyName = this.$propertyName = new undefined_js_1.$Undefined(realm, void 0, void 0, this);
        }
        else {
            $propertyName = this.$propertyName = new expressions_js_1.$Identifier(node.propertyName, this, ctx, -1);
        }
        const $name = this.$name = new expressions_js_1.$Identifier(node.name, this, ctx, -1);
        const moduleSpecifier = parent.moduleSpecifier;
        if ($propertyName.isUndefined) {
            const sourceName = $name.StringValue;
            this.ReferencedBindings = [sourceName];
            this.ExportedNames = [sourceName];
            if (moduleSpecifier.isNull) {
                this.ExportEntriesForModule = [
                    new ExportEntryRecord(
                    /* source */ this, 
                    /* ExportName */ sourceName, 
                    /* ModuleRequest */ moduleSpecifier, 
                    /* ImportName */ intrinsics.null, 
                    /* LocalName */ sourceName),
                ];
            }
            else {
                this.ExportEntriesForModule = [
                    new ExportEntryRecord(
                    /* source */ this, 
                    /* ExportName */ sourceName, 
                    /* ModuleRequest */ moduleSpecifier, 
                    /* ImportName */ sourceName, 
                    /* LocalName */ intrinsics.null),
                ];
            }
        }
        else {
            const exportName = $name.StringValue;
            const sourceName = $propertyName.StringValue;
            this.ReferencedBindings = [sourceName];
            this.ExportedNames = [exportName];
            if (moduleSpecifier.isNull) {
                this.ExportEntriesForModule = [
                    new ExportEntryRecord(
                    /* source */ this, 
                    /* ExportName */ exportName, 
                    /* ModuleRequest */ moduleSpecifier, 
                    /* ImportName */ intrinsics.null, 
                    /* LocalName */ sourceName),
                ];
            }
            else {
                this.ExportEntriesForModule = [
                    new ExportEntryRecord(
                    /* source */ this, 
                    /* ExportName */ exportName, 
                    /* ModuleRequest */ moduleSpecifier, 
                    /* ImportName */ sourceName, 
                    /* LocalName */ intrinsics.null),
                ];
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.ExportSpecifier; }
}
exports.$ExportSpecifier = $ExportSpecifier;
class $NamespaceExportDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.NamespaceExportDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.NamespaceExportDeclaration; }
}
exports.$NamespaceExportDeclaration = $NamespaceExportDeclaration;
class $ModuleBlock {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.ModuleBlock`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // TODO: ModuleBlock shares a lot in common with SourceFile, so we implement this last to try to maximize code reuse / reduce refactoring overhead and/or see if the two can be consolidated.
        this.$statements = kernel_1.emptyArray;
    }
    get $kind() { return typescript_1.SyntaxKind.ModuleBlock; }
}
exports.$ModuleBlock = $ModuleBlock;
class $ExternalModuleReference {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.ExternalModuleReference`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = new literals_js_1.$StringLiteral(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.ExternalModuleReference; }
}
exports.$ExternalModuleReference = $ExternalModuleReference;
class $QualifiedName {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.QualifiedName`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        if (node.left.kind === typescript_1.SyntaxKind.Identifier) {
            this.$left = new expressions_js_1.$Identifier(node.left, this, ctx, -1);
        }
        else {
            this.$left = new $QualifiedName(node.left, this, ctx);
        }
        this.$right = new expressions_js_1.$Identifier(node.right, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.QualifiedName; }
}
exports.$QualifiedName = $QualifiedName;
//# sourceMappingURL=modules.js.map