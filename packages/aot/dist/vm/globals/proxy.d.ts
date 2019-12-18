import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $List } from '../types/list';
import { $ProxyExoticObject } from '../exotics/proxy';
import { $Null } from '../types/null';
export declare class $ProxyConstructor extends $BuiltinFunction<'%Proxy%'> {
    get revocable(): $Proxy_revocable;
    set revocable(value: $Proxy_revocable);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [target, handler]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Proxy_revocable extends $BuiltinFunction<'Proxy.revocable'> {
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [target, handler]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Proxy_revocation extends $BuiltinFunction<'Proxy Revocation'> {
    '[[RecovableProxy]]': $ProxyExoticObject | $Null;
    constructor(realm: Realm, revocableProxy: $ProxyExoticObject);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [target, handler]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=proxy.d.ts.map