import { atNone } from '../observation';
import type { AccessorType, IAccessor, IObservable } from '../observation';

export class PropertyAccessor implements IAccessor {
  // the only thing can be guaranteed is it's an object
  // even if this property accessor is used to access an element
  public type: AccessorType = atNone;

  public getValue(obj: object, key: string): unknown {
    return (obj as IObservable)[key];
  }

  public setValue(value: unknown, obj: object, key: string): void {
    (obj as IObservable)[key] = value;
  }
}
