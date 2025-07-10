import { IContainer } from '@aurelia/kernel';
import { IStore, IStoreSubscriber, IStateMiddleware, MiddlewarePlacement } from './interfaces';
import { IDevToolsOptions } from './interfaces-devtools';
export declare class Store<T extends object, TAction = unknown> implements IStore<T> {
    static register(c: IContainer): void;
    constructor();
    subscribe(subscriber: IStoreSubscriber<T>): void;
    unsubscribe(subscriber: IStoreSubscriber<T>): void;
    registerMiddleware<S = any>(middleware: IStateMiddleware<T, S>, placement: MiddlewarePlacement, settings?: S): void;
    unregisterMiddleware(middleware: IStateMiddleware<T>): void;
    getState(): T;
    dispatch(action: TAction): void | Promise<void>;
    connectDevTools(options: IDevToolsOptions): void;
}
//# sourceMappingURL=store.d.ts.map