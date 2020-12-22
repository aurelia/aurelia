import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import type { IAccessor } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    [id: number]: number;
    currentValue: unknown;
    oldValue: unknown;
    readonly doNotCache: true;
    nameIndex: Record<string, number>;
    version: number;
    hasChanges: boolean;
    isActive: boolean;
    type: AccessorType;
    constructor(obj: HTMLElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    private addClassesAndUpdateIndex;
}
export declare function getClassesToAdd(object: Record<string, unknown> | [] | string): string[];
//# sourceMappingURL=class-attribute-accessor.d.ts.map