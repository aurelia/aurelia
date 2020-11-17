import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import type { IAccessor } from '@aurelia/runtime';
export declare class StyleAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    styles: Record<string, number>;
    version: number;
    hasChanges: boolean;
    type: AccessorType;
    constructor(obj: HTMLElement);
    getValue(): string;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    private getStyleTuplesFromString;
    private getStyleTuplesFromObject;
    private getStyleTuplesFromArray;
    private getStyleTuples;
    flushChanges(flags: LifecycleFlags): void;
    setProperty(style: string, value: string): void;
    bind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map