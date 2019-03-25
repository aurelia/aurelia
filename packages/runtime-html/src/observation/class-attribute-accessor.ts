import {
  IAccessor,
  ILifecycle,
  LifecycleFlags,
  Priority,
} from '@aurelia/runtime';

export class ClassAttributeAccessor implements IAccessor<string> {
  public readonly lifecycle: ILifecycle;

  public readonly obj: HTMLElement;
  public currentValue: string;
  public oldValue: string;

  public readonly doNotCache: true;
  public nameIndex: Record<string, number>;
  public version: number;

  public hasChanges: boolean;
  public isActive: boolean;

  constructor(lifecycle: ILifecycle, obj: HTMLElement) {
    this.lifecycle = lifecycle;

    this.obj = obj;
    this.currentValue = '';
    this.oldValue = '';

    this.doNotCache = true;
    this.nameIndex = {};
    this.version = 0;

    this.isActive = false;
    this.hasChanges = false;
  }

  public getValue(): string {
    return this.currentValue;
  }

  public setValue(newValue: string, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if (this.lifecycle.isFlushingRAF || (flags & LifecycleFlags.fromBind) > 0) {
      this.flushRAF(flags);
    }
  }

  public flushRAF(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue, nameIndex } = this;
      let { version } = this;

      this.oldValue = currentValue;
      let names: string[];
      let name: string;

      // Add the classes, tracking the version at which they were added.
      if (currentValue.length) {
        const node = this.obj;
        names = currentValue.split(/\s+/);
        for (let i = 0, length = names.length; i < length; i++) {
          name = names[i];
          if (!name.length) {
            continue;
          }
          nameIndex[name] = version;
          node.classList.add(name);
        }
      }

      // Update state variables.
      this.nameIndex = nameIndex;
      this.version += 1;

      // First call to setValue?  We're done.
      if (version === 0) {
        return;
      }

      // Remove classes from previous version.
      version -= 1;
      for (name in nameIndex) {
        if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
          continue;
        }

        // TODO: this has the side-effect that classes already present which are added again,
        // will be removed if they're not present in the next update.
        // Better would be do have some configurability for this behavior, allowing the user to
        // decide whether initial classes always need to be kept, always removed, or something in between
        this.obj.classList.remove(name);
      }
    }
  }

  public bind(flags: LifecycleFlags): void {
    this.lifecycle.enqueueRAF(this.flushRAF, this, Priority.propagate);
  }

  public unbind(flags: LifecycleFlags): void {
    this.lifecycle.dequeueRAF(this.flushRAF, this);
  }
}
