import { IIndexable } from '@aurelia/kernel';
import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class ElementPropertyAccessor implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: Node, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=element-property-accessor.d.ts.map