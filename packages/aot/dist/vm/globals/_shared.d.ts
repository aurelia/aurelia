import { $BuiltinFunction, $Function } from '../types/function';
import { $AnyNonEmptyNonError, $AnyNonEmpty } from '../types/_shared';
import { $List } from '../types/list';
import { Realm, ExecutionContext } from '../realm';
import { $Undefined } from '../types/undefined';
export declare class $ValueRecord<T> {
    '[[Value]]': T;
    constructor(value: T);
}
export declare class $GetSpecies extends $BuiltinFunction<'get [@@species]'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=_shared.d.ts.map