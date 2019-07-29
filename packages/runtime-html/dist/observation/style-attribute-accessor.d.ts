import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class StyleAttributeAccessor implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    currentValue: string | Record<string, string>;
    oldValue: string | Record<string, string>;
    readonly persistentFlags: LifecycleFlags;
    styles: Record<string, number>;
    version: number;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: HTMLElement);
    getValue(): string;
    setValue(newValue: string | Record<string, string>, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    setProperty(style: string, value: string): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map