import { bindingBehavior, IScheduler, IScope, LifecycleFlags } from '@aurelia/runtime';
import { PropertyRule } from './rule';
import { BindingWithBehavior, IValidationController, ValidationController, ValidationTrigger } from './validation-controller';

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior {
  public constructor(
    @IValidationController private readonly controller: IValidationController,
    @IScheduler private readonly scheduler: IScheduler
  ) { }

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    // binding.
    const locator = binding.locator;
    // identify the target element.
    const target: Element = binding.target as Element; // TODO need additional processing for CE, and CA.
    const [trigger, controller, rules] = this.processBindingExpressionArgs(flags, scope, binding);

    controller.registerBinding(binding, target, rules);
    // TODO intercept binding

    // binding.validationController = controller;
    // tslint:disable-next-line:no-bitwise
    // if (trigger & validateTrigger.change) {
    //   binding.vbbUpdateSource = binding.updateSource;
    //   // tslint:disable-next-line:only-arrow-functions
    //   // tslint:disable-next-line:space-before-function-paren
    //   binding.updateSource = function (value: any) {
    //     this.vbbUpdateSource(value);
    //     this.validationController.validateBinding(this);
    //   };
    // }

    // // tslint:disable-next-line:no-bitwise
    // if (trigger & validateTrigger.blur) {
    //   binding.validateBlurHandler = () => {
    //     this.scheduler.queueMicroTask(() => controller.validateBinding(binding));
    //   };
    //   binding.validateTarget = target;
    //   target.addEventListener('blur', binding.validateBlurHandler);
    // }

    // if (trigger !== validateTrigger.manual) {
    //   binding.standardUpdateTarget = binding.updateTarget;
    //   // tslint:disable-next-line:only-arrow-functions
    //   // tslint:disable-next-line:space-before-function-paren
    //   binding.updateTarget = function (value: any) {
    //     this.standardUpdateTarget(value);
    //     this.validationController.resetBinding(this);
    //   };
    // }
  }

  public unbind(binding: any) {
    // TODO
    // // reset the binding to it's original state.
    // if (binding.vbbUpdateSource) {
    //   binding.updateSource = binding.vbbUpdateSource;
    //   binding.vbbUpdateSource = null;
    // }
    // if (binding.standardUpdateTarget) {
    //   binding.updateTarget = binding.standardUpdateTarget;
    //   binding.standardUpdateTarget = null;
    // }
    // if (binding.validateBlurHandler) {
    //   binding.validateTarget.removeEventListener('blur', binding.validateBlurHandler);
    //   binding.validateBlurHandler = null;
    //   binding.validateTarget = null;
    // }
    // binding.validationController.unregisterBinding(binding);
    // binding.validationController = null;
  }

  private processBindingExpressionArgs(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior): [ValidationTrigger, IValidationController, PropertyRule[]] {
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
    if (controller === void 0) {
      controller = this.controller;
    }
    if (trigger === void 0) {
      trigger = controller.trigger;
    }
    return [trigger, controller, rules];
  }
}
