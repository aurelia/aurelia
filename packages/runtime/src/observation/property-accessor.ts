import { LifecycleFlags } from '../flags';
import { IBindingTargetAccessor } from '../observation';

export interface PropertyAccessor extends IBindingTargetAccessor<Record<string, unknown>, string> {}

export class PropertyAccessor implements PropertyAccessor {
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
