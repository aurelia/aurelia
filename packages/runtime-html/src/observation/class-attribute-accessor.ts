import {
  IAccessor,
  ILifecycle,
  LifecycleFlags,
  Priority,
} from '@aurelia/runtime';
import { PLATFORM } from '@aurelia/kernel';

export class ClassAttributeAccessor implements IAccessor<unknown> {
  public readonly lifecycle: ILifecycle;

  public readonly obj: HTMLElement;
  public currentValue: unknown;
  public oldValue: unknown;

  public readonly persistentFlags: LifecycleFlags;

  public readonly doNotCache: true;
  public nameIndex: Record<string, number>;
  public version: number;

  public hasChanges: boolean;
  public isActive: boolean;
  public priority: Priority;

  constructor(
    lifecycle: ILifecycle,
    flags: LifecycleFlags,
    obj: HTMLElement,
  ) {
    this.lifecycle = lifecycle;

    this.obj = obj;
    this.currentValue = '';
    this.oldValue = '';

    this.doNotCache = true;
    this.nameIndex = {};
    this.version = 0;

    this.isActive = false;
    this.hasChanges = false;
    this.priority = Priority.propagate;
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.flushRAF(flags);
    } else if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
    }
  }
  public flushRAF(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue, nameIndex } = this;
      let { version } = this;
      this.oldValue = currentValue;

      const classesToAdd = this.getClassesToAdd(currentValue as any);

      // Get strings split on a space not including empties
      if (classesToAdd.length > 0) {
        this.addClassesAndUpdateIndex(classesToAdd);
      }

      this.version += 1;

      // First call to setValue?  We're done.
      if (version === 0) {
        return;
      }

      // Remove classes from previous version.
      version -= 1;
      for (const name in nameIndex) {
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
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
    }
  }

  public unbind(flags: LifecycleFlags): void {
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.dequeueRAF(this.flushRAF, this);
    }
  }

  private splitClassString(classString: string): string[] {
    const matches = classString.match(/\S+/g);
    if (matches === null) {
      return PLATFORM.emptyArray;
    }
    return matches;
  }

  private getClassesToAdd(object: Record<string, unknown> | [] | string): string[] {
    if (typeof object === 'string') {
      return this.splitClassString(object);
    }

    if (object instanceof Array) {
      const len = object.length;
      if (len > 0) {
        const classes: string[] = [];
        for (let i = 0; i < len; ++i) {
          classes.push(...this.getClassesToAdd(object[i]));
        }
        return classes;
      } else {
        return PLATFORM.emptyArray;
      }
    } else if (object instanceof Object) {
      const classes: string[] = [];
      for (const property in object) {
        // Let non typical values also evaluate true so disable bool check
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, no-extra-boolean-cast
        if (!!object[property]) {
          // We must do this in case object property has a space in the name which results in two classes
          if (property.indexOf(' ') >= 0) {
            classes.push(...this.splitClassString(property));
          } else {
            classes.push(property);
          }
        }
      }
      return classes;
    }
    return PLATFORM.emptyArray;
  }

  private addClassesAndUpdateIndex(classes: string[]) {
    const node = this.obj;
    for (let i = 0, length = classes.length; i < length; i++) {
      const className = classes[i];
      if (!className.length) {
        continue;
      }
      this.nameIndex[className] = this.version;
      node.classList.add(className);
    }
  }
}
