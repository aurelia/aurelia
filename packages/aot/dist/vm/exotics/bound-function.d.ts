import { $Object } from '../types/object.js';
import { $Function } from '../types/function.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $Undefined } from '../types/undefined.js';
import { $List } from '../types/list.js';
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