import { DI, IContainer } from '@aurelia/kernel';
import {
  bindingBehavior,
  BindingInterceptor,
  BindingMediator,
  IBindingBehaviorExpression,
  IsAssign,
  IScheduler,
  IScope,
  LifecycleFlags
} from '@aurelia/runtime';
import { PropertyRule } from './rule';
import { BindingWithBehavior, IValidationController, ValidationController } from './validation-controller';

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

/* @internal */
export const IDefaultTrigger = DI.createInterface<ValidationTrigger>('IDefaultTrigger').noDefault();

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior extends BindingInterceptor {
  private target: HTMLElement = (void 0)!;
  private controller!: IValidationController;
  private isChangeTrigger!: boolean;
  private readonly scheduler: IScheduler;
  private readonly defaultTrigger: ValidationTrigger;
  private readonly connectedExpressions: IsAssign[] = [];
  private scope!: IScope;
  private readonly triggerMediator: BindingMediator<'handleTriggerChange'> = new BindingMediator('handleTriggerChange', this, this.observerLocator, this.locator);
  private readonly controllerMediator: BindingMediator<'handleControllerChange'> = new BindingMediator('handleControllerChange', this, this.observerLocator, this.locator);
  private readonly rulesMediator: BindingMediator<'handleRulesChange'> = new BindingMediator('handleRulesChange', this, this.observerLocator, this.locator);

  public constructor(
    @IContainer private readonly container: IContainer,
    public readonly binding: BindingWithBehavior,
    expr: IBindingBehaviorExpression,
  ) {
    super(binding, expr);
    this.scheduler = container.get(IScheduler);
    this.defaultTrigger = container.get(IDefaultTrigger);
  }

  public updateSource(value: unknown, flags: LifecycleFlags) {
    super.updateSource(value, flags);
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

    // identify the target element.
    this.target = this.binding.target as HTMLElement; // TODO need additional processing for CE, and CA.
    const [trigger, rules] = this.processBindingExpressionArgs(flags);
    this.processDelta(new Delta(void 0, trigger, rules));
  }

  public $unbind(flags: LifecycleFlags) {
    this.processDelta(void 0);
    this.binding.$unbind(flags);
    for (const expr of this.connectedExpressions) {
      if (expr.unbind !== void 0) {
        expr.unbind(flags, this.scope, this);
      }
    }
  }

  public handleTriggerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this.processDelta(new Delta(void 0, newValue as ValidationTrigger, void 0));
  }

  public handleControllerChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    console.log('controller changed', newValue, _previousValue);
    this.processDelta(new Delta(newValue as ValidationController, void 0, void 0));
  }

  public handleRulesChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    console.log('rules changed', newValue, _previousValue);
    this.processDelta(new Delta(void 0, void 0, newValue as PropertyRule[]));
  }

  private processBindingExpressionArgs(flags: LifecycleFlags): [ValidationTrigger, PropertyRule[]?] {
    const binding = this.binding;
    const scope: IScope = this.scope;
    const locator = binding.locator;
    let trigger: ValidationTrigger = (void 0)!;
    let controller: IValidationController = (void 0)!;
    let rules: PropertyRule[] | undefined;

    const args = binding.sourceExpression.args;
    for (const arg of args) {
      const temp = arg.evaluate(flags, scope, locator);
      if (typeof temp === 'string') {
        trigger = temp as ValidationTrigger;
        arg.connect(flags, scope, this.triggerMediator);
      } else if (temp instanceof ValidationController) {
        controller = temp;
        arg.connect(flags, scope, this.controllerMediator);
      } else if (Array.isArray(temp) && temp.every((item) => item instanceof PropertyRule)) {
        rules = temp;
        arg.connect(flags, scope, this.rulesMediator);
      } else {
        throw new Error(`Unsupported argument type for binding behavior: ${temp}`);
      }
      this.connectedExpressions.push(arg);
    }
    if (controller !== void 0) {
      this.controller = controller;
    } else {
      controller = this.controller = this.container.get<IValidationController>(IValidationController);
    }
    if (trigger === void 0) {
      trigger = this.defaultTrigger;
    }
    return [trigger, rules];
  }

  private validateBinding() {
    this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      await this.controller.validateBinding(this.binding);
    });
  }

  private processDelta(delta?: Delta) {
    if (this.target !== void 0) {
      this.target.removeEventListener('blur', this);
    }
    if (this.controller !== void 0) {
      this.controller.deregisterBinding(this.binding);
    }
    if (delta === void 0) { return; }

    const trigger = delta.trigger;
    const rules = delta.rules;
    const controller = delta.controller;
    if (trigger !== void 0) {
      this.isChangeTrigger = trigger === ValidationTrigger.change || trigger === ValidationTrigger.changeOrBlur;
    }
    if (controller !== void 0) {
      this.controller = controller;
    }

    this.controller.registerBinding(this.binding, this.target, this.scope, rules);
    if (trigger === ValidationTrigger.blur || trigger === ValidationTrigger.changeOrBlur) {
      this.target.addEventListener('blur', this);
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
