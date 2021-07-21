import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { emptyArray, kebabCase } from '@aurelia/kernel';
import type { IAccessor } from '@aurelia/runtime';

const customPropertyPrefix: string = '--';

export class StyleAttributeAccessor implements IAccessor {
  public value: unknown = '';
  public oldValue: unknown = '';

  public styles: Record<string, number> = {};
  public version: number = 0;

  public hasChanges: boolean = false;
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public constructor(
    public readonly obj: HTMLElement,
  ) {
  }

  public getValue(): string {
    return this.obj.style.cssText;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.value = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.noFlush) === 0) {
      this.flushChanges(flags);
    }
  }

  private _getStyleTuplesFromString(currentValue: string): [string, string][] {
    const styleTuples: [string, string][] = [];
    const urlRegexTester = /url\([^)]+$/;
    let offset = 0;
    let currentChunk = '';
    let nextSplit: number;
    let indexOfColon: number;
    let attribute: string;
    let value: string;
    while (offset < currentValue.length) {
      nextSplit = currentValue.indexOf(';', offset);
      if (nextSplit === -1) { nextSplit = currentValue.length; }
      currentChunk += currentValue.substring(offset, nextSplit);
      offset = nextSplit + 1;

      // Make sure we never split a url so advance to next
      if (urlRegexTester.test(currentChunk)) {
        currentChunk += ';';
        continue;
      }

      indexOfColon = currentChunk.indexOf(':');
      attribute = currentChunk.substring(0, indexOfColon).trim();
      value = currentChunk.substring(indexOfColon + 1).trim();
      styleTuples.push([attribute, value]);
      currentChunk = '';
    }

    return styleTuples;
  }

  private _getStyleTuplesFromObject(currentValue: Record<string, unknown>): [string, string][] {
    let value: unknown;
    let property: string;
    const styles: [string, string][] = [];
    for (property in currentValue) {
      value = currentValue[property];
      if (value == null) {
        continue;
      }
      if (typeof value === 'string') {
        // Custom properties should not be tampered with
        if (property.startsWith(customPropertyPrefix)) {
          styles.push([property, value]);
          continue;
        }
        styles.push([kebabCase(property), value]);
        continue;
      }

      styles.push(...this._getStyleTuples(value));
    }

    return styles;
  }

  private _getStyleTuplesFromArray(currentValue: unknown[]): [string, string][] {
    const len = currentValue.length;
    if (len > 0) {
      const styles: [string, string][] = [];
      for (let i = 0; i < len; ++i) {
        styles.push(...this._getStyleTuples(currentValue[i]));
      }
      return styles;
    }
    return emptyArray;
  }

  private _getStyleTuples(currentValue: unknown): [string, string][] {
    if (typeof currentValue === 'string') {
      return this._getStyleTuplesFromString(currentValue);
    }

    if (currentValue instanceof Array) {
      return this._getStyleTuplesFromArray(currentValue);
    }

    if (currentValue instanceof Object) {
      return this._getStyleTuplesFromObject(currentValue as Record<string, unknown>);
    }

    return emptyArray;
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.value;
      const styles = this.styles;
      const styleTuples = this._getStyleTuples(currentValue);

      let style: string;
      let version = this.version;

      this.oldValue = currentValue;

      let tuple: [string, string];
      let name: string;
      let value: string;
      let i = 0;
      const len = styleTuples.length;
      for (; i < len; ++i) {
        tuple = styleTuples[i];
        name = tuple[0];
        value = tuple[1];
        this.setProperty(name, value);
        styles[name] = version;
      }

      this.styles = styles;
      this.version += 1;
      if (version === 0) {
        return;
      }

      version -= 1;
      for (style in styles) {
        if (!Object.prototype.hasOwnProperty.call(styles, style) || styles[style] !== version) {
          continue;
        }
        this.obj.style.removeProperty(style);
      }
    }
  }

  public setProperty(style: string, value: string): void {
    let priority = '';

    if (value != null && typeof value.indexOf === 'function' && value.includes('!important')) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.obj.style.setProperty(style, value, priority);
  }

  public bind(flags: LifecycleFlags): void {
    this.value = this.oldValue = this.obj.style.cssText;
  }
}
