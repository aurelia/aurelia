import { LifecycleFlags } from '../flags';
import { IPropertySubscriber, IProxy, IProxyObserver, IProxySubscriber, MutationKind } from '../observation';
export interface ProxySubscriberCollection<TObj extends object = object> extends IProxyObserver<TObj, MutationKind.instance> {
}
export declare class ProxySubscriberCollection<TObj extends object = object> implements ProxySubscriberCollection<TObj> {
    readonly proxy: IProxy<TObj>;
    readonly raw: TObj;
    readonly key: PropertyKey;
    constructor(proxy: IProxy<TObj>, raw: TObj, key: PropertyKey);
    setValue(value: unknown, flags?: LifecycleFlags): void;
    getValue(): unknown;
}
export interface ProxyObserver<TObj extends object = object> extends IProxyObserver<TObj, MutationKind.proxy> {
}
export declare class ProxyObserver<TObj extends object = object> implements ProxyObserver<TObj> {
    readonly proxy: IProxy<TObj>;
    readonly raw: TObj;
    private readonly subscribers;
    constructor(obj: TObj);
    static getProxyOrSelf<T extends object = object>(obj: T): T;
    static getRawIfProxy<T extends object = object>(obj: T): T;
    static getOrCreate<T extends object>(obj: T & {
        $raw?: T;
        $observer?: ProxyObserver<T>;
    }): IProxyObserver<T, MutationKind.proxy>;
    static getOrCreate<T extends object>(obj: T & {
        $raw?: T;
        $observer?: ProxyObserver<T>;
    }, key: PropertyKey): IProxyObserver<T, MutationKind.instance>;
    static isProxy<T extends object>(obj: T & {
        $raw?: T;
    }): obj is T & {
        $raw: T;
        $observer: ProxyObserver<T>;
    };
    get(target: TObj, p: PropertyKey, receiver?: unknown): unknown;
    set(target: TObj, p: PropertyKey, value: unknown, receiver?: unknown): boolean;
    deleteProperty(target: TObj, p: PropertyKey): boolean;
    defineProperty(target: TObj, p: PropertyKey, attributes: PropertyDescriptor): boolean;
    apply(target: TObj, thisArg: unknown, argArray?: unknown[]): unknown;
    subscribe(subscriber: IProxySubscriber): void;
    subscribe(subscriber: IPropertySubscriber, key: PropertyKey): void;
    unsubscribe(subscriber: IProxySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber, key: PropertyKey): void;
    private callPropertySubscribers;
}
//# sourceMappingURL=proxy-observer.d.ts.map