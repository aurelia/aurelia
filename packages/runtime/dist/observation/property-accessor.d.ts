import { AccessorType, LifecycleFlags } from '../observation.js';
import type { IAccessor } from '../observation.js';
export declare class PropertyAccessor implements IAccessor {
    [id: number]: number;
    type: AccessorType;
    getValue(obj: object, key: string): unknown;
    setValue(value: unknown, flags: LifecycleFlags, obj: object, key: string): void;
}
//# sourceMappingURL=property-accessor.d.ts.map