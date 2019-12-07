import { IServiceLocator } from '@aurelia/kernel';
import { AccessorOrObserver, BindingMode, IConnectableBinding, IForOfStatement, IObserverLocator, IPartialConnectableBinding, IsBindingBehavior, IScope, LifecycleFlags, State, IScheduler, INode } from '@aurelia/runtime';
export interface AttributeBinding extends IConnectableBinding {
}
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export declare class AttributeBinding implements IPartialConnectableBinding {
    sourceExpression: IsBindingBehavior | IForOfStatement;
    targetAttribute: string;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    interceptor: this;
    id: number;
    $state: State;
    $scheduler: IScheduler;
    $scope: IScope;
    part?: string;
    /**
     * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
     */
    targetObserver: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    target: Element;
    constructor(sourceExpression: IsBindingBehavior | IForOfStatement, target: INode, targetAttribute: string, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
    connect(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute.d.ts.map