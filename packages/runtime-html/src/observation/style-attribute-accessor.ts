import {
  IAccessor,
  ILifecycle,
  LifecycleFlags,
  Priority,
} from '@aurelia/runtime';

export class StyleAttributeAccessor implements IAccessor<unknown> {
  public readonly lifecycle: ILifecycle;

  public readonly obj: HTMLElement;
  public currentValue: string | Record<string, string>;
  public oldValue: string | Record<string, string>;

  public styles: Record<string, number>;
  public version: number;

  public hasChanges: boolean;

  constructor(
    lifecycle: ILifecycle,
    obj: HTMLElement,
  ) {
    this.lifecycle = lifecycle;

    this.obj = obj;
    this.currentValue = '';
    this.oldValue = '';

    this.styles = {};
    this.version = 0;

    this.hasChanges = false;
  }

  public getValue(): string {
    return this.obj.style.cssText;
  }

  public setValue(newValue: string | Record<string, string>, flags: LifecycleFlags): void {
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
      const styles = this.styles;
      let style: string;
      let version = this.version;

      if (currentValue instanceof Object) {
        let value: string;
        for (style in currentValue) {
          if (currentValue.hasOwnProperty(style)) {
            value = currentValue[style];
            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
            styles[style] = version;
            this.setProperty(style, value);
          }
        }
      } else if (typeof currentValue === 'string') {
        const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
        let pair: RegExpExecArray;
        while ((pair = rx.exec(currentValue)!) != null) {
          style = pair[1];
          if (!style) { continue; }

          styles[style] = version;
          this.setProperty(style, pair[2]);
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

  public setProperty(style: string, value: string): void {
    let priority = '';

    if (value != null && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.obj.style.setProperty(style, value, priority);
  }

  public bind(flags: LifecycleFlags): void {
    this.lifecycle.enqueueRAF(this.flushRAF, this, Priority.propagate);
    this.oldValue = this.currentValue = this.obj.style.cssText;
  }

  public unbind(flags: LifecycleFlags): void {
    this.lifecycle.dequeueRAF(this.flushRAF, this);
  }
}
