import { IAccessor, LifecycleFlags, IScheduler, ITask, INode } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor {
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
    constructor(scheduler: IScheduler, flags: LifecycleFlags, obj: INode);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    private addClassesAndUpdateIndex;
}
export declare function getClassesToAdd(object: Record<string, unknown> | [] | string): string[];
//# sourceMappingURL=class-attribute-accessor.d.ts.map