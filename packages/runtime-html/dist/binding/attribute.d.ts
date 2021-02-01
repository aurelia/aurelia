import { IServiceLocator } from '@aurelia/kernel';
import { BindingMode, LifecycleFlags, IObserver } from '@aurelia/runtime';
import { IPlatform } from '../platform.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import type { IConnectableBinding, ForOfStatement, IObserverLocator, IPartialConnectableBinding, IsBindingBehavior, ITask, Scope } from '@aurelia/runtime';
import type { INode } from '../dom.js';
export interface AttributeBinding extends IConnectableBinding {
}
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export declare class AttributeBinding implements IPartialConnectableBinding {
    sourceExpression: IsBindingBehavior | ForOfStatement;
    targetAttribute: string;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    interceptor: this;
    id: number;
    isBound: boolean;
    $platform: IPlatform;
    $scope: Scope;
    $hostScope: Scope | null;
    projection?: CustomElementDefinition;
    task: ITask | null;
    private targetSubscriber;
    /**
     * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
     */
    targetObserver: IObserver;
    persistentFlags: LifecycleFlags;
    target: Element;
    value: unknown;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: INode, targetAttribute: string, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, projection?: CustomElementDefinition): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute.d.ts.map