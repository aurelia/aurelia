import { IContainer, IFactory, Constructable, Transformer, Key, IServiceLocator } from '@aurelia/kernel';
import { BindingBehaviorExpression, IExpressionParser, LifecycleFlags } from '@aurelia/runtime';
import { PropertyAccessor, PropertyRule, ValidationResult, IValidator, ValidateInstruction, IValidateable } from '@aurelia/validation';
import type { Scope } from '@aurelia/runtime';
import { IPlatform, PropertyBinding } from '@aurelia/runtime-html';
export declare type BindingWithBehavior = PropertyBinding & {
    sourceExpression: BindingBehaviorExpression;
    target: Element | object;
};
export declare const enum ValidateEventKind {
    validate = "validate",
    reset = "reset"
}
/**
 * The result of a call to the validation controller's validate method.
 */
export declare class ControllerValidateResult {
    valid: boolean;
    results: ValidationResult[];
    instruction?: ValidateInstruction<IValidateable<any>> | undefined;
    /**
     * @param {boolean} valid - `true` if the validation passed, else `false`.
     * @param {ValidationResult[]} results - The validation result of every rule that was evaluated.
     * @param {ValidateInstruction} [instruction] - The instruction passed to the controller's validate method.
     */
    constructor(valid: boolean, results: ValidationResult[], instruction?: ValidateInstruction<IValidateable<any>> | undefined);
}
/**
 * Describes the validation result and target elements pair.
 * Used to notify the subscribers.
 */
export declare class ValidationResultTarget {
    result: ValidationResult;
    targets: Element[];
    constructor(result: ValidationResult, targets: Element[]);
}
/**
 * Describes the contract of the validation event.
 * Used to notify the subscribers.
 */
export declare class ValidationEvent {
    kind: ValidateEventKind;
    addedResults: ValidationResultTarget[];
    removedResults: ValidationResultTarget[];
    /**
     * @param {ValidateEventKind} kind - 'validate' or 'reset'.
     * @param {ValidationResultTarget[]} addedResults - new errors added.
     * @param {ValidationResultTarget[]} removedResults - old errors removed.
     * @memberof ValidationEvent
     */
    constructor(kind: ValidateEventKind, addedResults: ValidationResultTarget[], removedResults: ValidationResultTarget[]);
}
/**
 * Contract of the validation errors subscriber.
 * The subscriber should implement this interface.
 */
export interface ValidationResultsSubscriber {
    handleValidationEvent(event: ValidationEvent): void;
}
/**
 * Describes a binding information to the validation controller.
 * This is provided by the `validate` binding behavior during binding registration.
 */
export declare class BindingInfo {
    target: Element;
    scope: Scope;
    rules?: PropertyRule<IValidateable<any>, unknown>[] | undefined;
    propertyInfo: PropertyInfo | undefined;
    /**
     * @param {Element} target - The HTMLElement associated with the binding.
     * @param {Scope} scope - The binding scope.
     * @param {PropertyRule[]} [rules] - Rules bound to the binding behavior.
     * @param {(PropertyInfo | undefined)} [propertyInfo=void 0] - Information describing the associated property for the binding.
     * @memberof BindingInfo
     */
    constructor(target: Element, scope: Scope, rules?: PropertyRule<IValidateable<any>, unknown>[] | undefined, propertyInfo?: PropertyInfo | undefined);
}
declare class PropertyInfo {
    object: any;
    propertyName: string;
    constructor(object: any, propertyName: string);
}
export declare function getPropertyInfo(binding: BindingWithBehavior, info: BindingInfo, flags?: LifecycleFlags): PropertyInfo | undefined;
/**
 * Orchestrates validation.
 * Manages a set of bindings, subscribers and objects.
 */
export interface IValidationController {
    /**
     * Collection of registered property bindings.
     *
     * @type {Map<BindingWithBehavior, BindingInfo>}
     */
    readonly bindings: Map<BindingWithBehavior, BindingInfo>;
    /**
     * Objects that have been added to the controller instance (entity-style validation).
     *
     * @type {(Map<IValidateable, PropertyRule[] | undefined>)}
     */
    readonly objects: Map<IValidateable, PropertyRule[] | undefined>;
    /**
     * Collection of registered subscribers.
     *
     * @type {Set<ValidationResultsSubscriber>}
     */
    readonly subscribers: Set<ValidationResultsSubscriber>;
    /**
     * Current set of validation results.
     *
     * @type {ValidationResult[]}
     */
    readonly results: ValidationResult[];
    /**
     * The core validator, used to perform all validation.
     *
     * @type {IValidator}
     */
    validator: IValidator;
    /**
     * Whether the controller is currently validating.
     *
     * @type {boolean}
     */
    validating: boolean;
    /**
     * Validates and notifies the subscribers with the result.
     *
     * @param {ValidateInstruction<TObject>} [instruction] - If omitted, then all the registered objects and bindings will be validated.
     */
    validate<TObject extends IValidateable>(instruction?: ValidateInstruction<TObject>): Promise<ControllerValidateResult>;
    /**
     * Registers the given `object` with optional `rules` to the controller.
     * During `validate` without instruction, the object will be validated.
     * If the instruction consists of only an object tag, and the `object` is tagged also with the similar tag, it will be validated.
     */
    addObject(object: IValidateable, rules?: PropertyRule[]): void;
    /**
     * Deregisters the given `object` from the controller; i.e. during `validate` the `object` won't be validated.
     */
    removeObject(object: IValidateable): void;
    /**
     * Adds a manual error. This is never removed explicitly by validation controller when re-validating the errors.
     * The subscribers gets notified.
     */
    addError<TObject>(message: string, object: TObject, propertyName?: string | PropertyAccessor | null): ValidationResult;
    /**
     * Removes an error from the controller.
     * The subscribers gets notified.
     */
    removeError(result: ValidationResult): void;
    /**
     * Registers the `subscriber` to the controller.
     * The `subscriber` does not get notified of the previous errors.
     */
    addSubscriber(subscriber: ValidationResultsSubscriber): void;
    /**
     * Deregisters the `subscriber` from the controller.
     */
    removeSubscriber(subscriber: ValidationResultsSubscriber): void;
    /**
     * Resets the results for a property associated with a binding.
     */
    resetBinding(binding: BindingWithBehavior): void;
    /**
     * Revalidates the controller's current set of results.
     */
    revalidateErrors(): Promise<void>;
    /**
     * Resets any validation results.
     *
     * @param {ValidateInstruction} [instruction] - Instructions on what to reset. If omitted all rendered results will be removed.
     */
    reset(instruction?: ValidateInstruction): void;
}
export declare const IValidationController: import("@aurelia/kernel").InterfaceSymbol<IValidationController>;
export declare class ValidationController implements IValidationController {
    readonly validator: IValidator;
    private readonly parser;
    private readonly platform;
    private readonly locator;
    readonly bindings: Map<BindingWithBehavior, BindingInfo>;
    readonly subscribers: Set<ValidationResultsSubscriber>;
    readonly results: ValidationResult[];
    validating: boolean;
    /**
     * Elements related to validation results that have been rendered.
     *
     * @private
     * @type {Map<ValidationResult, Element[]>}
     */
    private readonly elements;
    readonly objects: Map<IValidateable, PropertyRule[] | undefined>;
    constructor(validator: IValidator, parser: IExpressionParser, platform: IPlatform, locator: IServiceLocator);
    addObject(object: IValidateable, rules?: PropertyRule[]): void;
    removeObject(object: IValidateable): void;
    addError<TObject>(message: string, object: TObject, propertyName?: string | PropertyAccessor): ValidationResult;
    removeError(result: ValidationResult): void;
    addSubscriber(subscriber: ValidationResultsSubscriber): void;
    removeSubscriber(subscriber: ValidationResultsSubscriber): void;
    registerBinding(binding: BindingWithBehavior, info: BindingInfo): void;
    unregisterBinding(binding: BindingWithBehavior): void;
    validate<TObject extends IValidateable>(instruction?: ValidateInstruction<TObject>): Promise<ControllerValidateResult>;
    reset(instruction?: ValidateInstruction): void;
    validateBinding(binding: BindingWithBehavior): Promise<void>;
    resetBinding(binding: BindingWithBehavior): void;
    revalidateErrors(): Promise<void>;
    /**
     * Interprets the instruction and returns a predicate that will identify relevant results in the list of rendered validation results.
     */
    private getInstructionPredicate;
    /**
     * Gets the elements associated with an object and propertyName (if any).
     */
    private getAssociatedElements;
    private processResultDelta;
}
export declare class ValidationControllerFactory implements IFactory<Constructable<IValidationController>> {
    Type: Constructable<IValidationController>;
    registerTransformer(_transformer: Transformer<Constructable<IValidationController>>): boolean;
    construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController;
}
export {};
//# sourceMappingURL=validation-controller.d.ts.map