import {
  IAccessor,
  LifecycleFlags,
  IScheduler,
  ITask,
  INode,
  AccessorType,
} from '@aurelia/runtime';

/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export class AttributeNSAccessor implements IAccessor<string | null> {
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
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    obj: INode,
    public readonly propertyKey: string,
    public readonly namespace: string,
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
    if (this.task != null) {
      this.task.cancel();
      this.task = null;
    }
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    this.flushChanges(flags);
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      this.oldValue = currentValue;
      if (currentValue == void 0) {
        this.obj.removeAttributeNS(this.namespace, this.propertyKey);
      } else {
        this.obj.setAttributeNS(this.namespace, this.propertyKey, currentValue);
      }
    }
  }

  public bind(flags: LifecycleFlags): void {
    this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
  }
}
