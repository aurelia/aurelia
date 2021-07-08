import { $Object } from '../types/object.js';
import { $Null } from '../types/null.js';
import { $Number } from '../types/number.js';
import { $String } from '../types/string.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $PropertyKey, $AnyNonEmpty, $AnyObject } from '../types/_shared.js';
import { $PropertyDescriptor } from '../types/property-descriptor.js';
import { $Undefined } from '../types/undefined.js';
import { $Boolean } from '../types/boolean.js';
import { $Error } from '../types/error.js';
import { $List } from '../types/list.js';
export declare class $IntegerIndexedExoticObject extends $Object<'IntegerIndexedExoticObject'> {
    '[[ViewedArrayBuffer]]': $AnyObject | $Null;
    '[[ArrayLength]]': $Number;
    '[[ByteOffset]]': $Number;
    '[[TypedArrayName]]': $String;
    constructor(realm: Realm, proto: $AnyObject | $Null);
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined | $Error;
    '[[HasProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    '[[Get]]'(ctx: ExecutionContext, P: $PropertyKey, Receiver: $AnyNonEmpty): $AnyNonEmpty;
    '[[Set]]'(ctx: ExecutionContext, P: $PropertyKey, V: $AnyNonEmpty, Receiver: $AnyObject): $Boolean | $Error;
    '[[OwnPropertyKeys]]'(ctx: ExecutionContext): $List<$PropertyKey>;
    ElementGet(index: $Number): $AnyNonEmpty;
    ElementSet(index: $Number, value: $Number): $AnyNonEmpty;
}
export declare function $IsDetachedBuffer(arrayBuffer: $IntegerIndexedExoticObject): boolean;
export declare function $GetValueFromBuffer(arrayBuffer: $IntegerIndexedExoticObject, byteIndex: $Number, type: $String, isTypedArray: $Boolean, order: $String, isLittleEndian?: $Boolean): $Number;
export declare function $SetValueInBuffer(arrayBuffer: $IntegerIndexedExoticObject, byteIndex: $Number, type: $String, value: $Number, isTypedArray: $Boolean, order: $String, isLittleEndian?: $Boolean): void;
//# sourceMappingURL=integer-indexed.d.ts.map