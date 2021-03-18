import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IObserver, ISubscriber, ISubscriberCollection, IFlushable, IWithFlushQueue, FlushQueue } from '@aurelia/runtime';
import type { IController } from '../templating/controller';
export interface BindableObserver extends IObserver, ISubscriberCollection {
}
export declare class BindableObserver implements IFlushable, IWithFlushQueue {
    readonly obj: IIndexable;
    readonly propertyKey: string;
    private readonly set;
    readonly $controller: IController | null;
    get type(): AccessorType;
    currentValue: unknown;
    oldValue: unknown;
    observing: boolean;
    queue: FlushQueue;
    private readonly cb;
    private readonly cbAll;
    private readonly hasCb;
    private readonly hasCbAll;
    private readonly hasSetter;
    private f;
    constructor(obj: IIndexable, propertyKey: string, cbName: string, set: InterceptorFunc, $controller: IController | null);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    flush(): void;
    private createGetterSetter;
}
//# sourceMappingURL=bindable-observer.d.ts.map