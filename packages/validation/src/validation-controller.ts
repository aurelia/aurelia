import { DI, IContainer, Registration } from '@aurelia/kernel';
import { AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, BindingBehaviorExpression, IBinding, IExpressionParser, IScope, LifecycleFlags, PrimitiveLiteralExpression } from '@aurelia/runtime';
import { IValidateable, parsePropertyName, PropertyAccessor, PropertyRule, ValidationResult } from './rule';
import { RenderInstruction, ValidationRenderer } from './validation-renderer';
import { IValidator } from './validator';

/**
 * Validation triggers.
 */
export const enum ValidationTrigger {
  /**
   * Manual validation.  Use the controller's `validate()` and  `reset()` methods
   * to validate all bindings.
   */
  manual = "manual",

  /**
   * Validate the binding when the binding's target element fires a DOM "blur" event.
   */
  blur = "blur",

  /**
   * Validate the binding when it updates the model due to a change in the view.
   */
  change = "change",

  /**
   * Validate the binding when the binding's target element fires a DOM "blur" event and
   * when it updates the model due to a change in the view.
   */
  changeOrBlur = "changeOrBlur"
}

export type BindingWithBehavior = IBinding & {
  sourceExpression: BindingBehaviorExpression;
  target: Element | object;
};
type ValidatableExpression = AccessScopeExpression | AccessMemberExpression | AccessKeyedExpression;

export interface IValidationController {
  errors: ValidationResult[];
  validating: boolean;
  trigger: ValidationTrigger;
  addObject(object: IValidateable, rules?: PropertyRule[]): void;
  removeObject(object: IValidateable): void;
  addError<TObject>(message: string, object: TObject, propertyName?: string | PropertyAccessor | null): ValidationResult;
  removeError(result: ValidationResult): void;
  addRenderer(renderer: ValidationRenderer): void;
  registerBinding(binding: BindingWithBehavior, target: Element, scope: IScope, rules?: any): void;
  deregisterBinding(binding: BindingWithBehavior): void;
  validate(instruction?: ValidateInstruction): Promise<ControllerValidateResult>;
  reset(instruction?: ValidateInstruction): void;
  validateBinding(binding: BindingWithBehavior): Promise<void>;
  resetBinding(binding: BindingWithBehavior): void;
  changeTrigger(newTrigger: ValidationTrigger): void;
  revalidateErrors(): Promise<void>;
}
export const IValidationController = DI.createInterface<IValidationController>("IValidationController").noDefault();

/**
 * Orchestrates validation.
 * Manages a set of bindings, renderers and objects.
 * Exposes the current list of validation results for binding purposes.
 */
export class ValidationController implements IValidationController {

  // Registered bindings (via the validate binding behavior)
  private readonly bindings: Map<BindingWithBehavior, BindingInfo> = new Map<BindingWithBehavior, BindingInfo>();

  // Renderers that have been added to the controller instance.
  private readonly renderers: ValidationRenderer[] = [];

  /**
   * Validation results that have been rendered by the controller.
   */
  private readonly results: ValidationResult[] = [];

  /**
   * Validation errors that have been rendered by the controller.
   */
  public errors: ValidationResult[] = [];

  /**
   * Whether the controller is currently validating.
   */
  public validating: boolean = false;

  // Elements related to validation results that have been rendered.
  private readonly elements: Map<ValidationResult, Element[]> = new Map<ValidationResult, Element[]>();

  // Objects that have been added to the controller instance (entity-style validation).
  private readonly objects: Map<IValidateable, PropertyRule[] | undefined> = new Map<IValidateable, PropertyRule[] | undefined>();

  /**
   * The trigger that will invoke automatic validation of a property used in a binding.
   */
  public trigger: ValidationTrigger = ValidationTrigger.blur;

  // Promise that resolves when validation has completed.
  private finishValidating: Promise<any> = Promise.resolve();

  private readonly eventCallbacks: ((event: ValidateEvent) => void)[] = [];

  public constructor(
    @IValidator private readonly validator: IValidator,
    @IExpressionParser private readonly parser: IExpressionParser,
  ) { }

  /**
   * Subscribe to controller validate and reset events. These events occur when the
   * controller's "validate"" and "reset" methods are called.
   *
   * @param callback - The callback to be invoked when the controller validates or resets.
   */
  public subscribe(callback: (event: ValidateEvent) => void) {
    this.eventCallbacks.push(callback);
    return {
      dispose: () => {
        const index = this.eventCallbacks.indexOf(callback);
        if (index === -1) {
          return;
        }
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

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
    propertyName: string | PropertyAccessor | null = null
  ): ValidationResult {
    let resolvedPropertyName: string | number | null;
    if (propertyName === null) {
      resolvedPropertyName = propertyName;
    } else {
      [resolvedPropertyName] = parsePropertyName(propertyName, this.parser);
    }
    const result = new ValidationResult({ __manuallyAdded__: true }, object, resolvedPropertyName, false, message); // TODO revisit
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

  /**
   * Adds a renderer.
   *
   * @param renderer - The renderer.
   */
  public addRenderer(renderer: ValidationRenderer) {
    this.renderers.push(renderer);
    renderer.render({
      kind: 'validate',
      render: this.results.map(result => ({ result, elements: this.elements.get(result)! })),
      unrender: []
    });
  }

  /**
   * Removes a renderer.
   */
  public removeRenderer(renderer: ValidationRenderer) {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.render({
      kind: 'reset',
      render: [],
      unrender: this.results.map(result => ({ result, elements: this.elements.get(result)! }))
    });
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
    console.log(`registered binding ${this.bindings.size}`);
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
    console.log(`deregistered binding ${this.bindings.size}`);
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
        return x => predicate(x) && rules.find((rule: PropertyRule) => rule.$rules.includes(x.rule)) !== undefined;
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
    // const originalExpression = expression;
    // while (expression instanceof BindingBehavior || expression instanceof ValueConverter) {
    //   expression = expression.expression;
    // }

    const scope = info.scope;
    let expression = binding.sourceExpression.expression as ValidatableExpression;
    const locator = binding.locator;
    let toCachePropertyName = true;
    let propertyName: string = "";
    while (expression !== void 0 && !(expression instanceof AccessScopeExpression)) {
      let memberName: string;
      switch (true) {
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
          throw new Error(`Unknown expression of type ${Object.getPrototypeOf(expression)}`); // TODO use reporter/logger
      }
      propertyName = propertyName.length === 0 ? memberName : `${memberName}.${propertyName}`;
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
    console.log(propertyInfo);
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
    console.log(`validating ${this.bindings.size} bindings`);
    // Get a function that will process the validation instruction.
    let execute: () => Promise<ValidationResult[]>;
    if (instruction !== void 0) {
      // eslint-disable-next-line prefer-const
      let { object, propertyName, rules } = instruction;
      // if rules were not specified, check the object map.
      rules = rules ?? this.objects.get(object);
      // property specified?
      if (propertyName !== void 0) {
        // validate the specified property.
        execute = async () => this.validator.validateProperty(object, propertyName!, rules);
      } else {
        // validate the specified object.
        execute = async () => this.validator.validateObject(object, rules);
      }
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
    const returnPromise: Promise<ControllerValidateResult> = this.finishValidating
      .then(execute)
      .then((newResults) => {
        const predicate = this.getInstructionPredicate(instruction);
        const oldResults = this.results.filter(predicate);
        this.processResultDelta('validate', oldResults, newResults);
        if (returnPromise === this.finishValidating) {
          this.validating = false;
        }
        const result: ControllerValidateResult = {
          instruction,
          valid: newResults.find(r => !r.valid) === void 0,
          results: newResults
        };
        this.invokeCallbacks(instruction, result);
        return result;
      })
      .catch(async (exception) => {
        // recover, to enable subsequent calls to validate()
        this.validating = false;
        this.finishValidating = Promise.resolve();

        return Promise.reject(exception);
      });

    this.finishValidating = returnPromise;

    return returnPromise;
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
    this.invokeCallbacks(instruction, null);
  }

  /**
   * Gets the elements associated with an object and propertyName (if any).
   */
  private getAssociatedElements({ object, propertyName }: ValidationResult): Element[] {
    const elements: Element[] = [];
    for (const [binding, info] of this.bindings.entries()) {
      const propertyInfo = this.getPropertyInfo(binding, info); // TODO fix this
      if (propertyInfo && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
        elements.push(info.target);
      }
    }
    return elements;
  }

  private processResultDelta(
    kind: 'validate' | 'reset',
    oldResults: ValidationResult[], newResults: ValidationResult[]
  ) {
    // prepare the instruction.
    const instruction: RenderInstruction = {
      kind,
      render: [],
      unrender: []
    };

    // create a shallow copy of newResults so we can mutate it without causing side-effects.
    newResults = newResults.slice(0);

    // create unrender instructions from the old results.
    for (const oldResult of oldResults) {
      // get the elements associated with the old result.
      const elements = this.elements.get(oldResult)!;

      // remove the old result from the element map.
      this.elements.delete(oldResult);

      // create the unrender instruction.
      instruction.unrender.push({ result: oldResult, elements });

      // determine if there's a corresponding new result for the old result we are unrendering.
      const newResultIndex = newResults.findIndex(
        x => x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName);
      if (newResultIndex === -1) {
        // no corresponding new result... simple remove.
        this.results.splice(this.results.indexOf(oldResult), 1);
        if (!oldResult.valid) {
          this.errors.splice(this.errors.indexOf(oldResult), 1);
        }
      } else {
        // there is a corresponding new result...
        const newResult = newResults.splice(newResultIndex, 1)[0];

        // get the elements that are associated with the new result.
        const elements = this.getAssociatedElements(newResult);
        this.elements.set(newResult, elements);

        // create a render instruction for the new result.
        instruction.render.push({ result: newResult, elements });

        // do an in-place replacement of the old result with the new result.
        // this ensures any repeats bound to this.results will not thrash.
        this.results.splice(this.results.indexOf(oldResult), 1, newResult);
        if (!oldResult.valid && newResult.valid) {
          this.errors.splice(this.errors.indexOf(oldResult), 1);
        } else if (!oldResult.valid && !newResult.valid) {
          this.errors.splice(this.errors.indexOf(oldResult), 1, newResult);
        } else if (!newResult.valid) {
          this.errors.push(newResult);
        }
      }
    }

    // create render instructions from the remaining new results.
    for (const result of newResults) {
      const elements = this.getAssociatedElements(result);
      instruction.render.push({ result, elements });
      this.elements.set(result, elements);
      this.results.push(result);
      if (!result.valid) {
        this.errors.push(result);
      }
    }

    // render.
    for (const renderer of this.renderers) {
      renderer.render(instruction);
    }
  }

  /**
   * Validates the property associated with a binding.
   *
   * @internal
   */
  public async validateBinding(binding: BindingWithBehavior) {
    // if (!binding.isBound) {
    //   return;
    // }
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
    const result = await this.validate({ object, propertyName, rules });
    console.log(result);
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
    this.reset({ object, propertyName });
  }

  /**
   * Changes the controller's validateTrigger.
   *
   * @param {ValidationTrigger} newTrigger - The new validateTrigger
   */
  public changeTrigger(newTrigger: ValidationTrigger) {
    this.trigger = newTrigger;
    for (const binding of this.bindings.keys()) {
      // TODO fix this
      const source = (binding as any).source;
      (binding as any).unbind();
      (binding as any).bind(source);
    }
  }

  /**
   * Revalidates the controller's current set of errors.
   */
  public async revalidateErrors() {
    await Promise.all(
      this.errors.map(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        ({ object, propertyName, rule }) =>
          rule.__manuallyAdded__ !== void 0
            ? Promise.resolve(void 0)
            : this.validate({ object, propertyName: propertyName as string, rules: [rule] }))
    );
  }

  private invokeCallbacks(instruction: ValidateInstruction | undefined, result: ControllerValidateResult | null) {
    if (this.eventCallbacks.length === 0) {
      return;
    }
    const event = new ValidateEvent(
      result ? 'validate' : 'reset',
      this.errors,
      this.results,
      instruction ?? null,
      result);
    for (let i = 0; i < this.eventCallbacks.length; i++) {
      this.eventCallbacks[i](event);
    }
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
  public static get(container: IContainer) {
    return new ValidationControllerFactory(container);
  }

  public constructor(
    @IContainer private readonly container: IContainer,
  ) { }

  /**
   * Creates a new controller instance.
   */
  public create(validator?: IValidator): IValidationController {
    validator = validator ?? this.container.get<IValidator>(IValidator);
    const parser = this.container.get<IExpressionParser>(IExpressionParser);
    return new ValidationController(validator, parser);
  }

  /**
   * Creates a new controller and registers it in the current element's container so that it's
   * available to the validate binding behavior and renderers.
   */
  public createForCurrentScope(validator?: IValidator): IValidationController {
    const controller = this.create(validator);
    this.container.register(Registration.instance(ValidationController, controller));
    return controller;
  }
}

export class ValidateEvent {
  public constructor(
    /**
     * The type of validate event. Either "validate" or "reset".
     */
    public readonly type: 'validate' | 'reset',

    /**
     * The controller's current array of errors. For an array containing both
     * failed rules and passed rules, use the "results" property.
     */
    public readonly errors: ValidationResult[],

    /**
     * The controller's current array of validate results. This
     * includes both passed rules and failed rules. For an array of only failed rules,
     * use the "errors" property.
     */
    public readonly results: ValidationResult[],

    /**
     * The instruction passed to the "validate" or "reset" event. Will be null when
     * the controller's validate/reset method was called with no instruction argument.
     */
    public readonly instruction: ValidateInstruction | null,

    /**
     * In events with type === "validate", this property will contain the result
     * of validating the instruction (see "instruction" property). Use the controllerValidateResult
     * to access the validate results specific to the call to "validate"
     * (as opposed to using the "results" and "errors" properties to access the controller's entire
     * set of results/errors).
     */
    public readonly controllerValidateResult: ControllerValidateResult | null

  ) { }
}

/**
 * The result of a call to the validation controller's validate method.
 */
export interface ControllerValidateResult {
  /**
   * Whether validation passed.
   */
  valid: boolean;

  /**
   * The validation result of every rule that was evaluated.
   */
  results: ValidationResult[];

  /**
   * The instruction passed to the controller's validate method.
   */
  instruction?: ValidateInstruction;
}

/**
 * Instructions for the validation controller's validate method.
 */
export interface ValidateInstruction {
  /**
   * The object to validate.
   */
  object: IValidateable;

  /**
   * The property to validate. Optional.
   */
  propertyName?: string;

  /**
   * The rules to validate. Optional.
   */
  rules?: PropertyRule[];
}
