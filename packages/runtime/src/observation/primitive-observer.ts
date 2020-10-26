import { Primitive, ITask } from '@aurelia/kernel';
import { IAccessor, ISubscribable, AccessorType } from '../observation';

export class PrimitiveObserver implements IAccessor, ISubscribable {
  public get doNotCache(): true { return true; }
  public type: AccessorType = AccessorType.None;
  public task: ITask | null = null;

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
