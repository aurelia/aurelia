import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-eval-x
// 18.2.1 eval ( x )
export class $Eval extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%eval%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Assert: The execution context stack has at least two elements.
        // 2. Let callerContext be the second to top element of the execution context stack.
        // 3. Let callerRealm be callerContext's Realm.
        // 4. Let calleeRealm be the current Realm Record.
        // 5. Perform ? HostEnsureCanCompileStrings(callerRealm, calleeRealm).
        // 6. Return ? PerformEval(x, calleeRealm, false, false).
        throw new Error('Method not implemented.');
    }
}
// http://www.ecma-international.org/ecma-262/#sec-performeval
// 18.2.1.1 Runtime Semantics: PerformEval ( x , evalRealm , strictCaller , direct )
export function $PerformEval(ctx, x, evalRealm, strictCaller, direct) {
    // 1. Assert: If direct is false, then strictCaller is also false.
    // 2. If Type(x) is not String, return x.
    // 3. Let thisEnvRec be ! GetThisEnvironment().
    // 4. If thisEnvRec is a function Environment Record, then
    // 4. a. Let F be thisEnvRec.[[FunctionObject]].
    // 4. b. Let inFunction be true.
    // 4. c. Let inMethod be thisEnvRec.HasSuperBinding().
    // 4. d. If F.[[ConstructorKind]] is "derived", let inDerivedConstructor be true; otherwise, let inDerivedConstructor be false.
    // 5. Else,
    // 5. a. Let inFunction be false.
    // 5. b. Let inMethod be false.
    // 5. c. Let inDerivedConstructor be false.
    // 6. Let script be the ECMAScript code that is the result of parsing x, interpreted as UTF-16 encoded Unicode text as described in 6.1.4, for the goal symbol Script. If inFunction is false, additional early error rules from 18.2.1.1.1 are applied. If inMethod is false, additional early error rules from 18.2.1.1.2 are applied. If inDerivedConstructor is false, additional early error rules from 18.2.1.1.3 are applied. If the parse fails, throw a SyntaxError exception. If any early errors are detected, throw a SyntaxError or a ReferenceError exception, depending on the type of the error (but see also clause 16). Parsing and early error detection may be interweaved in an implementation-dependent manner.
    // 7. If script Contains ScriptBody is false, return undefined.
    // 8. Let body be the ScriptBody of script.
    // 9. If strictCaller is true, let strictEval be true.
    // 10. Else, let strictEval be IsStrict of script.
    // 11. Let ctx be the running execution context.
    // 12. NOTE: If direct is true, ctx will be the execution context that performed the direct eval. If direct is false, ctx will be the execution context for the invocation of the eval function.
    // 13. If direct is true, then
    // 13. a. Let lexEnv be NewDeclarativeEnvironment(ctx's LexicalEnvironment).
    // 13. b. Let varEnv be ctx's VariableEnvironment.
    // 14. Else,
    // 14. a. Let lexEnv be NewDeclarativeEnvironment(evalRealm.[[GlobalEnv]]).
    // 14. b. Let varEnv be evalRealm.[[GlobalEnv]].
    // 15. If strictEval is true, set varEnv to lexEnv.
    // 16. If ctx is not already suspended, suspend ctx.
    // 17. Let evalCxt be a new ECMAScript code execution context.
    // 18. Set the evalCxt's Function to null.
    // 19. Set the evalCxt's Realm to evalRealm.
    // 20. Set the evalCxt's ScriptOrModule to ctx's ScriptOrModule.
    // 21. Set the evalCxt's VariableEnvironment to varEnv.
    // 22. Set the evalCxt's LexicalEnvironment to lexEnv.
    // 23. Push evalCxt on to the execution context stack; evalCxt is now the running execution context.
    // 24. Let result be EvalDeclarationInstantiation(body, varEnv, lexEnv, strictEval).
    // 25. If result.[[Type]] is normal, then
    // 25. a. Set result to the result of evaluating body.
    // 26. If result.[[Type]] is normal and result.[[Value]] is empty, then
    // 26. a. Set result to NormalCompletion(undefined).
    // 27. Suspend evalCxt and remove it from the execution context stack.
    // 28. Resume the context that is now on the top of the execution context stack as the running execution context.
    // 29. Return Completion(result).
    throw new Error('Method not implemented.');
}
// http://www.ecma-international.org/ecma-262/#sec-performeval-rules-outside-functions
// 18.2.1.1.1 Additional Early Error Rules for Eval Outside Functions
// ScriptBody :
//     StatementList
// http://www.ecma-international.org/ecma-262/#sec-performeval-rules-outside-methods
// 18.2.1.1.2 Additional Early Error Rules for Eval Outside Methods
// ScriptBody :
//     StatementList
// http://www.ecma-international.org/ecma-262/#sec-performeval-rules-outside-constructors
// 18.2.1.1.3 Additional Early Error Rules for Eval Outside Constructor Methods
// ScriptBody :
//     StatementList
// http://www.ecma-international.org/ecma-262/#sec-evaldeclarationinstantiation
// 18.2.1.3 Runtime Semantics: EvalDeclarationInstantiation ( body , varEnv , lexEnv , strict )
export function $EvalDeclarationInstantiation(ctx, body, varEnv, lexEnv, strict) {
    // 1. Let varNames be the VarDeclaredNames of body.
    // 2. Let varDeclarations be the VarScopedDeclarations of body.
    // 3. Let lexEnvRec be lexEnv's EnvironmentRecord.
    // 4. Let varEnvRec be varEnv's EnvironmentRecord.
    // 5. If strict is false, then
    // 5. a. If varEnvRec is a global Environment Record, then
    // 5. a. i. For each name in varNames, do
    // 5. a. i. 1. If varEnvRec.HasLexicalDeclaration(name) is true, throw a SyntaxError exception.
    // 5. a. i. 2. NOTE: eval will not create a global var declaration that would be shadowed by a global lexical declaration.
    // 5. b. Let thisLex be lexEnv.
    // 5. c. Assert: The following loop will terminate.
    // 5. d. Repeat, while thisLex is not the same as varEnv,
    // 5. d. i. Let thisEnvRec be thisLex's EnvironmentRecord.
    // 5. d. ii. If thisEnvRec is not an object Environment Record, then
    // 5. d. ii. 1. NOTE: The environment of with statements cannot contain any lexical declaration so it doesn't need to be checked for var/let hoisting conflicts.
    // 5. d. ii. 2. For each name in varNames, do
    // 5. d. ii. 2. a. If thisEnvRec.HasBinding(name) is true, then
    // 5. d. ii. 2. a. i. Throw a SyntaxError exception.
    // 5. d. ii. 2. a. ii. NOTE: Annex B.3.5 defines alternate semantics for the above step.
    // 5. d. ii. 2. b. NOTE: A direct eval will not hoist var declaration over a like-named lexical declaration.
    // 5. d. iii. Set thisLex to thisLex's outer environment reference.
    // 6. Let functionsToInitialize be a new empty List.
    // 7. Let declaredFunctionNames be a new empty List.
    // 8. For each d in varDeclarations, in reverse list order, do
    // 8. a. If d is neither a VariableDeclaration nor a ForBinding nor a BindingIdentifier, then
    // 8. a. i. Assert: d is either a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration.
    // 8. a. ii. NOTE: If there are multiple function declarations for the same name, the last declaration is used.
    // 8. a. iii. Let fn be the sole element of the BoundNames of d.
    // 8. a. iv. If fn is not an element of declaredFunctionNames, then
    // 8. a. iv. 1. If varEnvRec is a global Environment Record, then
    // 8. a. iv. 1. a. Let fnDefinable be ? varEnvRec.CanDeclareGlobalFunction(fn).
    // 8. a. iv. 1. b. If fnDefinable is false, throw a TypeError exception.
    // 8. a. iv. 2. Append fn to declaredFunctionNames.
    // 8. a. iv. 3. Insert d as the first element of functionsToInitialize.
    // 9. NOTE: Annex B.3.3.3 adds additional steps at this point.
    // 10. Let declaredVarNames be a new empty List.
    // 11. For each d in varDeclarations, do
    // 11. a. If d is a VariableDeclaration, a ForBinding, or a BindingIdentifier, then
    // 11. a. i. For each String vn in the BoundNames of d, do
    // 11. a. i. 1. If vn is not an element of declaredFunctionNames, then
    // 11. a. i. 1. a. If varEnvRec is a global Environment Record, then
    // 11. a. i. 1. a. i. Let vnDefinable be ? varEnvRec.CanDeclareGlobalVar(vn).
    // 11. a. i. 1. a. ii. If vnDefinable is false, throw a TypeError exception.
    // 11. a. i. 1. b. If vn is not an element of declaredVarNames, then
    // 11. a. i. 1. b. i. Append vn to declaredVarNames.
    // 12. NOTE: No abnormal terminations occur after this algorithm step unless varEnvRec is a global Environment Record and the global object is a Proxy exotic object.
    // 13. Let lexDeclarations be the LexicallyScopedDeclarations of body.
    // 14. For each element d in lexDeclarations, do
    // 14. a. NOTE: Lexically declared names are only instantiated here but not initialized.
    // 14. b. For each element dn of the BoundNames of d, do
    // 14. b. i. If IsConstantDeclaration of d is true, then
    // 14. b. i. 1. Perform ? lexEnvRec.CreateImmutableBinding(dn, true).
    // 14. b. ii. Else,
    // 14. b. ii. 1. Perform ? lexEnvRec.CreateMutableBinding(dn, false).
    // 15. For each Parse Node f in functionsToInitialize, do
    // 15. a. Let fn be the sole element of the BoundNames of f.
    // 15. b. Let fo be the result of performing InstantiateFunctionObject for f with argument lexEnv.
    // 15. c. If varEnvRec is a global Environment Record, then
    // 15. c. i. Perform ? varEnvRec.CreateGlobalFunctionBinding(fn, fo, true).
    // 15. d. Else,
    // 15. d. i. Let bindingExists be varEnvRec.HasBinding(fn).
    // 15. d. ii. If bindingExists is false, then
    // 15. d. ii. 1. Let status be ! varEnvRec.CreateMutableBinding(fn, true).
    // 15. d. ii. 2. Assert: status is not an abrupt completion because of validation preceding step 12.
    // 15. d. ii. 3. Perform ! varEnvRec.InitializeBinding(fn, fo).
    // 15. d. iii. Else,
    // 15. d. iii. 1. Perform ! varEnvRec.SetMutableBinding(fn, fo, false).
    // 16. For each String vn in declaredVarNames, in list order, do
    // 16. a. If varEnvRec is a global Environment Record, then
    // 16. a. i. Perform ? varEnvRec.CreateGlobalVarBinding(vn, true).
    // 16. b. Else,
    // 16. b. i. Let bindingExists be varEnvRec.HasBinding(vn).
    // 16. b. ii. If bindingExists is false, then
    // 16. b. ii. 1. Let status be ! varEnvRec.CreateMutableBinding(vn, true).
    // 16. b. ii. 2. Assert: status is not an abrupt completion because of validation preceding step 12.
    // 16. b. ii. 3. Perform ! varEnvRec.InitializeBinding(vn, undefined).
    // 17. Return NormalCompletion(empty).
    throw new Error('Method not implemented.');
}
//# sourceMappingURL=eval.js.map