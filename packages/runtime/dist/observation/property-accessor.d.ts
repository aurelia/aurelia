import { AccessorType, LifecycleFlags } from '../observation.js';
import type { IAccessor } from '../observation.js';
export declare class PropertyAccessor implements IAccessor {
    type: AccessorType;
    getValue(obj: object, key: string): unknown;
    setValue(value: unknown, flags: LifecycleFlags, obj: object, key: string): void;
}
export declare const propertyAccessor: PropertyAccessor;
//# sourceMappingURL=property-accessor.d.ts.map