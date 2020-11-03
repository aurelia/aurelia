import { IAccessor, LifecycleFlags, ITask, AccessorType } from '@aurelia/runtime';
import { INode } from '../dom.js';

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export class DataAttributeAccessor implements IAccessor<string | null> {
  public readonly obj: HTMLElement;
  public currentValue: string | null = null;
  public oldValue: string | null = null;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;
  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public constructor(
    flags: LifecycleFlags,
    obj: INode,
    public readonly propertyKey: string,
  ) {
    this.obj = obj as HTMLElement;
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): string | null {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.noTargetObserverQueue) === 0) {
      this.flushChanges(flags);
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      this.oldValue = currentValue;
      if (currentValue == void 0) {
        this.obj.removeAttribute(this.propertyKey);
      } else {
        this.obj.setAttribute(this.propertyKey, currentValue);
      }
    }
  }

  public bind(flags: LifecycleFlags): void {
    this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
  }
}
