import {
  IAccessor,
  ILifecycle,
  LifecycleFlags,
  Priority,
} from '@aurelia/runtime';

export class DataAttributeAccessor implements IAccessor<string | null> {
  public readonly lifecycle: ILifecycle;

  public readonly obj: HTMLElement;
  public readonly propertyKey: string;
  public currentValue: string | null;
  public oldValue: string | null;

  public hasChanges: boolean;

  constructor(
    lifecycle: ILifecycle,
    obj: HTMLElement,
    propertyKey: string,
  ) {
    this.lifecycle = lifecycle;

    this.obj = obj;
    this.propertyKey = propertyKey;
    this.currentValue = null;
    this.oldValue = null;

    this.hasChanges = false;
  }

  public getValue(): string | null {
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if (this.lifecycle.isFlushingRAF || (flags & LifecycleFlags.fromBind) > 0) {
      this.flushRAF(flags);
    }
  }

  public flushRAF(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue } = this;
      this.oldValue = currentValue;
      if (currentValue == void 0) {
        this.obj.removeAttribute(this.propertyKey);
      } else {
        this.obj.setAttribute(this.propertyKey, currentValue);
      }
    }
  }

  public bind(flags: LifecycleFlags): void {
    this.lifecycle.enqueueRAF(this.flushRAF, this, Priority.propagate);
    this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
  }

  public unbind(flags: LifecycleFlags): void {
    this.lifecycle.dequeueRAF(this.flushRAF, this);
  }
}
