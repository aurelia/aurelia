import { BindingInterceptor, IBindingBehaviorExpression, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior } from './validation-controller';
/**
 * Validation triggers.
 */
export declare enum ValidationTrigger {
    /**
     * Manual validation.  Use the controller's `validate()` and  `reset()` methods to validate all bindings.
     */
    manual = "manual",
    /**
     * Validate the binding when the binding's target element fires a DOM "blur" event.
     */
    blur = "blur",
    /**
     * Validate the binding when it updates the model due to a change in the source property (usually triggered by some change in view)
     */
    change = "change",
    /**
     * Validate the binding when the binding's target element fires a DOM "blur" event and when it updates the model due to a change in the view.
     */
    changeOrBlur = "changeOrBlur"
}
/**
 * Binding behavior. Indicates the bound property should be validated.
 */
export declare class ValidateBindingBehavior extends BindingInterceptor {
    readonly binding: BindingWithBehavior;
    private propertyBinding;
    private target;
    private trigger;
    private controller;
    private isChangeTrigger;
    private readonly scheduler;
    private readonly defaultTrigger;
    private readonly connectedExpressions;
    private scope;
    private readonly triggerMediator;
    private readonly controllerMediator;
    private readonly rulesMediator;
    constructor(binding: BindingWithBehavior, expr: IBindingBehaviorExpression);
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleEvent(_event: Event): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void;
    $unbind(flags: LifecycleFlags): void;
    handleTriggerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void;
    handleControllerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void;
    handleRulesChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void;
    private processBindingExpressionArgs;
    private validateBinding;
    private processDelta;
    private ensureTrigger;
    private ensureController;
    private ensureRules;
    private setPropertyBinding;
    private setTarget;
}
//# sourceMappingURL=validate-binding-behavior.d.ts.map