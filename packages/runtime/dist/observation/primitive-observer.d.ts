import { Primitive } from '@aurelia/kernel';
import { IAccessor, ISubscribable, AccessorType } from '../observation';
import { ITask } from '@aurelia/scheduler';
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