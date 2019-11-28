import {
  nextValueId,
  $AnyNonError,
  Int32,
  Uint32,
  Int16,
  Uint16,
  Int8,
  Uint8,
  Uint8Clamp,
  PotentialNonEmptyCompletionType,
  CompletionTarget,
  CompletionType,
  $Any,
} from './_shared';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $String,
} from './string';
import {
  $Number,
} from './number';
import {
  $Boolean,
} from './boolean';
import {
  $TypeError,
  $Error,
} from './error';
import {
  $ExportDeclaration,
  $ExportSpecifier,
  $ESModule,
} from '../ast/modules';
import {
  $ClassDeclaration,
} from '../ast/classes';
import {
  $FunctionDeclaration,
} from '../ast/functions';
import {
  $VariableStatement,
} from '../ast/statements';
import {
  $NullLiteral,
} from '../ast/literals';
import {
  I$Node,
} from '../ast/_shared';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-null-type
export class $Null {
  public readonly '<$Null>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'null' = 'null' as const;

  public '[[Type]]': PotentialNonEmptyCompletionType;
  public readonly '[[Value]]': null = null;
  public '[[Target]]': CompletionTarget;

  // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
  // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
  // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
  public get isAbrupt(): false { return (this['[[Type]]'] !== CompletionType.normal) as false; }

  public get Type(): 'Null' { return 'Null'; }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): true { return true; }
  public get isNil(): true { return true; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): false { return false; }
  public get isFalsey(): true { return true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }
  public get isAmbiguous(): false { return false; }
  public get isList(): false { return false; }

  public readonly nodeStack: I$Node[] = [];
  public ctx: ExecutionContext | null = null;
  public stack: string = '';

  public constructor(
    public readonly realm: Realm,
    type: PotentialNonEmptyCompletionType = CompletionType.normal,
    target: CompletionTarget = realm['[[Intrinsics]]'].empty,
    public readonly sourceNode: $ExportDeclaration | $ExportSpecifier | $ClassDeclaration | $FunctionDeclaration | $VariableStatement | $ESModule | $NullLiteral | null = null,
  ) {
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
  }

  public is(other: $AnyNonError): other is $Null {
    return other instanceof $Null;
  }

  public enrichWith(ctx: ExecutionContext, node: I$Node): this {
    if (this['[[Type]]'] === CompletionType.throw) {
      this.nodeStack.push(node);
      if (this.ctx === null) {
        this.ctx = ctx;
        this.stack = ctx.Realm.stack.toString();
      }
    }
    return this;
  }

  public [Symbol.toPrimitive](): string {
    return String(this['[[Value]]']);
  }

  public [Symbol.toStringTag](): string {
    return Object.prototype.toString.call(this['[[Value]]']);
  }

  public ToCompletion(
    type: PotentialNonEmptyCompletionType,
    target: CompletionTarget,
  ): this {
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-updateempty
  // 6.2.3.4 UpdateEmpty ( completionRecord , value )
  public UpdateEmpty(value: $Any): this {
    // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
    // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
    return this;
    // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
  }

  public ToObject(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm, `${this} cannot be converted to object`);
  }

  public ToPropertyKey(
    ctx: ExecutionContext,
  ): $String {
    return this.ToString(ctx);
  }

  public ToLength(
    ctx: ExecutionContext,
  ): $Number {
    return this.ToNumber(ctx).ToLength(ctx);
  }

  public ToPrimitive(
    ctx: ExecutionContext,
  ): this {
    return this;
  }

  public ToBoolean(
    ctx: ExecutionContext,
  ): $Boolean {
    return new $Boolean(
      /* realm */this.realm,
      /* value */Boolean(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToNumber(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Number(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8Clamp(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToString(
    ctx: ExecutionContext,
  ): $String {
    return new $String(
      /* realm */this.realm,
      /* value */String(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public GetValue(
    ctx: ExecutionContext,
  ): this {
    return this;
  }
}
