import { IContainer, ILogger } from '@aurelia/kernel';
import { IActionHandler, IStore, IStoreSubscriber } from './interfaces';
export declare class Store<T extends object> implements IStore<T> {
    static register(c: IContainer): void;
    constructor(initialState: T | null, reducers: IActionHandler<T>[], logger: ILogger);
    subscribe(subscriber: IStoreSubscriber<T>): void;
    unsubscribe(subscriber: IStoreSubscriber<T>): void;
    getState(): T;
    dispatch(type: unknown, ...params: any[]): void | Promise<void>;
}
//# sourceMappingURL=store.d.ts.map