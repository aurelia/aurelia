import { emptyArray } from '@aurelia/kernel';
import { atLayout, atNode, isArray, isString } from '../utilities';

import type { AccessorType, IAccessor } from '@aurelia/runtime';
import { mixinNoopSubscribable } from './observation-utils';

export class ClassAttributeAccessor implements IAccessor {
  static {
    mixinNoopSubscribable(ClassAttributeAccessor);
  }

  public get doNotCache(): true { return true; }
  public type: AccessorType = (atNode | atLayout) as AccessorType;

  /** @internal */
  private _value: unknown = '';

  /** @internal */
  private readonly _nameIndex: Record<string, number> = {};
  /** @internal */
  private _version: number = 0;

  public constructor(
    public readonly obj: HTMLElement,
  ) {
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(newValue: unknown): void {
    if (newValue !== this._value) {
      this._value = newValue;
      this._flushChanges();
    }
  }

  /** @internal */
  private _flushChanges(): void {
    const nameIndex = this._nameIndex;
    const version = ++this._version;
    const classList = this.obj.classList;
    const classesToAdd = getClassesToAdd(this._value as string | Record<string, unknown> | []);
    const ii = classesToAdd.length;
    let i = 0;
    let name: string;

    // Get strings split on a space not including empties
    if (ii > 0) {
      for (; i < ii; i++) {
        name = classesToAdd[i];
        if (name.length === 0) {
          continue;
        }
        nameIndex[name] = this._version;
        classList.add(name);
      }
    }

    // First call to setValue?  We're done.
    if (version === 1) {
      return;
    }

    for (name in nameIndex) {
      if (nameIndex[name] === version) {
        continue;
      }
      // TODO: this has the side-effect that classes already present which are added again,
      // will be removed if they're not present in the next update.
      // Better would be do have some configurability for this behavior, allowing the user to
      // decide whether initial classes always need to be kept, always removed, or something in between
      classList.remove(name);
    }
  }
}

function getClassesToAdd(object: Record<string, unknown> | [] | string): string[] {
  if (isString(object)) {
    return splitClassString(object);
  }
  if (typeof object !== 'object') {
    return emptyArray;
  }

  if (isArray(object)) {
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
    // eslint-disable-next-line no-extra-boolean-cast
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
