import { Primitive, ITask } from '@aurelia/kernel';
import { IAccessor, ISubscribable, AccessorType } from '../observation';
export declare class PrimitiveObserver implements IAccessor, ISubscribable {
    readonly obj: Primitive;
    readonly propertyKey: PropertyKey;
    get doNotCache(): true;
    type: AccessorType;
    task: ITask | null;
    constructor(obj: Primitive, propertyKey: PropertyKey);
    getValue(): unknown;
    setValue(): void;
    subscribe(): void;
    unsubscribe(): void;
}
//# sourceMappingURL=primitive-observer.d.ts.map