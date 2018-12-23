import { Class, IIndexable } from '@aurelia/kernel';
import { IBindingTargetObserver, IPropertySubscriber, LifecycleFlags } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IBinding } from './binding';
export interface IPartialConnectableBinding extends IBinding, IPropertySubscriber {
    observerLocator: IObserverLocator;
}
export interface IConnectableBinding extends IPartialConnectableBinding {
    $nextConnect?: IConnectableBinding;
    $nextPatch?: IConnectableBinding;
    observerSlots: number;
    version: number;
    observeProperty(obj: IIndexable, propertyName: string): void;
    addObserver(observer: IBindingTargetObserver): void;
    unobserve(all?: boolean): void;
    connect(flags: LifecycleFlags): void;
    patch(flags: LifecycleFlags): void;
}
declare type DecoratableConnectable<TProto, TClass> = Class<TProto & Partial<IConnectableBinding> & IPartialConnectableBinding, TClass>;
declare type DecoratedConnectable<TProto, TClass> = Class<TProto & IConnectableBinding, TClass>;
declare function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export declare function connectable(): typeof connectableDecorator;
export declare function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export {};
//# sourceMappingURL=connectable.d.ts.map