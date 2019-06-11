import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class DataAttributeAccessor implements IAccessor<string | null> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    readonly propertyKey: string;
    currentValue: string | null;
    oldValue: string | null;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=data-attribute-accessor.d.ts.map