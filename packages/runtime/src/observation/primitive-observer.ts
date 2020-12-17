import { Primitive } from '@aurelia/kernel';
import { AccessorType } from '../observation.js';

import type { IAccessor, ISubscribable } from '../observation.js';

export class PrimitiveObserver implements IAccessor, ISubscribable {
  /**
   * @internal
   */
  [id: number]: number;
  public get doNotCache(): true { return true; }
  public type: AccessorType = AccessorType.None;

  public constructor(
    public readonly obj: Primitive,
    public readonly propertyKey: PropertyKey,
  ) {}

  public getValue(): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    return (this.obj as any)[this.propertyKey];
  }
  public setValue(): void { /* do nothing */ }
  public subscribe(): void { /* do nothing */ }
  public unsubscribe(): void { /* do nothing */ }
}
