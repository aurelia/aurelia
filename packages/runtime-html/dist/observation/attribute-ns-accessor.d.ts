import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class AttributeNSAccessor implements IAccessor<string | null> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    readonly propertyKey: string;
    currentValue: string | null;
    oldValue: string | null;
    readonly namespace: string;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string, namespace: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map