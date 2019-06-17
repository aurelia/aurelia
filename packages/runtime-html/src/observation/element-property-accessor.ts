import { IIndexable } from '@aurelia/kernel';
import {
  IAccessor,
  ILifecycle,
  LifecycleFlags,
  Priority,
} from '@aurelia/runtime';

export class ElementPropertyAccessor implements IAccessor<unknown> {
  public readonly lifecycle: ILifecycle;

  public readonly obj: Node & IIndexable;
  public readonly propertyKey: string;
  public currentValue: unknown;
  public oldValue: unknown;

  public hasChanges: boolean;
  public priority: Priority;

  constructor(
    lifecycle: ILifecycle,
    obj: Node,
    propertyKey: string,
  ) {
    this.lifecycle = lifecycle;

    this.obj = obj as Node & IIndexable;
    this.propertyKey = propertyKey;
    this.currentValue = void 0;
    this.oldValue = void 0;

    this.hasChanges = false;
    this.priority = Priority.propagate;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.fromBind) > 0) {
      this.flushRAF(flags);
    }
  }

  public flushRAF(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue } = this;
      this.oldValue = currentValue;
      this.obj[this.propertyKey] = currentValue;
    }
  }

  public bind(flags: LifecycleFlags): void {
    this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
    this.currentValue = this.oldValue = this.obj[this.propertyKey];
  }

  public unbind(flags: LifecycleFlags): void {
    this.lifecycle.dequeueRAF(this.flushRAF, this);
  }
}
