import { Primitive } from '@aurelia/kernel';
import { AccessorType } from '../observation.js';
import type { IAccessor, ISubscribable } from '../observation.js';
export declare class PrimitiveObserver implements IAccessor, ISubscribable {
    readonly obj: Primitive;
    readonly propertyKey: PropertyKey;
    get doNotCache(): true;
    type: AccessorType;
    constructor(obj: Primitive, propertyKey: PropertyKey);
    getValue(): unknown;
    setValue(): void;
    subscribe(): void;
    unsubscribe(): void;
}
//# sourceMappingURL=primitive-observer.d.ts.map