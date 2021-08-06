import { Primitive } from '@aurelia/kernel';
import { AccessorType } from '../observation.js';

import type { IAccessor, ISubscribable } from '../observation.js';

export class PrimitiveObserver implements IAccessor, ISubscribable {
  public get doNotCache(): true { return true; }
  public type: AccessorType = AccessorType.None;
  /** @internal */
  private readonly _obj: Primitive;
  /** @internal */
  private readonly _key: PropertyKey;

  public constructor(
    obj: Primitive,
    key: PropertyKey,
  ) {
    this._obj = obj;
    this._key = key;
  }

  public getValue(): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    return (this._obj as any)[this._key];
  }
  public setValue(): void { /* do nothing */ }
  public subscribe(): void { /* do nothing */ }
  public unsubscribe(): void { /* do nothing */ }
}
