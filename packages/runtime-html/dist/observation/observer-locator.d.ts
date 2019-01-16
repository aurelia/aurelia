import { IContainer, InterfaceSymbol, IResolver } from '@aurelia/kernel';
import { IBindingTargetAccessor, IBindingTargetObserver, IDOM, ILifecycle, IObserverLocator, ITargetAccessorLocator, ITargetObserverLocator } from '@aurelia/runtime';
export declare class TargetObserverLocator implements ITargetObserverLocator {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    private readonly dom;
    constructor(dom: IDOM);
    static register(container: IContainer): IResolver<ITargetObserverLocator>;
    getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor;
    overridesAccessor(obj: Node, propertyName: string): boolean;
    handles(obj: unknown): boolean;
}
export declare class TargetAccessorLocator implements ITargetAccessorLocator {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    private readonly dom;
    constructor(dom: IDOM);
    static register(container: IContainer): IResolver<ITargetAccessorLocator>;
    getAccessor(lifecycle: ILifecycle, obj: Node, propertyName: string): IBindingTargetAccessor;
    handles(obj: Node): boolean;
}
//# sourceMappingURL=observer-locator.d.ts.map