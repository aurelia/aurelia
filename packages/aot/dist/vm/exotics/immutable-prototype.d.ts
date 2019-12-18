import { $Object } from '../types/object';
import { $Null } from '../types/null';
import { Realm, ExecutionContext } from '../realm';
import { $Boolean } from '../types/boolean';
import { $Error } from '../types/error';
import { $AnyObject } from '../types/_shared';
export declare class $ImmutablePrototypeExoticObject extends $Object<'ImmutablePrototypeExoticObject'> {
    constructor(realm: Realm, proto: $AnyObject | $Null);
    '[[SetPrototypeOf]]'(ctx: ExecutionContext, V: $AnyObject | $Null): $Boolean | $Error;
}
//# sourceMappingURL=immutable-prototype.d.ts.map