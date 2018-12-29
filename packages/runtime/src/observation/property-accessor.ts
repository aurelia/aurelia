import { IBindingTargetAccessor } from '../observation';

export interface PropertyAccessor extends IBindingTargetAccessor<Object, string> {}

export class PropertyAccessor implements PropertyAccessor {
  public obj: Object;
  public propertyKey: string;

  constructor(obj: Object, propertyKey: string) {
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
