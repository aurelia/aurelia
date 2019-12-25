import {
  bindingBehavior,
  IScheduler,
  IScope,
  LifecycleFlags,
  BindingInterceptor,
  IBindingBehaviorExpression,
} from '@aurelia/runtime';
import { PropertyRule } from './rule';
import {
  BindingWithBehavior,
  IValidationController,
  ValidationController,
} from './validation-controller';
import { IContainer } from '@aurelia/kernel';

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior extends BindingInterceptor {
  private rules: PropertyRule[] = [];
  private target: HTMLElement = (void 0)!;
  private controller!: IValidationController;
  private isChangeTrigger!: boolean;

  public constructor(
    @IContainer private readonly container: IContainer,
    @IScheduler private readonly scheduler: IScheduler,
    public readonly binding: BindingWithBehavior,
    expr: IBindingBehaviorExpression,
  ) {
    super(binding, expr);
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
    this.binding.$bind(flags, scope, part);

    // identify the target element.
    const target = this.target = this.binding.target as HTMLElement; // TODO need additional processing for CE, and CA.
    const trigger = this.processBindingExpressionArgs(flags, scope);
    this.isChangeTrigger = trigger === ValidationTrigger.change || trigger === ValidationTrigger.changeOrBlur;

    this.controller.registerBinding(this.binding, target, scope, this.rules);
    if (trigger === ValidationTrigger.blur || trigger === ValidationTrigger.changeOrBlur) {
      target.addEventListener('blur', this);
    }
  }

  public $unbind(flags: LifecycleFlags) {
    this.target.removeEventListener('blur', this);
    this.controller.deregisterBinding(this.binding);
    this.binding.$unbind(flags);
  }

  private processBindingExpressionArgs(flags: LifecycleFlags, scope: IScope): ValidationTrigger {
    const binding = this.binding;
    const locator = binding.locator;
    let trigger: ValidationTrigger = (void 0)!;
    let controller: IValidationController = (void 0)!;
    let rules: PropertyRule[] = (void 0)!;

    const args = binding.sourceExpression.args;
    for (const arg of args) {
      const temp = arg.evaluate(flags, scope, locator);
      if (typeof temp === 'string') {
        trigger = temp as ValidationTrigger;
      } else if (temp instanceof ValidationController) {
        controller = temp;
      } else if (Array.isArray(temp) && temp.every((item) => item instanceof PropertyRule)) {
        rules = temp;
      } else {
        throw new Error(`Unsupported argument type for binding behavior: ${temp}`);
      }
    }
    if (controller !== void 0) {
      this.controller = controller;
    } else {
      controller = this.controller = this.container.get<IValidationController>(IValidationController);
    }
    if (trigger === void 0) {
      trigger = ValidationTrigger.blur; // default trigger // TODO global configuration options
    }
    this.rules = rules;
    return trigger;
  }

  private validateBinding() {
    this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      await this.controller.validateBinding(this.binding);
    });
  }
}

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
