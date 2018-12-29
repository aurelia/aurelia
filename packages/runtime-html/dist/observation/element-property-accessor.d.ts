import { IBindingTargetAccessor, ILifecycle } from '@aurelia/runtime';
export interface ElementPropertyAccessor extends IBindingTargetAccessor<object, string> {
}
export declare class ElementPropertyAccessor implements ElementPropertyAccessor {
    readonly isDOMObserver: true;
    lifecycle: ILifecycle;
    obj: object;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: object, propertyKey: string);
    getValue(): unknown;
    setValueCore(value: unknown): void;
}
//# sourceMappingURL=element-property-accessor.d.ts.map