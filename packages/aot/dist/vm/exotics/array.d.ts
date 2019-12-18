import { $Object } from '../types/object';
import { Realm, ExecutionContext } from '../realm';
import { $Number } from '../types/number';
import { $PropertyDescriptor } from '../types/property-descriptor';
import { $PropertyKey, $AnyNonEmpty, $AnyObject } from '../types/_shared';
import { $Boolean } from '../types/boolean';
import { $Error } from '../types/error';
import { $List } from '../types/list';
export declare class $ArrayExoticObject extends $Object<'ArrayExoticObject'> {
    get isArray(): true;
    constructor(realm: Realm, length: $Number, proto?: $AnyObject);
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    ArraySetLength(ctx: ExecutionContext, Desc: $PropertyDescriptor): $Boolean | $Error;
}
export declare function $ArraySpeciesCreate(ctx: ExecutionContext, originalArray: $AnyObject, length: $Number): $AnyObject | $Error;
export declare function $CreateArrayFromList(ctx: ExecutionContext, elements: $List<$AnyNonEmpty>): $ArrayExoticObject;
//# sourceMappingURL=array.d.ts.map