import { $BuiltinFunction, $Function } from './function';
import { $AnyNonEmptyNonError, $Any, $AnyNonEmpty } from './_shared';
import { $List } from './list';
import { ExecutionContext, Realm } from '../realm';
import { $Undefined } from './undefined';
import { $Error } from './error';
import { $Number } from './number';
export declare function $Await(ctx: ExecutionContext, value: $Any): $Undefined | $Error;
export declare class $Await_Fulfilled extends $BuiltinFunction<'Await_Fulfilled'> {
    '[[AsyncContext]]': ExecutionContext;
    get length(): $Number<1>;
    set length(value: $Number<1>);
    constructor(realm: Realm, asyncContext: ExecutionContext);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Await_Rejected extends $BuiltinFunction<'Await_Rejected'> {
    '[[AsyncContext]]': ExecutionContext;
    get length(): $Number<1>;
    set length(value: $Number<1>);
    constructor(realm: Realm, asyncContext: ExecutionContext);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=await.d.ts.map