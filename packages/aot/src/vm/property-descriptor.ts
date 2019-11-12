import { $Boolean, $Undefined, $Empty, $Function, $Any, $PropertyKey } from './value';
import { Realm } from './realm';

let descriptorId = 0;

// http://www.ecma-international.org/ecma-262/#sec-property-descriptor-specification-type
export class $PropertyDescriptor {
  public readonly '<$PropertyDescriptor>': unknown;

  public readonly id: number = ++descriptorId;

  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  public '[[Enumerable]]': $Boolean | $Undefined | $Empty;
  public '[[Configurable]]': $Boolean | $Undefined | $Empty;

  public '[[Get]]': $Function | $Undefined | $Empty;
  public '[[Set]]': $Function | $Undefined | $Empty;

  public '[[Value]]': $Any;
  public '[[Writable]]': $Boolean | $Undefined | $Empty;

  // http://www.ecma-international.org/ecma-262/#sec-isaccessordescriptor
  public get isAccessorDescriptor(): boolean {
    // 2. If both Desc.[[Get]] and Desc.[[Set]] are absent, return false.
    return !this['[[Get]]'].isEmpty || !this['[[Set]]'].isEmpty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isdatadescriptor
  public get isDataDescriptor(): boolean {
    // 2. If both Desc.[[Value]] and Desc.[[Writable]] are absent, return false.
    return !this['[[Value]]'].isEmpty || !this['[[Writable]]'].isEmpty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isgenericdescriptor
  public get isGenericDescriptor(): boolean {
    // 2. If IsAccessorDescriptor(Desc) and IsDataDescriptor(Desc) are both false, return true.
    return (
      this['[[Get]]'].isEmpty &&
      this['[[Set]]'].isEmpty &&
      this['[[Value]]'].isEmpty &&
      this['[[Writable]]'].isEmpty
    );
  }

  public constructor(
    public readonly realm: Realm,
    public readonly name: $PropertyKey,
    config?: {
      '[[Enumerable]]'?: $Boolean | $Undefined | $Empty;
      '[[Configurable]]'?: $Boolean | $Undefined | $Empty;

      '[[Get]]'?: $Function | $Undefined | $Empty;
      '[[Set]]'?: $Function | $Undefined | $Empty;

      '[[Value]]'?: $Any;
      '[[Writable]]'?: $Boolean | $Undefined | $Empty;
    },
  ) {
    const $empty = realm['[[Intrinsics]]'].empty;

    this['[[Enumerable]]'] = $empty;
    this['[[Configurable]]'] = $empty;

    this['[[Get]]'] = $empty;
    this['[[Set]]'] = $empty;

    this['[[Value]]'] = $empty;
    this['[[Writable]]'] = $empty;

    Object.assign(this, config);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-isaccessordescriptor
export function $IsAccessorDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor {
  // 1. If Desc is undefined, return false.
  if (Desc.isUndefined) {
    return false;
  }

  // 2. If both Desc.[[Get]] and Desc.[[Set]] are absent, return false.
  // 3. Return true.
  return Desc.isAccessorDescriptor;
}

// http://www.ecma-international.org/ecma-262/#sec-isdatadescriptor
export function $IsDataDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor {
  // 1. If Desc is undefined, return false.
  if (Desc.isUndefined) {
    return false;
  }

  // 2. If both Desc.[[Value]] and Desc.[[Writable]] are absent, return false.
  // 3. Return true.
  return Desc.isDataDescriptor;
}

// http://www.ecma-international.org/ecma-262/#sec-isgenericdescriptor
export function $IsGenericDescriptor(Desc: $PropertyDescriptor | $Undefined): Desc is $PropertyDescriptor {
  // 1. If Desc is undefined, return false.
  if (Desc.isUndefined) {
    return false;
  }

  // 2. If IsAccessorDescriptor(Desc) and IsDataDescriptor(Desc) are both false, return true.
  // 3. Return false.
  return Desc.isGenericDescriptor;
}
