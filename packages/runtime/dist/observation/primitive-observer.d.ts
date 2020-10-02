import { Primitive } from '@aurelia/kernel';
import { IAccessor, ISubscribable, AccessorType } from '../observation';
import { ITask } from '@aurelia/scheduler';
export declare class PrimitiveObserver implements IAccessor, ISubscribable {
    getValue: () => undefined | number;
    setValue: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    dispose: () => void;
    doNotCache: boolean;
    obj: Primitive;
    type: AccessorType;
    task: ITask | null;
    constructor(obj: Primitive, propertyKey: PropertyKey);
    private getStringLength;
    private returnUndefined;
}
//# sourceMappingURL=primitive-observer.d.ts.map