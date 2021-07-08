import { $Object } from '../types/object.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $Number } from '../types/number.js';
import { $PropertyDescriptor } from '../types/property-descriptor.js';
import { $PropertyKey, $AnyNonEmpty, $AnyObject } from '../types/_shared.js';
import { $Boolean } from '../types/boolean.js';
import { $Error } from '../types/error.js';
import { $List } from '../types/list.js';
export declare class $ArrayExoticObject extends $Object<'ArrayExoticObject'> {
    get isArray(): true;
    constructor(realm: Realm, length: $Number, proto?: $AnyObject);
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    ArraySetLength(ctx: ExecutionContext, Desc: $PropertyDescriptor): $Boolean | $Error;
}
export declare function $ArraySpeciesCreate(ctx: ExecutionContext, originalArray: $AnyObject, length: $Number): $AnyObject | $Error;
export declare function $CreateArrayFromList(ctx: ExecutionContext, elements: $List<$AnyNonEmpty>): $ArrayExoticObject;
//# sourceMappingURL=array.d.ts.map