import { $BuiltinFunction, $Function } from '../types/function.js';
import { $AnyNonEmptyNonError, $AnyNonEmpty } from '../types/_shared.js';
import { $List } from '../types/list.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $Undefined } from '../types/undefined.js';
export declare class $ValueRecord<T> {
    '[[Value]]': T;
    constructor(value: T);
}
export declare class $GetSpecies extends $BuiltinFunction<'get [@@species]'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=_shared.d.ts.map