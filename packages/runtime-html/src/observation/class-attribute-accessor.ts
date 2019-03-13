import { IBindingTargetAccessor, ILifecycle, INode, targetObserver } from '@aurelia/runtime';

export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {}

@targetObserver('')
export class ClassAttributeAccessor implements ClassAttributeAccessor {
  public readonly isDOMObserver: true;
  public currentValue!: string;
  public doNotCache: true;
  public lifecycle: ILifecycle;
  public nameIndex: object;
  public obj: HTMLElement;
  public oldValue!: string;
  public version: number;

  constructor(lifecycle: ILifecycle, obj: HTMLElement) {
    this.isDOMObserver = true;
    this.doNotCache = true;
    this.lifecycle = lifecycle;
    this.nameIndex = null!;
    this.obj = obj;
    this.version = 0;
  }

  public getValue(): string {
    return this.currentValue;
  }

  public setValueCore(newValue: string): void {
    const nameIndex: Record<string, number> = this.nameIndex as Record<string, number> || {};
    let version = this.version;
    let names: string[];
    let name: string;

    // Add the classes, tracking the version at which they were added.
    if (newValue.length) {
      const node = this.obj;
      names = newValue.split(/\s+/);
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
