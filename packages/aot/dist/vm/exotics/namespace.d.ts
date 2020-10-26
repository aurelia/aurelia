import { $Object } from '../types/object';
import { IModule, ExecutionContext, Realm } from '../realm';
import { $String } from '../types/string';
import { $Boolean } from '../types/boolean';
import { $PropertyKey, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from '../types/_shared';
import { $PropertyDescriptor } from '../types/property-descriptor';
import { $Undefined } from '../types/undefined';
import { $Error } from '../types/error';
import { $List } from '../types/list';
export declare class $NamespaceExoticObject extends $Object<'NamespaceExoticObject'> {
    readonly '[[Module]]': IModule;
    readonly '[[Exports]]': $List<$String>;
    constructor(realm: Realm, mod: IModule, exports: $List<$String>);
    '[[SetPrototypeOf]]'(ctx: ExecutionContext, V: $AnyObject): $Boolean | $Error;
    '[[IsExtensible]]'(ctx: ExecutionContext): $Boolean<false>;
    '[[PreventExtensions]]'(ctx: ExecutionContext): $Boolean<true>;
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined | $Error;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    '[[HasProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
    '[[Get]]'(ctx: ExecutionContext, P: $PropertyKey, Receiver: $AnyNonEmptyNonError): $AnyNonEmpty;
    '[[Set]]'(ctx: ExecutionContext, P: $PropertyKey, V: $AnyNonEmpty, Receiver: $AnyObject): $Boolean<false>;
    '[[Delete]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
    '[[OwnPropertyKeys]]'(ctx: ExecutionContext): $List<$PropertyKey>;
}
//# sourceMappingURL=namespace.d.ts.map