import { $Object } from '../types/object';
import { $Function } from '../types/function';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { Realm, ExecutionContext } from '../realm';
import { $Undefined } from '../types/undefined';
import { $List } from '../types/list';
export declare class $BoundFunctionExoticObject extends $Object<'BoundFunctionExoticObject'> {
    '[[BoundTargetFunction]]': $Function;
    '[[BoundThis]]': $AnyNonEmptyNonError;
    '[[BoundArguments]]': $AnyNonEmpty[];
    get isBoundFunction(): true;
    constructor(realm: Realm, targetFunction: $Function, boundThis: $AnyNonEmptyNonError, boundArgs: $AnyNonEmpty[]);
    '[[Call]]'(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>): $AnyNonEmpty;
    '[[Construct]]'(ctx: ExecutionContext, argumentsList: $List<$AnyNonEmpty>, newTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=bound-function.d.ts.map