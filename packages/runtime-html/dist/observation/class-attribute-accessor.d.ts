import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor<string> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    currentValue: string;
    oldValue: string;
    readonly doNotCache: true;
    nameIndex: Record<string, number>;
    version: number;
    hasChanges: boolean;
    isActive: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, obj: HTMLElement);
    getValue(): string;
    setValue(newValue: string, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=class-attribute-accessor.d.ts.map