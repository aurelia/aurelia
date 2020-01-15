import {
  DI,
  IContainer,
  Registration,
} from '@aurelia/kernel';
import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  BindingBehaviorExpression,
  IExpressionParser,
  IScope,
  LifecycleFlags,
  PrimitiveLiteralExpression,
  IScheduler,
  ValueConverterExpression,
  PropertyBinding
} from '@aurelia/runtime';
import {
  IValidateable,
  parsePropertyName,
  PropertyAccessor,
  PropertyRule,
  ValidationResult,
  BaseValidationRule
} from './rule';
import { IValidator } from './validator';

export const VALIDATION_EVENT_CHANNEL = 'au:validation';

export type BindingWithBehavior = PropertyBinding & {
  sourceExpression: BindingBehaviorExpression;
  target: Element | object;
};
type ValidatableExpression = AccessScopeExpression | AccessMemberExpression | AccessKeyedExpression;
export type ValidateEventKind = 'validate' | 'reset';

/**
 * The result of a call to the validation controller's validate method.
 */
export class ControllerValidateResult {
  public constructor(
    /**
     * Whether validation passed.
     */
    public valid: boolean,

    /**
     * The validation result of every rule that was evaluated.
     */
    public results: ValidationResult[],

    /**
     * The instruction passed to the controller's validate method.
     */
    public instruction?: ValidateInstruction,
  ) { }
}

/**
 * Instructions for the validation controller's validate method.
 */
export class ValidateInstruction {
  public constructor(
    /**
     * The object to validate.
     */
    public object: IValidateable,

    /**
     * The property to validate. Optional.
     */
    public propertyName: string = (void 0)!,

    /**
     * The rules to validate. Optional.
     */
    public rules: PropertyRule[] = (void 0)!,
  ) { }
}

export class ValidationResultTarget {
  public constructor(
    public result: ValidationResult,
    public targets: Element[],
  ) { }
}

export class ValidationEvent {
  public constructor(
    public kind: ValidateEventKind,
    public addedErrors: ValidationResultTarget[],
    public removedErrors: ValidationResultTarget[],
  ) { }
}

export interface ValidationErrorsSubscriber {
  handleValidationEvent(event: ValidationEvent): void;
}

export interface IValidationController {
  validator: IValidator;
  readonly results: ValidationResult[];
  validating: boolean;
  validate(instruction?: ValidateInstruction): Promise<ControllerValidateResult>;
  addObject(object: IValidateable, rules?: PropertyRule[]): void;
  removeObject(object: IValidateable): void;
  addError<TObject>(message: string, object: TObject, propertyName?: string | PropertyAccessor | null): ValidationResult;
  removeError(result: ValidationResult): void;
  addSubscriber(subscriber: ValidationErrorsSubscriber): void;
  removeSubscriber(subscriber: ValidationErrorsSubscriber): void;
  registerBinding(binding: BindingWithBehavior, target: Element, scope: IScope, rules?: any): void;
  deregisterBinding(binding: BindingWithBehavior): void;
  validateBinding(binding: BindingWithBehavior): Promise<void>;
  resetBinding(binding: BindingWithBehavior): void;
  revalidateErrors(): Promise<void>;
  reset(instruction?: ValidateInstruction): void;
}
export const IValidationController = DI.createInterface<IValidationController>("IValidationController").noDefault();

/**
 * Orchestrates validation.
 * Manages a set of bindings, subscribers and objects.
 * Exposes the current list of validation results for binding purposes.
 */
export class ValidationController implements IValidationController {

  private readonly bindings: Map<BindingWithBehavior, BindingInfo> = new Map<BindingWithBehavior, BindingInfo>();
  private readonly subscribers: ValidationErrorsSubscriber[] = [];

  /**
   * Validation results that have been rendered by the controller.
   */
  public readonly results: ValidationResult[] = [];

  /**
   * Whether the controller is currently validating.
   */
  public validating: boolean = false;

  // Elements related to validation results that have been rendered.
  private readonly elements: Map<ValidationResult, Element[]> = new Map<ValidationResult, Element[]>();

  // Objects that have been added to the controller instance (entity-style validation).
  private readonly objects: Map<IValidateable, PropertyRule[] | undefined> = new Map<IValidateable, PropertyRule[] | undefined>();

  public constructor(
    @IValidator public readonly validator: IValidator,
    @IExpressionParser private readonly parser: IExpressionParser,
    @IScheduler private readonly scheduler: IScheduler,
  ) { }

  /**
   * Adds an object to the set of objects that should be validated when validate is called.
   *
   * @param {IValidateable} object - The object.
   * @param {PropertyRule[][]} [rules] - The rules. If rules aren't supplied the Validator implementation will lookup the rules.
   */
  public addObject(object: IValidateable, rules?: PropertyRule[]): void {
    this.objects.set(object, rules);
  }

  /**
   * Removes an object from the set of objects that should be validated when validate is called.
   */
  public removeObject(object: IValidateable): void {
    this.objects.delete(object);
    this.processResultDelta(
      'reset',
      this.results.filter(result => result.object === object),
      []);
  }

  /**
   * Adds and renders an error.
   */
  public addError<TObject>(
    message: string,
    object: TObject,
    propertyName?: string | PropertyAccessor
  ): ValidationResult {
    let resolvedPropertyName: string | number | undefined;
    if (propertyName === void 0) {
      resolvedPropertyName = propertyName;
    } else {
      [resolvedPropertyName] = parsePropertyName(propertyName, this.parser);
    }
    const result = new ValidationResult(false, message, resolvedPropertyName, object, undefined, undefined, true);
    this.processResultDelta('validate', [], [result]);
    return result;
  }

  /**
   * Removes and unrenders an error.
   */
  public removeError(result: ValidationResult) {
    if (this.results.includes(result)) {
      this.processResultDelta('reset', [result], []);
    }
  }

  public addSubscriber(subscriber: ValidationErrorsSubscriber) {
    this.subscribers.push(subscriber);
  }

  public removeSubscriber(subscriber: ValidationErrorsSubscriber) {
    this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
  }

  /**
   * Registers a binding with the controller.
   *
   * @param binding - The binding instance.
   * @param target - The DOM element.
   * @param rules - (optional) rules associated with the binding. Validator implementation specific.
   * @internal
   */
  public registerBinding(binding: BindingWithBehavior, target: Element, scope: IScope, rules?: any) {
    this.bindings.set(binding, { target, scope, rules, propertyInfo: void 0 });
  }

  /**
   * Unregisters a binding with the controller.
   *
   * @param binding - The binding instance.
   * @internal
   */
  public deregisterBinding(binding: BindingWithBehavior) {
    this.resetBinding(binding);
    this.bindings.delete(binding);
  }

  /**
   * Interprets the instruction and returns a predicate that will identify
   * relevant results in the list of rendered validation results.
   */
  private getInstructionPredicate(instruction?: ValidateInstruction): (result: ValidationResult) => boolean {
    if (instruction !== void 0) {
      const { object, propertyName, rules } = instruction;
      let predicate: (result: ValidationResult) => boolean;
      if (instruction.propertyName !== void 0) {
        predicate = x => x.object === object && x.propertyName === propertyName;
      } else {
        predicate = x => x.object === object;
      }
      if (rules !== void 0) {
        return x => predicate(x) && rules.find((rule: PropertyRule) => rule === x.propertyRule) !== undefined;
      }
      return predicate;
    } else {
      return () => true;
    }
  }

  private getPropertyInfo(binding: BindingWithBehavior, info: BindingInfo): PropertyInfo | undefined {
    let propertyInfo = info.propertyInfo;
    if (propertyInfo !== void 0) {
      return propertyInfo;
    }

    const scope = info.scope;
    let expression = binding.sourceExpression.expression as ValidatableExpression;
    const locator = binding.locator;
    let toCachePropertyName = true;
    let propertyName: string = "";
    while (expression !== void 0 && !(expression instanceof AccessScopeExpression)) {
      let memberName: string;
      switch (true) {
        case expression instanceof BindingBehaviorExpression || expression instanceof ValueConverterExpression:
          expression = (expression as unknown as (BindingBehaviorExpression | ValueConverterExpression)).expression as ValidatableExpression;
          continue;
        case expression instanceof AccessMemberExpression: {
          memberName = (expression as AccessMemberExpression).name;
          break;
        }
        case expression instanceof AccessKeyedExpression: {
          const keyExpr = (expression as AccessKeyedExpression).key;
          if (toCachePropertyName) {
            toCachePropertyName = keyExpr instanceof PrimitiveLiteralExpression;
          }
          memberName = `[${(keyExpr.evaluate(LifecycleFlags.none, scope, locator) as any).toString()}]`;
          break;
        }
        default:
          throw new Error(`Unknown expression of type ${expression?.constructor.name}`); // TODO use reporter/logger
      }
      const separator = propertyName.startsWith('[') ? '' : '.';
      propertyName = propertyName.length === 0 ? memberName : `${memberName}${separator}${propertyName}`;
      expression = expression.object as ValidatableExpression;
    }
    if (expression === void 0) {
      throw new Error('Unable to parse binding expression'); // TODO use reporter/logger
    }
    if (propertyName.length === 0) {
      propertyName = expression.name;
    }
    const object = expression.evaluate(LifecycleFlags.none, scope, locator);
    if (object === null || object === void 0) {
      return (void 0);
    }
    propertyInfo = { object, propertyName };
    // console.log(propertyInfo);
    if (toCachePropertyName) {
      info.propertyInfo = propertyInfo;
    }
    return propertyInfo;
  }

  /**
   * Validates and renders results.
   *
   * @param {ValidateInstruction} [instruction] - Instructions on what to validate. If undefined, all
   * objects and bindings will be validated.
   */
  public async validate(instruction?: ValidateInstruction): Promise<ControllerValidateResult> {
    let execute: () => Promise<ValidationResult[]>;
    if (instruction !== void 0) {
      // eslint-disable-next-line prefer-const
      let { object, propertyName, rules } = instruction;
      // if rules were not specified, check the object map.
      rules = rules ?? this.objects.get(object);
      execute = propertyName !== void 0
        ? async () => this.validator.validateProperty(object, propertyName!, rules)
        : async () => this.validator.validateObject(object, rules);
    } else {
      // validate all objects and bindings.
      execute = async () => {
        const promises: Promise<ValidationResult[]>[] = [];
        for (const [object, rules] of this.objects.entries()) {
          promises.push(this.validator.validateObject(object, rules));
        }
        for (const [binding, info] of this.bindings.entries()) {
          const propertyInfo = this.getPropertyInfo(binding, info);
          if (!propertyInfo || this.objects.has(propertyInfo.object)) {
            continue;
          }
          promises.push(this.validator.validateProperty(propertyInfo.object, propertyInfo.propertyName, info.rules));
        }
        const results = await Promise.all(promises);
        return results.reduce(
          (acc, reslutSet) => {
            acc.push(...reslutSet);
            return acc;
          },
          []);
      };
    }

    // Wait for any existing validation to finish, execute the instruction, render the results.
    this.validating = true;
    const task = this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      try {
        const newResults = await execute();
        const predicate = this.getInstructionPredicate(instruction);
        const oldResults = this.results.filter(predicate);
        this.processResultDelta('validate', oldResults, newResults);

        return new ControllerValidateResult(
          newResults.find(r => !r.valid) === void 0,
          newResults,
          instruction
        );
      } finally {
        this.validating = false;
      }
    });
    return task.result;
  }

  /**
   * Resets any rendered validation results (unrenders).
   *
   * @param {ValidateInstruction} [instruction] - Instructions on what to reset. If unspecified all rendered results
   * will be unrendered.
   */
  public reset(instruction?: ValidateInstruction) {
    const predicate = this.getInstructionPredicate(instruction);
    const oldResults = this.results.filter(predicate);
    this.processResultDelta('reset', oldResults, []);
  }

  /**
   * Gets the elements associated with an object and propertyName (if any).
   */
  private getAssociatedElements({ object, propertyName }: ValidationResult): Element[] {
    const elements: Element[] = [];
    for (const [binding, info] of this.bindings.entries()) {
      const propertyInfo = this.getPropertyInfo(binding, info);
      if (propertyInfo && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
        elements.push(info.target);
      }
    }
    return elements;
  }

  private processResultDelta(
    kind: ValidateEventKind,
    oldResults: ValidationResult[],
    newResults: ValidationResult[],
  ) {
    // prepare the instruction.
    const eventData: ValidationEvent = new ValidationEvent(kind, [], []);

    // create a shallow copy of newResults so we can mutate it without causing side-effects.
    newResults = newResults.slice(0);

    // create unrender instructions from the old results.
    for (const oldResult of oldResults) {
      // get the elements associated with the old result.
      const elements = this.elements.get(oldResult)!;

      // remove the old result from the element map.
      this.elements.delete(oldResult);

      // create the unrender instruction.
      eventData.removedErrors.push({ result: oldResult, targets: elements });

      // determine if there's a corresponding new result for the old result we are unrendering.
      const newResultIndex = newResults.findIndex(
        x => x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName);
      if (newResultIndex === -1) {
        // no corresponding new result... simple remove.
        this.results.splice(this.results.indexOf(oldResult), 1);
      } else {
        // there is a corresponding new result...
        const newResult = newResults.splice(newResultIndex, 1)[0];

        // get the elements that are associated with the new result.
        const elements = this.getAssociatedElements(newResult);
        this.elements.set(newResult, elements);

        // create a render instruction for the new result.
        eventData.addedErrors.push({ result: newResult, targets: elements });

        // do an in-place replacement of the old result with the new result.
        // this ensures any repeats bound to this.results will not thrash.
        this.results.splice(this.results.indexOf(oldResult), 1, newResult);
      }
    }

    // create render instructions from the remaining new results.
    for (const result of newResults) {
      const elements = this.getAssociatedElements(result);
      eventData.addedErrors.push({ result, targets: elements });
      this.elements.set(result, elements);
      this.results.push(result);
    }

    // render.
    for (const subscriber of this.subscribers) {
      subscriber.handleValidationEvent(eventData);
    }
  }

  /**
   * Validates the property associated with a binding.
   *
   * @internal
   */
  public async validateBinding(binding: BindingWithBehavior) {
    // if (!binding.isBound) { return; }
    const bindingInfo = this.bindings.get(binding);
    if (bindingInfo === void 0) {
      return;
    }
    const propertyInfo = this.getPropertyInfo(binding, bindingInfo);
    const rules = bindingInfo.rules;
    if (propertyInfo === void 0) {
      return;
    }
    const { object, propertyName } = propertyInfo;
    await this.validate(new ValidateInstruction(object, propertyName, rules));
  }

  /**
   * Resets the results for a property associated with a binding.
   */
  public resetBinding(binding: BindingWithBehavior) {
    const bindingInfo = this.bindings.get(binding);
    if (bindingInfo === void 0) { return; }

    const propertyInfo = this.getPropertyInfo(binding, bindingInfo);
    if (propertyInfo === void 0) { return; }

    bindingInfo.propertyInfo = void 0;
    const { object, propertyName } = propertyInfo;
    this.reset(new ValidateInstruction(object, propertyName));
  }

  /**
   * Revalidates the controller's current set of errors.
   */
  public async revalidateErrors() {
    const map = this.results
      .reduce(
        (acc, { isManual, object, propertyRule, rule, valid }) => {
          if (!valid && !isManual && propertyRule !== void 0 && object !== void 0 && rule !== void 0) {
            let value = acc.get(object);
            if (value === void 0) {
              value = new Map();
              acc.set(object, value);
            }
            let rules = value.get(propertyRule);
            if (rules === void 0) {
              rules = [];
              value.set(propertyRule, rules);
            }
            rules.push(rule);
          }
          return acc;
        },
        new Map<IValidateable, Map<PropertyRule, BaseValidationRule[]>>());

    const promises = [];
    for (const [object, innerMap] of map) {
      promises.push(
        this.validate(new ValidateInstruction(
          object,
          undefined,
          Array.from(innerMap)
            .map(([
              { validationRules, messageProvider, property },
              rules
            ]) => new PropertyRule(validationRules, messageProvider, property, [rules]))
        ))
      );
    }
    await Promise.all(promises);
  }
}

/**
 * Information related to an "& validate" decorated binding.
 */
interface BindingInfo {
  /**
   * The DOM element associated with the binding.
   */
  target: Element;
  scope: IScope;

  /**
   * The rules associated with the binding via the validate binding behavior's rules parameter.
   */
  rules?: PropertyRule[];

  /**
   * The object and property associated with the binding.
   */
  propertyInfo?: PropertyInfo;
}
interface PropertyInfo {
  object: any;
  propertyName: string;
}

export interface IValidationControllerFactory {
  create(validator?: IValidator): IValidationController;
  createForCurrentScope(validator?: IValidator): IValidationController;
}
export const IValidationControllerFactory = DI.createInterface<IValidationControllerFactory>("IValidationControllerFactory").noDefault();

/**
 * Creates ValidationController instances.
 */
export class ValidationControllerFactory implements IValidationControllerFactory {

  public constructor(
    @IContainer private readonly container: IContainer,
  ) { }

  /**
   * Creates a new controller instance.
   */
  public create(validator?: IValidator): IValidationController {
    const container = this.container;
    return new ValidationController(
      validator ?? container.get<IValidator>(IValidator),
      container.get(IExpressionParser),
      container.get(IScheduler)
    );
  }

  /**
   * Creates a new controller and registers it in the current element's container so that it's
   * available to the validate binding behavior and subscribers.
   */
  public createForCurrentScope(validator?: IValidator): IValidationController {
    const controller = this.create(validator);
    Registration.instance(IValidationController, controller).register(this.container);
    return controller;
  }
}
