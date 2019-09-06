import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class StyleAttributeAccessor implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    styles: Record<string, number>;
    version: number;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: HTMLElement);
    getValue(): string;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    private getStyleTuplesFromString;
    private getStyleTuplesFromObject;
    private getStyleTuplesFromArray;
    private getStyleTuples;
    flushRAF(flags: LifecycleFlags): void;
    setProperty(style: string, value: string): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map