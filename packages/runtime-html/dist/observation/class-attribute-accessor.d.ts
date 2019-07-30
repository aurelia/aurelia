import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    readonly doNotCache: true;
    nameIndex: Record<string, number>;
    version: number;
    hasChanges: boolean;
    isActive: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: HTMLElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    private getClassesToAdd;
    private addClassesAndUpdateIndex;
}
//# sourceMappingURL=class-attribute-accessor.d.ts.map