import { IContainer, IResolver } from '@aurelia/kernel';
import { IBindingTargetAccessor, IBindingTargetObserver, ILifecycle, IObserverLocator, ITargetAccessorLocator, ITargetObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { ISVGAnalyzer } from './svg-analyzer';
export declare class TargetObserverLocator implements ITargetObserverLocator {
    private readonly platform;
    private readonly lifecycle;
    private readonly svgAnalyzer;
    constructor(platform: IPlatform, lifecycle: ILifecycle, svgAnalyzer: ISVGAnalyzer);
    static register(container: IContainer): IResolver<ITargetObserverLocator>;
    getObserver(flags: LifecycleFlags, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor | null;
    overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare class TargetAccessorLocator implements ITargetAccessorLocator {
    private readonly platform;
    private readonly svgAnalyzer;
    constructor(platform: IPlatform, svgAnalyzer: ISVGAnalyzer);
    static register(container: IContainer): IResolver<ITargetAccessorLocator>;
    getAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: Node): boolean;
}
//# sourceMappingURL=observer-locator.d.ts.map