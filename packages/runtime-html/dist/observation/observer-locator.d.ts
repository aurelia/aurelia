import { IContainer, InjectArray, IResolver } from '@aurelia/kernel';
import { IBindingTargetAccessor, IBindingTargetObserver, IDOM, ILifecycle, IObserverLocator, ITargetAccessorLocator, ITargetObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { ISVGAnalyzer } from './svg-analyzer';
export declare class TargetObserverLocator implements ITargetObserverLocator {
    static readonly inject: InjectArray;
    private readonly dom;
    private readonly svgAnalyzer;
    constructor(dom: IDOM, svgAnalyzer: ISVGAnalyzer);
    static register(container: IContainer): IResolver<ITargetObserverLocator>;
    getObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor;
    overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare class TargetAccessorLocator implements ITargetAccessorLocator {
    static readonly inject: InjectArray;
    private readonly dom;
    private readonly svgAnalyzer;
    constructor(dom: IDOM, svgAnalyzer: ISVGAnalyzer);
    static register(container: IContainer): IResolver<ITargetAccessorLocator>;
    getAccessor(flags: LifecycleFlags, lifecycle: ILifecycle, obj: Node, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: Node): boolean;
}
//# sourceMappingURL=observer-locator.d.ts.map