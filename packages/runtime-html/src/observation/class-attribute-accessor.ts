import { emptyArray } from '@aurelia/kernel';
import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import { isString } from '../utilities.js';

import type { IAccessor } from '@aurelia/runtime';

export class ClassAttributeAccessor implements IAccessor {
  public get doNotCache(): true { return true; }
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public value: unknown = '';
  /** @internal */
  private _oldValue: unknown = '';

  /** @internal */
  private _nameIndex: Record<string, number> = {};
  /** @internal */
  private _version: number = 0;

  /** @internal */
  private _hasChanges: boolean = false;

  public constructor(
    public readonly obj: HTMLElement,
  ) {
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.value;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.value = newValue;
    this._hasChanges = newValue !== this._oldValue;
    if ((flags & LifecycleFlags.noFlush) === 0) {
      this._flushChanges();
    }
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      const currentValue = this.value;
      const nameIndex = this._nameIndex;
      const classesToAdd = getClassesToAdd(currentValue as any);
      let version = this._version;
      this._oldValue = currentValue;

      // Get strings split on a space not including empties
      if (classesToAdd.length > 0) {
        this._addClassesAndUpdateIndex(classesToAdd);
      }

      this._version += 1;

      // First call to setValue?  We're done.
      if (version === 0) {
        return;
      }

      // Remove classes from previous version.
      version -= 1;
      for (const name in nameIndex) {
        if (!Object.prototype.hasOwnProperty.call(nameIndex, name) || nameIndex[name] !== version) {
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

  /** @internal */
  private _addClassesAndUpdateIndex(classes: string[]) {
    const node = this.obj;
    const ii = classes.length;
    let i = 0;
    let className: string;
    for (; i < ii; i++) {
      className = classes[i];
      if (className.length === 0) {
        continue;
      }
      this._nameIndex[className] = this._version;
      node.classList.add(className);
    }
  }
}

export function getClassesToAdd(object: Record<string, unknown> | [] | string): string[] {
  if (isString(object)) {
    return splitClassString(object);
  }
  if (typeof object !== 'object') {
    return emptyArray;
  }

  if (object instanceof Array) {
    const len = object.length;
    if (len > 0) {
      const classes: string[] = [];
      let i = 0;
      for (; len > i; ++i) {
        classes.push(...getClassesToAdd(object[i]));
      }
      return classes;
    } else {
      return emptyArray;
    }
  }

  const classes: string[] = [];
  let property: string;
  for (property in object) {
    // Let non typical values also evaluate true so disable bool check
    if (Boolean(object[property])) {
      // We must do this in case object property has a space in the name which results in two classes
      if (property.includes(' ')) {
        classes.push(...splitClassString(property));
      } else {
        classes.push(property);
      }
    }
  }
  return classes;
}

function splitClassString(classString: string): string[] {
  const matches = classString.match(/\S+/g);
  if (matches === null) {
    return emptyArray;
  }
  return matches;
}
