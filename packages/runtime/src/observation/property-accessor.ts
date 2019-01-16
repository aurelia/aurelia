import { IBindingTargetAccessor } from '../observation';

export interface PropertyAccessor extends IBindingTargetAccessor<Record<string, unknown>, string> {}

export class PropertyAccessor implements PropertyAccessor {
  public obj: Record<string, unknown>;
  public propertyKey: string;

  constructor(obj: Record<string, unknown>, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(value: unknown): void {
    this.obj[this.propertyKey] = value;
  }
}
