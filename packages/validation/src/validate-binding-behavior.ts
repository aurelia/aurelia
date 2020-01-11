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
} from '@aurelia/runtime';
import { PropertyRule } from './rule';
import { BindingWithBehavior, IValidationController, ValidationController } from './validation-controller';

/**
 * Validation triggers.
 */
export enum ValidationTrigger {
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

/* @internal */
export const IDefaultTrigger = DI.createInterface<ValidationTrigger>('IDefaultTrigger').noDefault();

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior extends BindingInterceptor {
  private propertyBinding: BindingWithBehavior = (void 0)!;
  private target: HTMLElement = (void 0)!;
  private trigger!: ValidationTrigger;
  private controller!: IValidationController;
  private isChangeTrigger: boolean = false;
  private readonly scheduler: IScheduler;
  private readonly defaultTrigger: ValidationTrigger;
  private readonly connectedExpressions: IsAssign[] = [];
  private scope!: IScope;
  private readonly triggerMediator: BindingMediator<'handleTriggerChange'> = new BindingMediator('handleTriggerChange', this, this.observerLocator, this.locator);
  private readonly controllerMediator: BindingMediator<'handleControllerChange'> = new BindingMediator('handleControllerChange', this, this.observerLocator, this.locator);
  private readonly rulesMediator: BindingMediator<'handleRulesChange'> = new BindingMediator('handleRulesChange', this, this.observerLocator, this.locator);

  public constructor(
    public readonly binding: BindingWithBehavior,
    expr: IBindingBehaviorExpression,
  ) {
    super(binding, expr);
    this.scheduler = this.locator.get(IScheduler);
    this.defaultTrigger = this.locator.get(IDefaultTrigger);
  }

  public updateSource(value: unknown, flags: LifecycleFlags) {
    // TODO need better approach. If done icorrectly may cause infinite loop, stack overflow 💣
    if (this.interceptor !== this) {
      this.interceptor.updateSource(value, flags);
    } else {
      let binding = this as BindingInterceptor;
      while (binding.binding !== void 0) {
        binding = binding.binding as unknown as BindingInterceptor;
      }
      binding.updateSource(value, flags);
    }

    if (this.isChangeTrigger) {
      this.validateBinding();
    }
  }

  public handleEvent(_event: Event) {
    this.validateBinding();
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined) {
    this.scope = scope;
    this.binding.$bind(flags, scope, part);
    this.setPropertyBinding();
    this.setTarget();
    const delta = this.processBindingExpressionArgs(flags);
    this.processDelta(delta);
  }

  public $unbind(flags: LifecycleFlags) {
    this.target?.removeEventListener('blur', this);
    this.controller?.deregisterBinding(this.propertyBinding);
    this.binding.$unbind(flags);
    for (const expr of this.connectedExpressions) {
      if (expr.unbind !== void 0) {
        expr.unbind(flags, this.scope, this);
      }
    }
  }

  public handleTriggerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new Delta(void 0, this.ensureTrigger(newValue), void 0));
  }

  public handleControllerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new Delta(this.ensureController(newValue), void 0, void 0));
  }

  public handleRulesChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new Delta(void 0, void 0, this.ensureRules(newValue)));
  }

  private processBindingExpressionArgs(flags: LifecycleFlags): Delta {
    const scope: IScope = this.scope;
    const locator = this.locator;
    let rules: PropertyRule[] | undefined;
    let trigger: ValidationTrigger | undefined;
    let controller: ValidationController | undefined;

    let expression = this.propertyBinding.sourceExpression;
    while (expression.name !== 'validate' && expression !== void 0) {
      expression = expression.expression as BindingBehaviorExpression;
    }
    const args = expression.args;
    for (let i = 0, ii = args.length; i < ii; i++) {
      const arg = args[i];
      const temp = arg.evaluate(flags, scope, locator);
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
          throw new Error(`Unconsumed argument#${i + 1} for validate binding behavior: ${temp}`); // TODO use reporter
      }
      this.connectedExpressions.push(arg);
    }

    return new Delta(this.ensureController(controller), this.ensureTrigger(trigger), rules);
  }

  private validateBinding() {
    this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      await this.controller.validateBinding(this.propertyBinding);
    });
  }

  private processDelta(delta: Delta) {
    const trigger = delta.trigger ?? this.trigger;
    const controller = delta.controller ?? this.controller;
    const rules = delta.rules;
    if (this.trigger !== trigger) {
      if (this.trigger === ValidationTrigger.blur || this.trigger === ValidationTrigger.changeOrBlur) {
        this.target.removeEventListener('blur', this);
      }
      this.trigger = trigger;
      this.isChangeTrigger = trigger === ValidationTrigger.change || trigger === ValidationTrigger.changeOrBlur;
      if (trigger === ValidationTrigger.blur || trigger === ValidationTrigger.changeOrBlur) {
        this.target.addEventListener('blur', this);
      }
    }
    if (this.controller !== controller || rules !== void 0) {
      this.controller?.deregisterBinding(this.propertyBinding);
      this.controller = controller;
      controller.registerBinding(this.propertyBinding, this.target, this.scope, rules);
    }
  }

  private ensureTrigger(trigger: unknown): ValidationTrigger {
    if (trigger === (void 0) || trigger === null) {
      trigger = this.defaultTrigger;
    } else if (!Object.values(ValidationTrigger).includes(trigger as ValidationTrigger)) {
      throw new Error(`${trigger} is not a supported validation trigger`); // TODO use reporter
    }
    return trigger as ValidationTrigger;
  }

  private ensureController(controller: unknown): ValidationController {
    if (controller === (void 0) || controller === null) {
      controller = this.locator.get(IValidationController);
    } else if (!(controller instanceof ValidationController)) {
      throw new Error(`${controller} is not of type ValidationController`); // TODO use reporter
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
        throw new Error('Invalid binding target'); // TODO use reporter
      }
      this.target = controller.host as HTMLElement;
    }
  }
}

class Delta {
  public constructor(
    public controller?: ValidationController,
    public trigger?: ValidationTrigger,
    public rules?: PropertyRule[]
  ) { }
}
