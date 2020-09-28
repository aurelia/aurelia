import { DI } from '@aurelia/kernel';
import {
  bindingBehavior,
  BindingInterceptor,
  BindingMediator,
  IBindingBehaviorExpression,
  IsAssign,
  IScheduler,
  IScope,
  LifecycleFlags,
  CustomElementHost,
  DOM,
  PropertyBinding,
  IBinding,
  BindingBehaviorExpression,
  ITask,
} from '@aurelia/runtime';
import { PropertyRule } from '@aurelia/validation';
import { BindingWithBehavior, IValidationController, ValidationController, BindingInfo, ValidationResultsSubscriber, ValidationEvent } from './validation-controller';

/**
 * Validation triggers.
 */
export enum ValidationTrigger {
  /**
   * Manual validation.  Use the controller's `validate()` and  `reset()` methods to validate all bindings.
   */
  manual = 'manual',

  /**
   * Validate the binding when the binding's target element fires a DOM 'blur' event.
   */
  blur = 'blur',

  /**
   * Validate the binding when the binding's target element fires a DOM 'focusout' event.
   */
  focusout = 'focusout',

  /**
   * Validate the binding when it updates the model due to a change in the source property (usually triggered by some change in view)
   */
  change = 'change',

  /**
   * Validate the binding when the binding's target element fires a DOM 'blur' event and when it updates the model due to a change in the view.
   */
  changeOrBlur = 'changeOrBlur',

  /**
   * Validate the binding when the binding's target element fires a DOM 'focusout' event and when it updates the model due to a change in the view.
   */
  changeOrFocusout = 'changeOrFocusout',
}

/* @internal */
export const IDefaultTrigger = DI.createInterface<ValidationTrigger>('IDefaultTrigger').noDefault();

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior extends BindingInterceptor implements ValidationResultsSubscriber {
  private propertyBinding: BindingWithBehavior = (void 0)!;
  private target: HTMLElement = (void 0)!;
  private trigger!: ValidationTrigger;
  private readonly scopedController?: IValidationController;
  private controller!: IValidationController;
  private isChangeTrigger: boolean = false;
  private readonly scheduler: IScheduler;
  private readonly defaultTrigger: ValidationTrigger;
  private readonly connectedExpressions: IsAssign[] = [];
  private scope!: IScope;
  private readonly triggerMediator: BindingMediator<'handleTriggerChange'> = new BindingMediator('handleTriggerChange', this, this.observerLocator, this.locator);
  private readonly controllerMediator: BindingMediator<'handleControllerChange'> = new BindingMediator('handleControllerChange', this, this.observerLocator, this.locator);
  private readonly rulesMediator: BindingMediator<'handleRulesChange'> = new BindingMediator('handleRulesChange', this, this.observerLocator, this.locator);
  private isDirty: boolean = false;
  private validatedOnce: boolean = false;
  private triggerEvent: 'blur' | 'focusout' | null = null;
  private bindingInfo!: BindingInfo;

  public constructor(
    public readonly binding: BindingWithBehavior,
    expr: IBindingBehaviorExpression,
  ) {
    super(binding, expr);
    const locator = this.locator;
    this.scheduler = locator.get(IScheduler);
    this.defaultTrigger = locator.get(IDefaultTrigger);
    if (locator.has(IValidationController, true)) {
      this.scopedController = locator.get(IValidationController);
    }
    this.setPropertyBinding();
  }

  public updateSource(value: unknown, flags: LifecycleFlags) {
    // TODO: need better approach. If done incorrectly may cause infinite loop, stack overflow 💣
    if (this.interceptor !== this) {
      this.interceptor.updateSource(value, flags);
    } else {
      // let binding = this as BindingInterceptor;
      // while (binding.binding !== void 0) {
      //   binding = binding.binding as unknown as BindingInterceptor;
      // }
      // binding.updateSource(value, flags);

      // this is a shortcut of the above code
      this.propertyBinding.updateSource(value, flags);
    }

    this.isDirty = true;
    const event = this.triggerEvent;
    if (this.isChangeTrigger && (event === null || event !== null && this.validatedOnce)) {
      this.validateBinding();
    }
  }

  public handleEvent(_event: Event) {
    if (!this.isChangeTrigger || this.isChangeTrigger && this.isDirty) {
      this.validateBinding();
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined) {
    this.scope = scope;
    this.binding.$bind(flags, scope, part);
    this.setTarget();
    const delta = this.processBindingExpressionArgs(flags);
    this.processDelta(delta);
  }

  public $unbind(flags: LifecycleFlags) {
    this.task?.cancel();
    this.task = null;

    const event = this.triggerEvent;
    if (event !== null) {
      this.target?.removeEventListener(event, this);
    }
    this.controller?.removeSubscriber(this);
    this.controller?.unregisterBinding(this.propertyBinding);
    this.binding.$unbind(flags);
    for (const expr of this.connectedExpressions) {
      expr.unbind?.(flags, this.scope, this);
    }
  }

  public handleTriggerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new ValidateArgumentsDelta(void 0, this.ensureTrigger(newValue), void 0));
  }

  public handleControllerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new ValidateArgumentsDelta(this.ensureController(newValue), void 0, void 0));
  }

  public handleRulesChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new ValidateArgumentsDelta(void 0, void 0, this.ensureRules(newValue)));
  }

  public handleValidationEvent(event: ValidationEvent): void {
    const triggerEvent = this.triggerEvent;
    const propertyName = this.bindingInfo.propertyInfo?.propertyName;
    if (propertyName !== void 0 && triggerEvent !== null && this.isChangeTrigger) {
      this.validatedOnce = event.addedResults.find((r) => r.result.propertyName === propertyName) !== void 0;
    }
  }

  private processBindingExpressionArgs(flags: LifecycleFlags): ValidateArgumentsDelta {
    const scope: IScope = this.scope;
    const locator = this.locator;
    let rules: PropertyRule[] | undefined;
    let trigger: ValidationTrigger | undefined;
    let controller: ValidationController | undefined;

    let expression = this.propertyBinding.sourceExpression;
    while (expression.name !== 'validate' && expression !== void 0) {
      expression = expression.expression as BindingBehaviorExpression;
    }
    const evaluationFlags = flags | LifecycleFlags.isStrictBindingStrategy;
    const args = expression.args;
    for (let i = 0, ii = args.length; i < ii; i++) {
      const arg = args[i];
      const temp = arg.evaluate(evaluationFlags, scope, locator);
      switch (i) {
        case 0:
          trigger = this.ensureTrigger(temp);
          arg.connect(flags, scope, this.triggerMediator);
          break;
        case 1:
          controller = this.ensureController(temp);
          arg.connect(flags, scope, this.controllerMediator);
          break;
        case 2:
          rules = this.ensureRules(temp);
          arg.connect(flags, scope, this.rulesMediator);
          break;
        default:
          throw new Error(`Unconsumed argument#${i + 1} for validate binding behavior: ${temp}`); // TODO: use reporter
      }
      this.connectedExpressions.push(arg);
    }

    return new ValidateArgumentsDelta(this.ensureController(controller), this.ensureTrigger(trigger), rules);
  }

  private task: ITask | null = null;
  private validateBinding() {
    this.task?.cancel();
    this.task = this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      await this.controller.validateBinding(this.propertyBinding);
    });
  }

  private processDelta(delta: ValidateArgumentsDelta) {
    const trigger = delta.trigger ?? this.trigger;
    const controller = delta.controller ?? this.controller;
    const rules = delta.rules;
    if (this.trigger !== trigger) {
      let event = this.triggerEvent;
      if (event !== null) {
        this.target.removeEventListener(event, this);
      }

      this.validatedOnce = false;
      this.isDirty = false;
      this.trigger = trigger;
      this.isChangeTrigger = trigger === ValidationTrigger.change
        || trigger === ValidationTrigger.changeOrBlur
        || trigger === ValidationTrigger.changeOrFocusout;

      event = this.setTriggerEvent(this.trigger);
      if (event !== null) {
        this.target.addEventListener(event, this);
      }
    }
    if (this.controller !== controller || rules !== void 0) {
      this.controller?.removeSubscriber(this);
      this.controller?.unregisterBinding(this.propertyBinding);

      this.controller = controller;
      controller.registerBinding(this.propertyBinding, this.setBindingInfo(rules));
      controller.addSubscriber(this);
    }
  }

  private ensureTrigger(trigger: unknown): ValidationTrigger {
    if (trigger === (void 0) || trigger === null) {
      trigger = this.defaultTrigger;
    } else if (!Object.values(ValidationTrigger).includes(trigger as ValidationTrigger)) {
      throw new Error(`${trigger} is not a supported validation trigger`); // TODO: use reporter
    }
    return trigger as ValidationTrigger;
  }

  private ensureController(controller: unknown): ValidationController {
    if (controller === (void 0) || controller === null) {
      controller = this.scopedController;
    } else if (!(controller instanceof ValidationController)) {
      throw new Error(`${controller} is not of type ValidationController`); // TODO: use reporter
    }
    return controller as ValidationController;
  }

  private ensureRules(rules: unknown): PropertyRule[] | undefined {
    if (Array.isArray(rules) && rules.every((item) => item instanceof PropertyRule)) {
      return rules;
    }
  }

  private setPropertyBinding() {
    let binding: IBinding = this.binding;
    while (!(binding instanceof PropertyBinding) && binding !== void 0) {
      binding = (binding as unknown as BindingInterceptor).binding;
    }
    if (binding === void 0) {
      throw new Error('Unable to set property binding');
    }
    this.propertyBinding = binding as BindingWithBehavior;
  }

  private setTarget() {
    const target = this.propertyBinding.target;
    if (DOM.isNodeInstance(target)) {
      this.target = target as HTMLElement;
    } else {
      const controller = (target as CustomElementHost)?.$controller;
      if (controller === void 0) {
        throw new Error('Invalid binding target'); // TODO: use reporter
      }
      this.target = controller.host as HTMLElement;
    }
  }

  private setTriggerEvent(trigger: ValidationTrigger) {
    let triggerEvent: 'blur' | 'focusout' | null = null;
    switch (trigger) {
      case ValidationTrigger.blur:
      case ValidationTrigger.changeOrBlur:
        triggerEvent = 'blur';
        break;
      case ValidationTrigger.focusout:
      case ValidationTrigger.changeOrFocusout:
        triggerEvent = 'focusout';
        break;
    }
    return this.triggerEvent = triggerEvent;
  }

  private setBindingInfo(rules: PropertyRule[] | undefined): BindingInfo {
    return this.bindingInfo = new BindingInfo(this.target, this.scope, rules);
  }
}

class ValidateArgumentsDelta {
  public constructor(
    public controller?: ValidationController,
    public trigger?: ValidationTrigger,
    public rules?: PropertyRule[],
  ) { }
}
