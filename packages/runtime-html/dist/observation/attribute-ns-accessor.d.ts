import { IBindingTargetAccessor, ILifecycle } from '@aurelia/runtime';
export interface AttributeNSAccessor extends IBindingTargetAccessor<HTMLElement, string, string> {
}
export declare class AttributeNSAccessor implements AttributeNSAccessor {
    readonly isDOMObserver: true;
    attributeName: string;
    currentValue: string;
    defaultValue: string;
    lifecycle: ILifecycle;
    obj: HTMLElement;
    oldValue: string;
    propertyKey: string;
    namespace: string;
    constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string, attributeName: string, namespace: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map