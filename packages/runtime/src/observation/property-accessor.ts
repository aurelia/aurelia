import { LifecycleFlags } from '../flags';
import { IBindingTargetAccessor, getObserver, IAccessor } from '../observation';

export interface PropertyAccessor extends IBindingTargetAccessor<Record<string, unknown>, string> {}

export class PropertyAccessor implements PropertyAccessor {
  private readonly innerAccessor: IAccessor | null;

  public constructor(
    public obj: Record<string, unknown>,
    public propertyKey: string,
  ) {
    const inner = getObserver(obj, propertyKey);
    if (inner !== void 0 && inner.setValue !== void 0) {
      this.innerAccessor = inner;
    } else {
      this.innerAccessor = null;
    }
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(value: unknown, flags?: LifecycleFlags): void {
    if (this.innerAccessor === null) {
      this.obj[this.propertyKey] = value;
    } else {
      this.innerAccessor.setValue(value, flags!);
    }
  }
}
