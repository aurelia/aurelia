import { Realm, ExecutionContext } from '../realm.js';
import { $Boolean } from './boolean.js';
import { $Undefined } from './undefined.js';
import { $Empty } from './empty.js';
import { $Function } from './function.js';
import { $AnyNonError, $PropertyKey, $Any } from './_shared.js';
import { IDisposable, Writable } from '@aurelia/kernel';
export declare class $PropertyDescriptor implements IDisposable {
    readonly realm: Realm;
    readonly name: $PropertyKey;
    readonly '<$PropertyDescriptor>': unknown;
    readonly id: number;
    get isAbrupt(): false;
    get isEmpty(): false;
    get isUndefined(): false;
    get isNull(): false;
    get isNil(): false;
    get isBoolean(): false;
    get isNumber(): false;
    get isString(): false;
    get isSymbol(): false;
    get isPrimitive(): false;
    get isObject(): false;
    get isFunction(): false;
    '[[Enumerable]]': $Boolean | $Undefined | $Empty;
    '[[Configurable]]': $Boolean | $Undefined | $Empty;
    '[[Get]]': $Function | $Undefined | $Empty;
    '[[Set]]': $Function | $Undefined | $Empty;
    '[[Value]]': $Any;
    '[[Writable]]': $Boolean | $Undefined | $Empty;
    get isAccessorDescriptor(): boolean;
    get isDataDescriptor(): boolean;
    get isGenericDescriptor(): boolean;
    constructor(realm: Realm, name: $PropertyKey, config?: {
        '[[Enumerable]]'?: $Boolean | $Undefined | $Empty;
        '[[Configurable]]'?: $Boolean | $Undefined | $Empty;
        '[[Get]]'?: $Function | $Undefined | $Empty;
        '[[Set]]'?: $Function | $Undefined | $Empty;
        '[[Value]]'?: $AnyNonError;
        '[[Writable]]'?: $Boolean | $Undefined | $Empty;
    });
    Complete(ctx: ExecutionContext): this;
    dispose(this: Writable<Partial<$PropertyDescriptor>>): void;
}
export declare function $IsAccessorDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor;
export declare function $IsDataDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor;
export declare function $IsGenericDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor;
//# sourceMappingURL=property-descriptor.d.ts.map