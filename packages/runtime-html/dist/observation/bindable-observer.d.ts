import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IObserver, ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
import type { IController } from '../templating/controller';
export interface BindableObserver extends IObserver, ISubscriberCollection {
}
export declare class BindableObserver {
    readonly obj: IIndexable;
    readonly propertyKey: string;
    private readonly set;
    readonly $controller: IController;
    get type(): AccessorType;
    currentValue: unknown;
    oldValue: unknown;
    observing: boolean;
    private readonly cb;
    private readonly cbAll;
    private readonly hasCb;
    private readonly hasCbAll;
    private readonly hasSetter;
    constructor(obj: IIndexable, propertyKey: string, cbName: string, set: InterceptorFunc, $controller: IController);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    private createGetterSetter;
}
//# sourceMappingURL=bindable-observer.d.ts.map