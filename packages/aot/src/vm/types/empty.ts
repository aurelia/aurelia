/* eslint-disable */
import { nextValueId, $AnyNonError, ESType, $Primitive, PotentialEmptyCompletionType, CompletionTarget, CompletionType, $AnyNonEmpty, $Any } from './_shared';
import { Realm, ExecutionContext } from '../realm';
import { $Object } from './object';
import { $String } from './string';
import { $Number } from './number';
import { $Boolean } from './boolean';
import { $TypeError } from './error';
import { $SourceFile } from '../ast/modules';
import { $ComputedPropertyName } from '../ast/bindings';
import { $ContinueStatement, $BreakStatement } from '../ast/statements';
import { $FunctionDeclaration } from '../ast/functions';

export interface empty { '<empty>': unknown }
export const empty = Symbol('empty') as unknown as empty;
export class $Empty {
  public readonly '<$Empty>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'empty' = 'empty' as const;

  public '[[Type]]': PotentialEmptyCompletionType;
  public readonly '[[Value]]': empty = empty;
  public '[[Target]]': CompletionTarget;

  // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
  // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
  // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
  public get isAbrupt(): false { return (this['[[Type]]'] !== CompletionType.normal) as false; }

  public get Type(): $TypeError { return new $TypeError(this.realm); }
  public get isEmpty(): true { return true; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): false { return false; }
  public get isFalsey(): true { return true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    type: PotentialEmptyCompletionType = CompletionType.normal,
    target: CompletionTarget = realm['[[Intrinsics]]'].empty,
    public readonly sourceNode: $SourceFile | $ComputedPropertyName | $ContinueStatement | $BreakStatement | $FunctionDeclaration | null = null,
  ) {
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
  }

  public is(other: $AnyNonError): other is $Empty {
    return other instanceof $Empty;
  }

  public ToCompletion(
    type: PotentialEmptyCompletionType,
    target: CompletionTarget,
  ): this {
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-updateempty
  public UpdateEmpty(value: $Any): typeof value { // Can't use generics here due to "expression produces a type union that is too complex to represent" :(
    // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
    // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
    // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
    return value.ToCompletion(this['[[Type]]'] as CompletionType.normal, this['[[Target]]']);
  }

  public ToObject(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToPropertyKey(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToLength(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToPrimitive(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToBoolean(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToNumber(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public ToString(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }

  public GetValue(
    ctx: ExecutionContext,
  ): $TypeError {
    return new $TypeError(ctx.Realm);
  }
}
