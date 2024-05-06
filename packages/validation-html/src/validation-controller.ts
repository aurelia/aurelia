import {
  DI,
  IServiceLocator,
  type IContainer,
  type IFactory,
  type Constructable,
  type Transformer,
  type Key,
  resolve,
} from '@aurelia/kernel';
import {
  BindingBehaviorExpression,
  IExpressionParser,
} from '@aurelia/expression-parser';
import {
  astEvaluate,
  IPlatform,
  PropertyBinding,
  type Scope,
} from '@aurelia/runtime-html';
import {
  parsePropertyName,
  PropertyAccessor,
  PropertyRule,
  ValidationResult,
  IValidator,
  ValidateInstruction,
  type IValidationRule,
  type IValidateable,
} from '@aurelia/validation';

export type BindingWithBehavior = PropertyBinding & {
  ast: BindingBehaviorExpression;
  target: Element | object;
};
export type ValidateEventKind = 'validate' | 'reset';

/**
 * The result of a call to the validation controller's validate method.
 */
export class ControllerValidateResult {
  /**
   * @param {boolean} valid - `true` if the validation passed, else `false`.
   * @param {ValidationResult[]} results - The validation result of every rule that was evaluated.
   * @param {ValidateInstruction} [instruction] - The instruction passed to the controller's validate method.
   */
  public constructor(
    public valid: boolean,
    public results: ValidationResult[],
    public instruction?: Partial<ValidateInstruction>,
  ) { }
}

/**
 * Describes the validation result and target elements pair.
 * Used to notify the subscribers.
 */
export class ValidationResultTarget {
  public constructor(
    public result: ValidationResult,
    public targets: Element[],
  ) { }
}

/**
 * Describes the contract of the validation event.
 * Used to notify the subscribers.
 */
export class ValidationEvent {
  /**
   * @param {ValidateEventKind} kind - 'validate' or 'reset'.
   * @param {ValidationResultTarget[]} addedResults - new errors added.
   * @param {ValidationResultTarget[]} removedResults - old errors removed.
   * @memberof ValidationEvent
   */
  public constructor(
    public kind: ValidateEventKind,
    public addedResults: ValidationResultTarget[],
    public removedResults: ValidationResultTarget[],
  ) { }
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
export class BindingInfo {
  /**
   * @param {Element} target - The HTMLElement associated with the binding.
   * @param {Scope} scope - The binding scope.
   * @param {PropertyRule[]} [rules] - Rules bound to the binding behavior.
   * @param {(PropertyInfo | undefined)} [propertyInfo] - Information describing the associated property for the binding.
   * @memberof BindingInfo
   */
  public constructor(
    public target: Element,
    public scope: Scope,
    public rules?: PropertyRule[],
    public propertyInfo: PropertyInfo | undefined = void 0,
  ) { }
}

class PropertyInfo {
  public constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public object: any,
    public propertyName: string,
  ) { }
}

export function getPropertyInfo(binding: BindingWithBehavior, info: BindingInfo): PropertyInfo | undefined {
  let propertyInfo = info.propertyInfo;
  if (propertyInfo !== void 0) {
    return propertyInfo;
  }

  const scope = info.scope;
  let expression = binding.ast.expression;
  let toCachePropertyName = true;
  let propertyName: string = '';
  while (expression !== void 0 && expression?.$kind !== 'AccessScope') {
    let memberName: string;
    switch (expression.$kind) {
      case 'BindingBehavior':
      case 'ValueConverter':
        expression = expression.expression;
        continue;
      case 'AccessMember':
        memberName = expression.name;
        break;
      case 'AccessKeyed': {
        const keyExpr = expression.key;
        if (toCachePropertyName) {
          toCachePropertyName = keyExpr.$kind === 'PrimitiveLiteral';
        }
        // eslint-disable-next-line
        memberName = `[${(astEvaluate(keyExpr, scope, binding, null) as any).toString()}]`;
        break;
      }
      default:
        throw new Error(`Unknown expression of type ${expression.constructor.name}`); // TODO: use reporter/logger
    }
    const separator = propertyName.startsWith('[') ? '' : '.';
    propertyName = propertyName.length === 0 ? memberName : `${memberName}${separator}${propertyName}`;
    expression = expression.object;
  }
  if (expression === void 0) {
    throw new Error(`Unable to parse binding expression: ${binding.ast.expression}`); // TODO: use reporter/logger
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let object: any;
  if (propertyName.length === 0) {
    propertyName = expression.name;
    object = scope.bindingContext;
  } else {
    object = astEvaluate(expression, scope, binding, null);
  }
  if (object === null || object === void 0) {
    return (void 0);
  }
  propertyInfo = new PropertyInfo(object, propertyName);
  if (toCachePropertyName) {
    info.propertyInfo = propertyInfo;
  }
  return propertyInfo;
}

type ValidationPredicate = (result: ValidationResult) => boolean;
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
   * @template TObject
   * @param {ValidateInstruction<TObject>} [instruction] - If omitted, then all the registered objects and bindings will be validated.
   */
  validate<TObject extends IValidateable>(instruction?: Partial<ValidateInstruction<TObject>>): Promise<ControllerValidateResult>;
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
   * Registers a `binding` to the controller.
   * The binding will be validated during validate without instruction.
   * This is usually done via the `validate` binding behavior during binding phase.
   *
   * @internal
   */
  registerBinding(binding: BindingWithBehavior, info: BindingInfo): void;
  /**
   * Deregisters a binding; i.e. it won't be validated during validate without instruction.
   * This is usually done via the `validate` binding behavior during unbinding phase.
   *
   * @internal
   */
  unregisterBinding(binding: BindingWithBehavior): void;
  /**
   * Validates a specific binding.
   * This is usually done from the `validate` binding behavior, triggered by some `ValidationTrigger`
   *
   * @internal
   */
  validateBinding(binding: BindingWithBehavior): Promise<void>;
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
export const IValidationController = /*@__PURE__*/DI.createInterface<IValidationController>('IValidationController');

export class ValidationController implements IValidationController {

  public readonly bindings: Map<BindingWithBehavior, BindingInfo> = new Map<BindingWithBehavior, BindingInfo>();
  public readonly subscribers: Set<ValidationResultsSubscriber> = new Set<ValidationResultsSubscriber>();
  public readonly results: ValidationResult[] = [];
  public validating: boolean = false;

  /**
   * Elements related to validation results that have been rendered.
   *
   * @private
   * @type {Map<ValidationResult, Element[]>}
   */
  private readonly elements: WeakMap<ValidationResult, Element[]> = new WeakMap();
  public readonly objects: Map<IValidateable, PropertyRule[] | undefined> = new Map<IValidateable, PropertyRule[] | undefined>();

  public readonly validator: IValidator = resolve(IValidator);
  private readonly parser: IExpressionParser = resolve(IExpressionParser);
  private readonly platform: IPlatform = resolve(IPlatform);
  private readonly locator: IServiceLocator = resolve(IServiceLocator);

  public addObject(object: IValidateable, rules?: PropertyRule[]): void {
    this.objects.set(object, rules);
  }

  public removeObject(object: IValidateable): void {
    this.objects.delete(object);
    this.processResultDelta(
      'reset',
      this.results.filter(result => result.object === object),
      []);
  }

  public addError<TObject extends IValidateable>(
    message: string,
    object: TObject,
    propertyName?: string | PropertyAccessor
  ): ValidationResult {
    let resolvedPropertyName: string | number | undefined;
    if (propertyName !== void 0) {
      [resolvedPropertyName] = parsePropertyName(propertyName, this.parser);
    }
    const result = new ValidationResult(false, message, resolvedPropertyName, object, undefined, undefined, true);
    this.processResultDelta('validate', [], [result]);
    return result;
  }

  public removeError(result: ValidationResult) {
    if (this.results.includes(result)) {
      this.processResultDelta('reset', [result], []);
    }
  }

  public addSubscriber(subscriber: ValidationResultsSubscriber) {
    this.subscribers.add(subscriber);
  }

  public removeSubscriber(subscriber: ValidationResultsSubscriber) {
    this.subscribers.delete(subscriber);
  }

  public registerBinding(binding: BindingWithBehavior, info: BindingInfo) {
    this.bindings.set(binding, info);
  }

  public unregisterBinding(binding: BindingWithBehavior) {
    this.resetBinding(binding);
    this.bindings.delete(binding);
  }

  public async validate<TObject extends IValidateable>(instruction?: Partial<ValidateInstruction<TObject>>): Promise<ControllerValidateResult> {
    const { object: obj, objectTag } = instruction ?? {};
    let instructions: ValidateInstruction[];
    if (obj !== void 0) {
      instructions = [new ValidateInstruction(
        obj,
        instruction?.propertyName,
        instruction?.rules ?? this.objects.get(obj),
        objectTag,
        instruction?.propertyTag
      )];
    } else {
      // validate all objects and bindings.
      instructions = [
        ...Array.from(this.objects.entries())
          .map(([object, rules]) => new ValidateInstruction(object, void 0, rules, objectTag)),
        ...Array.from(this.bindings.entries())
          .reduce(
            (acc: ValidateInstruction[], [binding, info]) => {
              const propertyInfo = getPropertyInfo(binding, info);
              if (propertyInfo !== void 0 && !this.objects.has(propertyInfo.object)) {
                acc.push(new ValidateInstruction(propertyInfo.object, propertyInfo.propertyName, info.rules, objectTag, instruction?.propertyTag));
              }
              return acc;
            },
            [])
      ];
    }

    this.validating = true;
    const task = this.platform.domReadQueue.queueTask(async () => {
      try {
        const results = await Promise.all(instructions.map(
          async (x) => this.validator.validate(x)
        ));
        const newResults = results.reduce(
          (acc, resultSet) => {
            acc.push(...resultSet);
            return acc;
          },
          []);
        const predicate = this.getInstructionPredicate(instruction);
        const oldResults = this.results.filter(predicate);
        this.processResultDelta('validate', oldResults, newResults);

        return new ControllerValidateResult(newResults.find(r => !r.valid) === void 0, newResults, instruction);
      } finally {
        this.validating = false;
      }
    });
    return task.result;
  }

  public reset(instruction?: ValidateInstruction) {
    const predicate = this.getInstructionPredicate(instruction);
    const oldResults = this.results.filter(predicate);
    this.processResultDelta('reset', oldResults, []);
  }

  public async validateBinding(binding: BindingWithBehavior) {
    if (!binding.isBound) { return; }

    const bindingInfo = this.bindings.get(binding);
    if (bindingInfo === void 0) { return; }

    const propertyInfo = getPropertyInfo(binding, bindingInfo);
    const rules = bindingInfo.rules;
    if (propertyInfo === void 0) { return; }

    const { object, propertyName } = propertyInfo;
    await this.validate(new ValidateInstruction(object, propertyName, rules));
  }

  public resetBinding(binding: BindingWithBehavior) {
    const bindingInfo = this.bindings.get(binding);
    if (bindingInfo === void 0) { return; }

    const propertyInfo = getPropertyInfo(binding, bindingInfo);
    if (propertyInfo === void 0) { return; }

    bindingInfo.propertyInfo = void 0;
    const { object, propertyName } = propertyInfo;
    this.reset(new ValidateInstruction(object, propertyName));
  }

  public async revalidateErrors() {
    const map = this.results
      .reduce(
        (acc, { isManual, object, propertyRule, rule, valid }) => {
          if (!valid && !isManual && propertyRule !== void 0 && object !== void 0 && rule !== void 0) {
            let value = acc.get(object);
            if (value === void 0) {
              acc.set(object, value = new Map());
            }
            let rules = value.get(propertyRule);
            if (rules === void 0) {
              value.set(propertyRule, rules = []);
            }
            rules.push(rule);
          }
          return acc;
        },
        new Map<IValidateable, Map<PropertyRule, IValidationRule[]>>());

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
            ]) => new PropertyRule(this.locator, validationRules, messageProvider, property, [rules]))
        ))
      );
    }
    await Promise.all(promises);
  }

  /**
   * Interprets the instruction and returns a predicate that will identify relevant results in the list of rendered validation results.
   */
  private getInstructionPredicate(instruction?: Partial<ValidateInstruction>): ValidationPredicate {
    if (instruction === void 0) { return () => true; }

    const propertyName = instruction.propertyName;
    const rules = instruction.rules;

    return x => !x.isManual
      && x.object === instruction.object
      && (propertyName === void 0 || x.propertyName === propertyName)
      && (
        rules === void 0
        || rules.includes(x.propertyRule!)
        || rules.some((r) => x.propertyRule === void 0 || r.$rules.flat().every(($r) => x.propertyRule!.$rules.flat().includes($r)))
      );
  }

  /**
   * Gets the elements associated with an object and propertyName (if any).
   */
  private getAssociatedElements({ object, propertyName }: ValidationResult): Element[] {
    const elements: Element[] = [];
    for (const [binding, info] of this.bindings.entries()) {
      const propertyInfo = getPropertyInfo(binding, info);
      if (propertyInfo !== void 0 && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
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
    const eventData: ValidationEvent = new ValidationEvent(kind, [], []);
    // create a shallow copy of newResults so we can mutate it without causing side-effects.
    newResults = newResults.slice(0);

    const elements = this.elements;
    for (const oldResult of oldResults) {
      const removalTargets = elements.get(oldResult)!;
      elements.delete(oldResult);

      eventData.removedResults.push(new ValidationResultTarget(oldResult, removalTargets));

      // determine if there's a corresponding new result for the old result we are removing.
      const newResultIndex = newResults.findIndex(x => x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName);
      if (newResultIndex === -1) {
        // no corresponding new result... simple remove.
        this.results.splice(this.results.indexOf(oldResult), 1);
      } else {
        // there is a corresponding new result...
        const newResult = newResults.splice(newResultIndex, 1)[0];
        const newTargets = this.getAssociatedElements(newResult);
        elements.set(newResult, newTargets);
        eventData.addedResults.push(new ValidationResultTarget(newResult, newTargets));

        // do an in-place replacement of the old result with the new result.
        // this ensures any repeats bound to this.results will not thrash.
        this.results.splice(this.results.indexOf(oldResult), 1, newResult);
      }
    }

    // add the remaining new results to the event data.
    for (const result of newResults) {
      const newTargets = this.getAssociatedElements(result);
      eventData.addedResults.push(new ValidationResultTarget(result, newTargets));
      elements.set(result, newTargets);
      this.results.push(result);
    }

    for (const subscriber of this.subscribers) {
      subscriber.handleValidationEvent(eventData);
    }
  }
}

export class ValidationControllerFactory implements IFactory<Constructable<IValidationController>> {
  public Type: Constructable<IValidationController> = (void 0)!;

  public registerTransformer(_transformer: Transformer<Constructable<IValidationController>>): boolean {
    return false;
  }

  public construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController {
    return container.invoke(ValidationController, _dynamicDependencies);
  }
}
