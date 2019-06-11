import { IBindingTargetAccessor, ILifecycle, INode } from '@aurelia/runtime';
export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class ClassAttributeAccessor implements ClassAttributeAccessor {
    readonly isDOMObserver: true;
    currentValue: string;
    doNotCache: true;
    lifecycle: ILifecycle;
    nameIndex: object;
    obj: HTMLElement;
    oldValue: string;
    version: number;
    constructor(lifecycle: ILifecycle, obj: HTMLElement);
    getValue(): string;
    setValueCore(newValue: string): void;
}
//# sourceMappingURL=class-attribute-accessor.d.ts.map