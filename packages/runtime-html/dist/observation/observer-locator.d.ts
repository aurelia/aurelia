import { IContainer, InterfaceSymbol, IResolver } from '@aurelia/kernel';
import { IBindingTargetAccessor, IBindingTargetObserver, IDOM, ILifecycle, IObserverLocator, ITargetAccessorLocator, ITargetObserverLocator, LifecycleFlags } from '@aurelia/runtime';
export declare class TargetObserverLocator implements ITargetObserverLocator {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    private readonly dom;
    constructor(dom: IDOM);
    static register(container: IContainer): IResolver<ITargetObserverLocator>;
    getObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor;
    overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare class TargetAccessorLocator implements ITargetAccessorLocator {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    private readonly dom;
    constructor(dom: IDOM);
    static register(container: IContainer): IResolver<ITargetAccessorLocator>;
    getAccessor(flags: LifecycleFlags, lifecycle: ILifecycle, obj: Node, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: Node): boolean;
}
//# sourceMappingURL=observer-locator.d.ts.map