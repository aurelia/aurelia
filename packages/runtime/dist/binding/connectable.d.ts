import { Decoratable, Decorated } from '@aurelia/kernel';
import { IBindingTargetObserver, IPropertySubscriber } from '../observation';
import { StrictAny } from './ast';
import { IBinding } from './binding';
import { IObserverLocator } from './observer-locator';
export interface IPartialConnectableBinding extends IBinding, IPropertySubscriber {
    observerLocator: IObserverLocator;
}
export interface IConnectableBinding extends IPartialConnectableBinding {
    observerSlots: number;
    version: number;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    addObserver(observer: IBindingTargetObserver): void;
    unobserve(all?: boolean): void;
}
declare type DecoratableConnectable = Decoratable<IConnectableBinding, IPartialConnectableBinding>;
declare type DecoratedConnectable = Decorated<IConnectableBinding, IPartialConnectableBinding>;
declare function connectableDecorator(target: DecoratableConnectable): DecoratedConnectable;
export declare function connectable(): typeof connectableDecorator;
export declare function connectable(target: DecoratableConnectable): DecoratedConnectable;
export {};
//# sourceMappingURL=connectable.d.ts.map