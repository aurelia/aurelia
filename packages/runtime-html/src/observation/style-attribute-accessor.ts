import {
  IAccessor,
  LifecycleFlags,
  IScheduler,
  ITask,
} from '@aurelia/runtime';
import { PLATFORM, kebabCase } from '@aurelia/kernel';

export class StyleAttributeAccessor implements IAccessor<unknown> {
  public currentValue: unknown = '';
  public oldValue: unknown = '';

  public readonly persistentFlags: LifecycleFlags;

  public styles: Record<string, number> = {};
  public version: number = 0;

  public hasChanges: boolean = false;
  public task: ITask | null = null;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public readonly obj: HTMLElement,
  ) {
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): string {
    return this.obj.style.cssText;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.flushChanges(flags);
    } else if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue && this.task === null) {
      this.task = this.scheduler.queueRenderTask(() => {
        this.flushChanges(flags);
        this.task = null;
      });
    }
  }

  private getStyleTuplesFromString(currentValue: string): [string, string][] {
    const styleTuples: [string, string][] = [];
    const rx = /\s*([\w-]+)\s*:\s*((?:(?:[\w-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^)]*)\),?|[^)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
    let pair: RegExpExecArray;
    let name: string;
    while ((pair = rx.exec(currentValue)!) !== null) {
      name = pair[1];
      if (name.length === 0) {
        continue;
      }
      styleTuples.push([name, pair[2]]);
    }
    return styleTuples;
  }

  private getStyleTuplesFromObject(currentValue: Record<string, unknown>): [string, string][] {
    let value: unknown;
    const styles: [string, string][] = [];
    for (const property in currentValue) {
      value = currentValue[property];
      if (value == null) {
        continue;
      }
      if (typeof value === 'string') {
        styles.push([kebabCase(property), value]);
        continue;
      }

      styles.push(...this.getStyleTuples(value));
    }

    return styles;
  }

  private getStyleTuplesFromArray(currentValue: unknown[]): [string, string][] {
    const len = currentValue.length;
    if (len > 0) {
      const styles: [string, string][] = [];
      for (let i = 0; i < len; ++i) {
        styles.push(...this.getStyleTuples(currentValue[i]));
      }
      return styles;
    }
    return PLATFORM.emptyArray;
  }

  private getStyleTuples(currentValue: unknown): [string, string][] {
    if (typeof currentValue === 'string') {
      return this.getStyleTuplesFromString(currentValue);
    }

    if (currentValue instanceof Array) {
      return this.getStyleTuplesFromArray(currentValue);
    }

    if (currentValue instanceof Object) {
      return this.getStyleTuplesFromObject(currentValue as Record<string, unknown>);
    }

    return PLATFORM.emptyArray;
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue } = this;
      this.oldValue = currentValue;
      const styles = this.styles;
      let style: string;
      let version = this.version;

      const styleTuples = this.getStyleTuples(currentValue);

      let tuple: [string, string];
      let name: string;
      let value: string;
      const len = styleTuples.length;
      for (let i = 0; i < len; ++i) {
        tuple = styleTuples[i];
        name = tuple[0];
        value = tuple[1];
        this.setProperty(name, value);
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
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      if (this.task !== null) {
        this.task.cancel();
      }
      this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
    }
    this.oldValue = this.currentValue = this.obj.style.cssText;
  }

  public unbind(flags: LifecycleFlags): void {
    if (this.task !== null) {
      this.task.cancel();
      this.task = null;
    }
  }
}
