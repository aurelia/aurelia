import { IBindingTargetAccessor, IBindingTargetObserver, IDOM, ILifecycle, IObserverLocator, ITargetAccessorLocator, ITargetObserverLocator } from '@aurelia/runtime';
export declare class TargetObserverLocator implements ITargetObserverLocator {
    private readonly dom;
    constructor(dom: IDOM);
    getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor;
    overridesAccessor(obj: Node, propertyName: string): boolean;
    handles(obj: unknown): boolean;
}
export declare class TargetAccessorLocator implements ITargetAccessorLocator {
    private readonly dom;
    constructor(dom: IDOM);
    getAccessor(lifecycle: ILifecycle, obj: Node, propertyName: string): IBindingTargetAccessor;
    handles(obj: Node): boolean;
}
//# sourceMappingURL=observer-locator.d.ts.map