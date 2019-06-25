import { IServiceLocator } from '@aurelia/kernel';
import { AccessorOrObserver, BindingMode, IConnectableBinding, IForOfStatement, ILifecycle, IObserverLocator, IPartialConnectableBinding, IsBindingBehavior, IScope, LifecycleFlags, State } from '@aurelia/runtime';
export interface AttributeBinding extends IConnectableBinding {
}
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export declare class AttributeBinding implements IPartialConnectableBinding {
    id: number;
    $state: State;
    $lifecycle: ILifecycle;
    $scope: IScope;
    part?: string;
    locator: IServiceLocator;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    sourceExpression: IsBindingBehavior | IForOfStatement;
    target: Element;
    targetAttribute: string;
    /**
     * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
     */
    targetProperty: string;
    targetObserver: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    constructor(sourceExpression: IsBindingBehavior | IForOfStatement, target: Element, targetAttribute: string, targetKey: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
    connect(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute.d.ts.map