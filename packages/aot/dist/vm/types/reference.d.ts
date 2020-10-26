import { Realm, ExecutionContext } from '../realm';
import { $Boolean } from './boolean';
import { $String } from './string';
import { $Symbol } from './symbol';
import { $Number } from './number';
import { $EnvRec } from './environment-record';
import { $Undefined } from './undefined';
import { $AnyNonEmpty, $AnyObject } from './_shared';
import { $Empty } from './empty';
import { $Error } from './error';
import { I$Node } from '../ast/_shared';
export declare class $Reference {
    readonly realm: Realm;
    readonly baseValue: $AnyObject | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined;
    readonly referencedName: $String;
    readonly strict: $Boolean;
    readonly thisValue: $AnyObject | $Boolean | $String | $Symbol | $Number | $Undefined;
    readonly '<$Reference>': unknown;
    get isAbrupt(): false;
    constructor(realm: Realm, baseValue: $AnyObject | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined, referencedName: $String, strict: $Boolean, thisValue: $AnyObject | $Boolean | $String | $Symbol | $Number | $Undefined);
    enrichWith(ctx: ExecutionContext, node: I$Node): this;
    GetBase(): $AnyObject | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined;
    GetReferencedName(): $String;
    IsStrictReference(): $Boolean;
    HasPrimitiveBase(): $Boolean;
    IsPropertyReference(): $Boolean;
    IsUnresolvableReference(): $Boolean;
    IsSuperReference(): $Boolean;
    GetValue(ctx: ExecutionContext): $AnyNonEmpty;
    PutValue(ctx: ExecutionContext, W: $AnyNonEmpty): $Boolean | $Undefined | $Empty | $Error;
    GetThisValue(): $AnyObject | $Boolean | $String | $Symbol | $Number;
    InitializeReferencedBinding(ctx: ExecutionContext, W: $AnyNonEmpty): $Boolean | $Empty | $Error;
}
//# sourceMappingURL=reference.d.ts.map