import { IServiceLocator } from '@aurelia/kernel';
import { IObserverLocatorBasedConnectable, Scope } from '@aurelia/runtime';
import { IBinding } from '@aurelia/runtime-html';
import { IStore, type IStoreSubscriber } from './interfaces';
/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateGetterBinding extends IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class StateGetterBinding implements IBinding, IStoreSubscriber<object> {
    isBound: boolean;
    private readonly $get;
    private readonly target;
    private readonly key;
    constructor(target: object, prop: PropertyKey, store: IStore<object>, getValue: (s: unknown) => unknown);
    private updateTarget;
    bind(_scope: Scope): void;
    unbind(): void;
    handleStateChange(state: object): void;
}
//# sourceMappingURL=state-getter-binding.d.ts.map