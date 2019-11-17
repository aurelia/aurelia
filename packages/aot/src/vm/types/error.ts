import { nextValueId, CompletionTarget, CompletionType } from './_shared';
import { Realm } from '../realm';

export abstract class $Error<T extends Error = Error, N extends string = string> {
  public readonly '<$Error>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: N;

  public readonly '[[Type]]': CompletionType.throw = CompletionType.throw;
  public readonly '[[Value]]': T;
  public readonly '[[Target]]': CompletionTarget;

  public get isAbrupt(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    err: T,
    intrinsicName: N,
    // TODO: add contextual info
  ) {
    this.IntrinsicName = intrinsicName;
    this['[[Value]]'] = err;
    this['[[Target]]'] = realm['[[Intrinsics]]'].empty;
  }
}

export class $SyntaxError extends $Error<SyntaxError, 'SyntaxError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new SyntaxError(message), 'SyntaxError');
  }
}

export class $TypeError extends $Error<TypeError, 'TypeError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new TypeError(message), 'TypeError');
  }
}

export class $ReferenceError extends $Error<ReferenceError, 'ReferenceError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new ReferenceError(message), 'ReferenceError');
  }
}

export class $RangeError extends $Error<RangeError, 'RangeError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new RangeError(message), 'RangeError');
  }
}

export class $URIError extends $Error<URIError, 'URIError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new URIError(message), 'URIError');
  }
}
