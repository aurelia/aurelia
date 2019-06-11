import { IBindingTargetAccessor, ILifecycle } from '@aurelia/runtime';
export interface DataAttributeAccessor extends IBindingTargetAccessor<Node, string, string> {
}
export declare class DataAttributeAccessor implements DataAttributeAccessor {
    readonly isDOMObserver: true;
    currentValue: string;
    defaultValue: string;
    lifecycle: ILifecycle;
    obj: HTMLElement;
    oldValue: string;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string);
    getValue(): string | null;
    setValueCore(newValue: string): void;
}
//# sourceMappingURL=data-attribute-accessor.d.ts.map