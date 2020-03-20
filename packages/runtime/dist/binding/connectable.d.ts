import { Class, IServiceLocator } from '@aurelia/kernel';
import { IConnectable } from '../ast';
import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IProxySubscribable, ISubscribable, ISubscriber, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
export interface IPartialConnectableBinding extends IBinding, ISubscriber {
    observerLocator: IObserverLocator;
}
export interface IConnectableBinding extends IPartialConnectableBinding, IConnectable {
    id: number;
    observerSlots: number;
    version: number;
    addObserver(observer: ISubscribable | IProxySubscribable): void;
    unobserve(all?: boolean): void;
}
declare type DecoratableConnectable<TProto, TClass> = Class<TProto & Partial<IConnectableBinding> & IPartialConnectableBinding, TClass>;
declare type DecoratedConnectable<TProto, TClass> = Class<TProto & IConnectableBinding, TClass>;
declare function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export declare function connectable(): typeof connectableDecorator;
export declare namespace connectable {
    var assignIdTo: (instance: IConnectableBinding) => void;
}
export declare function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export declare namespace connectable {
    var assignIdTo: (instance: IConnectableBinding) => void;
}
export declare type MediatedBinding<K extends string> = {
    [key in K]: (newValue: unknown, previousValue: unknown, flags: LifecycleFlags) => void;
};
export interface BindingMediator<K extends string> extends IConnectableBinding {
}
export declare class BindingMediator<K extends string> implements IConnectableBinding {
    readonly key: K;
    readonly binding: MediatedBinding<K>;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    constructor(key: K, binding: MediatedBinding<K>, observerLocator: IObserverLocator, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty: typeof observeProperty;
    unobserve: typeof unobserve;
    addObserver: typeof addObserver;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
export {};
//# sourceMappingURL=connectable.d.ts.map