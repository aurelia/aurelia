import { IServiceLocator } from '@aurelia/kernel';
import { AccessorOrObserver, BindingMode, IBinding, IConnectableBinding, IForOfStatement, ILifecycle, IObserverLocator, IPartialConnectableBinding, IsBindingBehavior, IScope, LifecycleFlags, State } from '@aurelia/runtime';
export interface AttributeBinding extends IConnectableBinding {
}
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export declare class AttributeBinding implements IPartialConnectableBinding {
    $nextBinding: IBinding;
    $prevBinding: IBinding;
    $state: State;
    $lifecycle: ILifecycle;
    $nextConnect: IConnectableBinding;
    $nextPatch: IConnectableBinding;
    $scope: IScope;
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
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    connect(flags: LifecycleFlags): void;
    patch(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute.d.ts.map