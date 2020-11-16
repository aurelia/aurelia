import { $Object } from '../types/object.js';
import { $Null } from '../types/null.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $Boolean } from '../types/boolean.js';
import { $Error } from '../types/error.js';
import { $AnyObject } from '../types/_shared.js';
export declare class $ImmutablePrototypeExoticObject extends $Object<'ImmutablePrototypeExoticObject'> {
    constructor(realm: Realm, proto: $AnyObject | $Null);
    '[[SetPrototypeOf]]'(ctx: ExecutionContext, V: $AnyObject | $Null): $Boolean | $Error;
}
//# sourceMappingURL=immutable-prototype.d.ts.map