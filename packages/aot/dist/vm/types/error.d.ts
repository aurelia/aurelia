import { CompletionTarget, CompletionType, $AnyNonError, PotentialNonEmptyCompletionType, $Any } from './_shared.js';
import { Realm, ExecutionContext } from '../realm.js';
import { I$Node } from '../ast/_shared.js';
export declare abstract class $Error<T extends Error = Error, N extends string = string> {
    readonly realm: Realm;
    readonly '<$Error>': unknown;
    readonly id: number;
    readonly IntrinsicName: N;
    readonly '[[Type]]': CompletionType.throw;
    readonly '[[Value]]': T;
    readonly '[[Target]]': CompletionTarget;
    get isAbrupt(): true;
    get isEmpty(): false;
    get isUndefined(): false;
    get isNull(): false;
    get isNil(): false;
    get isBoolean(): true;
    get isNumber(): false;
    get isString(): false;
    get isSymbol(): false;
    get isPrimitive(): true;
    get isObject(): false;
    get isArray(): false;
    get isProxy(): false;
    get isFunction(): false;
    get isBoundFunction(): false;
    get isTruthy(): T;
    get isFalsey(): T extends true ? false : true;
    get isSpeculative(): false;
    get hasValue(): true;
    get isList(): false;
    readonly nodeStack: I$Node[];
    ctx: ExecutionContext | null;
    stack: string;
    constructor(realm: Realm, err: T, intrinsicName: N);
    is(other: $AnyNonError): boolean;
    enrichWith(ctx: ExecutionContext, node: I$Node): this;
    [Symbol.toPrimitive](): string;
    [Symbol.toStringTag](): string;
    ToCompletion(type: PotentialNonEmptyCompletionType, target: CompletionTarget): this;
    GetValue(ctx: ExecutionContext): this;
    UpdateEmpty(value: $Any): this;
    ToObject(ctx: ExecutionContext): this;
    ToPropertyKey(ctx: ExecutionContext): this;
    ToLength(ctx: ExecutionContext): this;
    ToPrimitive(ctx: ExecutionContext): this;
    ToBoolean(ctx: ExecutionContext): this;
    ToNumber(ctx: ExecutionContext): this;
    ToInt32(ctx: ExecutionContext): this;
    ToUint32(ctx: ExecutionContext): this;
    ToInt16(ctx: ExecutionContext): this;
    ToUint16(ctx: ExecutionContext): this;
    ToInt8(ctx: ExecutionContext): this;
    ToUint8(ctx: ExecutionContext): this;
    ToUint8Clamp(ctx: ExecutionContext): this;
    ToString(ctx: ExecutionContext): this;
}
export declare class $SyntaxError extends $Error<SyntaxError, 'SyntaxError'> {
    constructor(realm: Realm, message?: string | undefined);
}
export declare class $TypeError extends $Error<TypeError, 'TypeError'> {
    constructor(realm: Realm, message?: string | undefined);
}
export declare class $ReferenceError extends $Error<ReferenceError, 'ReferenceError'> {
    constructor(realm: Realm, message?: string | undefined);
}
export declare class $RangeError extends $Error<RangeError, 'RangeError'> {
    constructor(realm: Realm, message?: string | undefined);
}
export declare class $URIError extends $Error<URIError, 'URIError'> {
    constructor(realm: Realm, message?: string | undefined);
}
//# sourceMappingURL=error.d.ts.map