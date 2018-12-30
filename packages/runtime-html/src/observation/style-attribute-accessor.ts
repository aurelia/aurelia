import { IBindingTargetAccessor, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface StyleAttributeAccessor extends IBindingTargetAccessor<HTMLElement, 'style', string | Record<string, string>> {}

@targetObserver()
export class StyleAttributeAccessor implements StyleAttributeAccessor {
  public readonly isDOMObserver: true;
  public currentValue: string | Record<string, string>;
  public defaultValue: string | Record<string, string>;
  public lifecycle: ILifecycle;
  public obj: HTMLElement;
  public oldValue: string | Record<string, string>;
  public styles: object;
  public version: number;

  constructor(lifecycle: ILifecycle, obj: HTMLElement) {
    this.isDOMObserver = true;
    this.oldValue = this.currentValue = obj.style.cssText;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.styles = null;
    this.version = 0;
  }

  public getValue(): string {
    return this.obj.style.cssText;
  }

  public _setProperty(style: string, value: string): void {
    let priority = '';

    if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.obj.style.setProperty(style, value, priority);
  }

  public setValueCore(newValue: string | Record<string, string>): void {
    const styles = this.styles || {};
    let style: string;
    let version = this.version;

    if (newValue !== null) {
      if (newValue instanceof Object) {
        let value: string;
        for (style in (newValue as Object)) {
          if (newValue.hasOwnProperty(style)) {
            value = newValue[style];
            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
            styles[style] = version;
            this._setProperty(style, value);
          }
        }
      } else if ((newValue as string).length) {
        const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
        let pair: RegExpExecArray;
        while ((pair = rx.exec(newValue)) !== null) {
          style = pair[1];
          if (!style) { continue; }

          styles[style] = version;
          this._setProperty(style, pair[2]);
        }
      }
    }

    this.styles = styles;
    this.version += 1;
    if (version === 0) {
      return;
    }

    version -= 1;
    for (style in styles) {
      if (!styles.hasOwnProperty(style) || styles[style] !== version) {
        continue;
      }
      this.obj.style.removeProperty(style);
    }
  }
}
