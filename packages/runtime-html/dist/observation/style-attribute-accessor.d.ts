import { IAccessor, LifecycleFlags, ITask, AccessorType } from '@aurelia/runtime';
import { INode } from '../dom';
export declare class StyleAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    styles: Record<string, number>;
    version: number;
    hasChanges: boolean;
    task: ITask | null;
    type: AccessorType;
    constructor(flags: LifecycleFlags, obj: INode);
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