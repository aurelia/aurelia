import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IBindingTargetAccessor } from '../observation';
import { patchProperties } from './patch-properties';

export interface PropertyAccessor extends IBindingTargetAccessor<Record<string, unknown>, string> {}
const slice = Array.prototype.slice;

export class PropertyAccessor implements PropertyAccessor {
  public obj: Record<string, unknown>;
  public propertyKey: string;

  constructor(obj: Record<string, unknown>, propertyKey: string) {
    if (Tracer.enabled) { Tracer.enter('PropertyAccessor', 'constructor', slice.call(arguments)); }
    this.obj = obj;
    this.propertyKey = propertyKey;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(value: unknown): void {
    this.obj[this.propertyKey] = value;
  }

  public $patch(flags: LifecycleFlags): void {
    patchProperties(this.obj[this.propertyKey], flags);
  }
}
