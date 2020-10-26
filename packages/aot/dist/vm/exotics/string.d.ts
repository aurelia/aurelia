import { $Object } from '../types/object';
import { $String } from '../types/string';
import { Realm, ExecutionContext } from '../realm';
import { $PropertyDescriptor } from '../types/property-descriptor';
import { $PropertyKey, $AnyObject } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $Boolean } from '../types/boolean';
import { $List } from '../types/list';
export declare class $StringExoticObject extends $Object<'StringExoticObject'> {
    readonly '[[StringData]]': $String;
    constructor(realm: Realm, value: $String, proto: $AnyObject);
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean;
    '[[OwnPropertyKeys]]'(ctx: ExecutionContext): $List<$PropertyKey>;
}
//# sourceMappingURL=string.d.ts.map