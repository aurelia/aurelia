import type { ITask } from '@aurelia/kernel';
import { AccessorType, IAccessor, IObservable, LifecycleFlags } from '../observation';

export class PropertyAccessor implements IAccessor {
  public task: ITask | null = null;
  // the only thing can be guaranteed is it's an object
  // even if this property accessor is used to access an element
  public type: AccessorType = AccessorType.Obj;

  public getValue(obj: object, key: string): unknown {
    return (obj as IObservable)[key];
  }

  public setValue(value: unknown, flags: LifecycleFlags, obj: object, key: string): void {
    (obj as IObservable)[key] = value;
  }
}

export const propertyAccessor = new PropertyAccessor();
