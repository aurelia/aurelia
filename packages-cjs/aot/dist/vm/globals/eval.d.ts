import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $List } from '../types/list.js';
export declare class $Eval extends $BuiltinFunction<'%eval%'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $PerformEval(ctx: ExecutionContext, x: any, evalRealm: any, strictCaller: any, direct: any): any;
export declare function $EvalDeclarationInstantiation(ctx: ExecutionContext, body: any, varEnv: any, lexEnv: any, strict: any): any;
//# sourceMappingURL=eval.d.ts.map