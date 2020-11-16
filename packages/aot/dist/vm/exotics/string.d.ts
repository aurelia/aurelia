import { $Object } from '../types/object.js';
import { $String } from '../types/string.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $PropertyDescriptor } from '../types/property-descriptor.js';
import { $PropertyKey, $AnyObject } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $Boolean } from '../types/boolean.js';
import { $List } from '../types/list.js';
export declare class $StringExoticObject extends $Object<'StringExoticObject'> {
    readonly '[[StringData]]': $String;
    constructor(realm: Realm, value: $String, proto: $AnyObject);
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean;
    '[[OwnPropertyKeys]]'(ctx: ExecutionContext): $List<$PropertyKey>;
}
//# sourceMappingURL=string.d.ts.map