import { LifecycleFlags } from '../flags';
import { IBindingTargetAccessor, ObserverType } from '../observation';

export interface PropertyAccessor extends IBindingTargetAccessor<Record<string, unknown>, string> {}

export class PropertyAccessor implements PropertyAccessor {
  // the only thing can be guaranteed is it's an object
  // even if this property accessor is used to access an element
  public type: ObserverType = ObserverType.Obj;

  public constructor(
    public obj: Record<string, unknown>,
    public propertyKey: string,
  ) {
    if (
      obj.$observers !== void 0
      && (obj.$observers as Record<string, unknown>)[propertyKey] !== void 0
      && ((obj.$observers as Record<string, unknown>)[propertyKey] as IBindingTargetAccessor).setValue !== void 0
    ) {
      this.setValue = this.setValueDirect;
    }
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(value: unknown, flags?: LifecycleFlags): void {
    this.obj[this.propertyKey] = value;
  }

  private setValueDirect(value: unknown, flags: LifecycleFlags): void {
    ((this.obj.$observers as Record<string, unknown>)[this.propertyKey] as IBindingTargetAccessor).setValue(value, flags);
  }
}
