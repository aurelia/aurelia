import { IValidator } from './validator';
import { validateTrigger } from './validate-trigger';
import { getPropertyInfo } from './property-info';
import { ValidationRenderer, RenderInstruction } from './validation-renderer';
import { ValidateResult } from './validate-result';
import { ValidateInstruction } from './validate-instruction';
import { ControllerValidateResult } from './controller-validate-result';
import { PropertyAccessorParser, PropertyAccessor } from './property-accessor-parser';
import { ValidateEvent } from './validate-event';
import { IBinding, BindingBehaviorExpression } from '@aurelia/runtime';
import { IValidateable, PropertyRule } from './implementation/rule';

export type BindingWithBehavior = IBinding & {
  sourceExpression: BindingBehaviorExpression;
};

/**
 * Orchestrates validation.
 * Manages a set of bindings, renderers and objects.
 * Exposes the current list of validation results for binding purposes.
 */
export class ValidationController {
  // Registered bindings (via the validate binding behavior)
  private readonly bindings: Map<BindingWithBehavior, BindingInfo> = new Map<BindingWithBehavior, BindingInfo>();

  // Renderers that have been added to the controller instance.
  private readonly renderers: ValidationRenderer[] = [];

  /**
   * Validation results that have been rendered by the controller.
   */
  private readonly results: ValidateResult[] = [];

  /**
   * Validation errors that have been rendered by the controller.
   */
  public errors: ValidateResult[] = [];

  /**
   * Whether the controller is currently validating.
   */
  public validating: boolean = false;

  // Elements related to validation results that have been rendered.
  private readonly elements: Map<ValidateResult, Element[]> = new Map<ValidateResult, Element[]>();

  // Objects that have been added to the controller instance (entity-style validation).
  private readonly objects: Map<IValidateable, PropertyRule[] | undefined> = new Map<IValidateable, PropertyRule[] | undefined>();

  /**
   * The trigger that will invoke automatic validation of a property used in a binding.
   */
  public validateTrigger: validateTrigger = validateTrigger.blur;

  // Promise that resolves when validation has completed.
  private finishValidating: Promise<any> = Promise.resolve();

  private readonly eventCallbacks: ((event: ValidateEvent) => void)[] = [];

  public constructor(
    private readonly validator: IValidator,
    private readonly propertyParser: PropertyAccessorParser
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
    propertyName: string | PropertyAccessor<TObject, string> | null = null
  ): ValidateResult {
    let resolvedPropertyName: string | number | null;
    if (propertyName === null) {
      resolvedPropertyName = propertyName;
    } else {
      resolvedPropertyName = this.propertyParser.parse(propertyName);
    }
    const result = new ValidateResult({ __manuallyAdded__: true }, object, resolvedPropertyName, false, message);
    this.processResultDelta('validate', [], [result]);
    return result;
  }

  /**
   * Removes and unrenders an error.
   */
  public removeError(result: ValidateResult) {
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
   */
  public registerBinding(binding: BindingWithBehavior, target: Element, rules?: any) {
    this.bindings.set(binding, { target, rules, propertyInfo: null });
  }

  /**
   * Unregisters a binding with the controller.
   *
   * @param binding - The binding instance.
   */
  public unregisterBinding(binding: BindingWithBehavior) {
    this.resetBinding(binding);
    this.bindings.delete(binding);
  }

  /**
   * Interprets the instruction and returns a predicate that will identify
   * relevant results in the list of rendered validation results.
   */
  private getInstructionPredicate(instruction?: ValidateInstruction): (result: ValidateResult) => boolean {
    if (instruction !== void 0) {
      const { object, propertyName, rules } = instruction;
      let predicate: (result: ValidateResult) => boolean;
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

  /**
   * Validates and renders results.
   *
   * @param {ValidateInstruction} [instruction] - Instructions on what to validate. If undefined, all
   * objects and bindings will be validated.
   */
  public async validate(instruction?: ValidateInstruction): Promise<ControllerValidateResult> {
    // Get a function that will process the validation instruction.
    let execute: () => Promise<ValidateResult[]>;
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
        const promises: Promise<ValidateResult[]>[] = [];
        for (const [object, rules] of this.objects.entries()) {
          promises.push(this.validator.validateObject(object, rules));
        }
        for (const [binding, { rules }] of this.bindings.entries()) {
          const propertyInfo = getPropertyInfo(binding.sourceExpression, (binding as any).source); // TODO fix this
          if (!propertyInfo || this.objects.has(propertyInfo.object)) {
            continue;
          }
          promises.push(this.validator.validateProperty(propertyInfo.object, propertyInfo.propertyName, rules));
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
  private getAssociatedElements({ object, propertyName }: ValidateResult): Element[] {
    const elements: Element[] = [];
    for (const [binding, { target }] of this.bindings.entries()) {
      const propertyInfo = getPropertyInfo(binding.sourceExpression, (binding as any).source); // TODO fix this
      if (propertyInfo && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
        elements.push(target);
      }
    }
    return elements;
  }

  private processResultDelta(
    kind: 'validate' | 'reset',
    oldResults: ValidateResult[], newResults: ValidateResult[]
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
   */
  public async validateBinding(binding: BindingWithBehavior) {
    // if (!binding.isBound) {
    //   return;
    // }
    const propertyInfo = getPropertyInfo(binding.sourceExpression, (binding as any).source); // TODO fix this
    let rules;
    const registeredBinding = this.bindings.get(binding);
    if (registeredBinding) {
      rules = registeredBinding.rules;
      registeredBinding.propertyInfo = propertyInfo;
    }
    if (!propertyInfo) {
      return;
    }
    const { object, propertyName } = propertyInfo;
    await this.validate({ object, propertyName, rules });
  }

  /**
   * Resets the results for a property associated with a binding.
   */
  public resetBinding(binding: BindingWithBehavior) {
    const registeredBinding = this.bindings.get(binding);
    let propertyInfo = getPropertyInfo(binding.sourceExpression, (binding as any).source); // TODO fix this
    if (!propertyInfo && registeredBinding) {
      propertyInfo = registeredBinding.propertyInfo;
    }
    if (registeredBinding) {
      registeredBinding.propertyInfo = null;
    }
    if (!propertyInfo) {
      return;
    }
    const { object, propertyName } = propertyInfo;
    this.reset({ object, propertyName });
  }

  /**
   * Changes the controller's validateTrigger.
   *
   * @param {validateTrigger} newTrigger - The new validateTrigger
   */
  public changeTrigger(newTrigger: validateTrigger) {
    this.validateTrigger = newTrigger;
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

  /**
   * The rules associated with the binding via the validate binding behavior's rules parameter.
   */
  rules?: PropertyRule[];

  /**
   * The object and property associated with the binding.
   */
  propertyInfo: { object: any; propertyName: string } | null;
}
