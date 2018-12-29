import { IBindingTargetAccessor } from '../observation';
export interface PropertyAccessor extends IBindingTargetAccessor<Object, string> {
}
export declare class PropertyAccessor implements PropertyAccessor {
    obj: Object;
    propertyKey: string;
    constructor(obj: Object, propertyKey: string);
    getValue(): unknown;
    setValue(value: unknown): void;
}
//# sourceMappingURL=property-accessor.d.ts.map