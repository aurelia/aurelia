import { Primitive } from '@aurelia/kernel';
import { IAccessor, ISubscribable, MutationKind } from '../observation';
export declare class PrimitiveObserver implements IAccessor, ISubscribable<MutationKind.instance> {
    getValue: () => undefined | number;
    setValue: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    dispose: () => void;
    doNotCache: boolean;
    obj: Primitive;
    constructor(obj: Primitive, propertyKey: PropertyKey);
    private getStringLength;
    private returnUndefined;
}
//# sourceMappingURL=primitive-observer.d.ts.map