import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import type { IAccessor } from '@aurelia/runtime';
export declare class StyleAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    type: AccessorType;
    value: unknown;
    styles: Record<string, number>;
    version: number;
    constructor(obj: HTMLElement);
    getValue(): string;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    private _getStyleTuplesFromString;
    private _getStyleTuplesFromObject;
    private _getStyleTuplesFromArray;
    private _getStyleTuples;
    setProperty(style: string, value: string): void;
    bind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map