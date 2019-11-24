import { IScheduler, LifecycleFlags, IScope, IBinding } from '@aurelia/runtime';
// import { getTargetDOMElement } from './get-target-dom-element';
import { validateTrigger } from './validate-trigger';
import { ValidationController } from './validation-controller';
import { optional } from '@aurelia/kernel';

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
export abstract class ValidateBindingBehaviorBase {
  public constructor(@IScheduler private readonly scheduler: IScheduler) { }

  protected abstract getValidateTrigger(controller: ValidationController): validateTrigger;

  public bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, source: any,
    // rulesOrController?: ValidationController | any, rules?: any
  ) {
    // TODO
    // // identify the target element.
    // const target = getTargetDOMElement(binding, source);

    // // locate the controller.
    // let controller: ValidationController;
    // if (rulesOrController instanceof ValidationController) {
    //   controller = rulesOrController;
    // } else {
    //   controller = optional(ValidationController)();
    //   rules = rulesOrController;
    // }
    // if (controller === null) {
    //   throw new Error(`A ValidationController has not been registered.`);
    // }

    // controller.registerBinding(binding, target, rules);
    // binding.validationController = controller;
    // const trigger = this.getValidateTrigger(controller);
    // // tslint:disable-next-line:no-bitwise
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
}
