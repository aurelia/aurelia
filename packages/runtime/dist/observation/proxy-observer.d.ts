import { LifecycleFlags } from '../flags';
import { IPropertyObserver, IProxy, IProxyObserver, IProxySubscriber, ISubscriber, PropertyObserver } from '../observation';
declare type Indexable = Record<string | number, unknown>;
export interface ProxySubscriberCollection extends IPropertyObserver<Indexable, string> {
}
export declare class ProxySubscriberCollection<TObj extends object = object> implements ProxySubscriberCollection<TObj> {
    inBatch: boolean;
    readonly proxy: IProxy<TObj>;
    readonly raw: TObj;
    readonly key: string | number;
    constructor(proxy: IProxy<TObj>, raw: TObj, key: string | number);
    setValue(value: unknown, flags?: LifecycleFlags): void;
    getValue(): unknown;
    flushBatch(flags: LifecycleFlags): void;
}
export interface ProxyObserver<TObj extends object = object> extends IProxyObserver<TObj> {
}
export declare class ProxyObserver<TObj extends object = object> implements ProxyObserver<TObj> {
    readonly proxy: IProxy<TObj>;
    readonly raw: TObj;
    private readonly subscribers;
    constructor(obj: TObj);
    static getProxyOrSelf<T extends object = object>(obj: T): T;
    static getRawIfProxy<T extends object = object>(obj: T): T;
    static getOrCreate<T extends object>(obj: T): IProxyObserver<T>;
    static getOrCreate<T extends object>(obj: T, key: string | number): PropertyObserver;
    static isProxy<T extends object>(obj: T & {
        $raw?: T;
    }): obj is T & {
        $raw: T;
        $observer: ProxyObserver<T>;
    };
    get(target: TObj, p: string | number, receiver?: unknown): unknown;
    set(target: TObj, p: string | number, value: unknown, receiver?: unknown): boolean;
    deleteProperty(target: TObj, p: string | number): boolean;
    defineProperty(target: TObj, p: string | number, attributes: PropertyDescriptor): boolean;
    apply(target: TObj, thisArg: unknown, argArray?: ArrayLike<unknown>): unknown;
    subscribe(subscriber: IProxySubscriber): void;
    subscribe(subscriber: ISubscriber, key: string | number): void;
    unsubscribe(subscriber: IProxySubscriber): void;
    unsubscribe(subscriber: ISubscriber, key: string | number): void;
    private callPropertySubscribers;
}
export {};
//# sourceMappingURL=proxy-observer.d.ts.map