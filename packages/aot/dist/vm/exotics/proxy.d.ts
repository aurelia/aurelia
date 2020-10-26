import { $Object } from '../types/object';
import { $Null } from '../types/null';
import { Realm, ExecutionContext } from '../realm';
import { $PropertyKey, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from '../types/_shared';
import { $Boolean } from '../types/boolean';
import { $PropertyDescriptor } from '../types/property-descriptor';
import { $Undefined } from '../types/undefined';
import { $Function } from '../types/function';
import { $Error } from '../types/error';
import { $List } from '../types/list';
export declare class $ProxyExoticObject extends $Object<'ProxyExoticObject'> {
    '[[ProxyHandler]]': $AnyObject | $Null;
    '[[ProxyTarget]]': $AnyObject | $Null;
    get isProxy(): true;
    constructor(realm: Realm, target: $AnyNonEmpty, handler: $AnyNonEmpty);
    '[[GetPrototypeOf]]'(ctx: ExecutionContext): $AnyObject | $Null | $Error;
    '[[SetPrototypeOf]]'(ctx: ExecutionContext, V: $AnyObject | $Null): $Boolean | $Error;
    '[[IsExtensible]]'(ctx: ExecutionContext): $Boolean | $Error;
    '[[PreventExtensions]]'(ctx: ExecutionContext): $Boolean | $Error;
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined | $Error;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    '[[HasProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
    '[[Get]]'(ctx: ExecutionContext, P: $PropertyKey, Receiver: $AnyNonEmptyNonError): $AnyNonEmpty;
    '[[Set]]'(ctx: ExecutionContext, P: $PropertyKey, V: $AnyNonEmpty, Receiver: $AnyObject): $Boolean | $Error;
    '[[Delete]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
    '[[OwnPropertyKeys]]'(ctx: ExecutionContext): $List<$PropertyKey> | $Error;
    '[[Call]]'(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>): $AnyNonEmpty;
    '[[Construct]]'(ctx: ExecutionContext, argumentsList: $List<$AnyNonEmpty>, newTarget: $Function | $Undefined): $AnyObject | $Error;
}
//# sourceMappingURL=proxy.d.ts.map