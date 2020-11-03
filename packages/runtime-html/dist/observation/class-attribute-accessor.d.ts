import { IAccessor, LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { INode } from '../dom';
export declare class ClassAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    readonly doNotCache: true;
    nameIndex: Record<string, number>;
    version: number;
    hasChanges: boolean;
    isActive: boolean;
    type: AccessorType;
    constructor(flags: LifecycleFlags, obj: INode);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    private addClassesAndUpdateIndex;
}
export declare function getClassesToAdd(object: Record<string, unknown> | [] | string): string[];
//# sourceMappingURL=class-attribute-accessor.d.ts.map