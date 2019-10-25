import { IAccessor, LifecycleFlags, IScheduler, ITask } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor<unknown> {
    readonly scheduler: IScheduler;
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    readonly doNotCache: true;
    nameIndex: Record<string, number>;
    version: number;
    hasChanges: boolean;
    isActive: boolean;
    task: ITask | null;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, obj: HTMLElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    private splitClassString;
    private getClassesToAdd;
    private addClassesAndUpdateIndex;
}
//# sourceMappingURL=class-attribute-accessor.d.ts.map