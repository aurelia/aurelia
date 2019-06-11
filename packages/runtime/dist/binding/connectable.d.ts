import { Class } from '@aurelia/kernel';
import { IConnectable } from '../ast';
import { IBinding } from '../lifecycle';
import { IPatchable, IPropertySubscriber, ISubscribable, MutationKind } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
export interface IPartialConnectableBinding extends IBinding, IPropertySubscriber {
    observerLocator: IObserverLocator;
}
export interface IConnectableBinding extends IPartialConnectableBinding, IConnectable, IPatchable {
    id: string;
    $nextConnect?: IConnectableBinding;
    observerSlots: number;
    version: number;
    addObserver(observer: ISubscribable<MutationKind.instance | MutationKind.proxy>): void;
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
export {};
//# sourceMappingURL=connectable.d.ts.map