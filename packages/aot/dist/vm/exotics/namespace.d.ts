import { $Object } from '../types/object.js';
import { IModule, ExecutionContext, Realm } from '../realm.js';
import { $String } from '../types/string.js';
import { $Boolean } from '../types/boolean.js';
import { $PropertyKey, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from '../types/_shared.js';
import { $PropertyDescriptor } from '../types/property-descriptor.js';
import { $Undefined } from '../types/undefined.js';
import { $Error } from '../types/error.js';
import { $List } from '../types/list.js';
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