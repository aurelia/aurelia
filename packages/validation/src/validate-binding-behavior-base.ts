import { IIndexable, InterfaceSymbol, Reporter } from '@aurelia/kernel';
import { IConnectableBinding, IDOM, IExpression, IScope, LifecycleFlags, LifecycleFlags as LF } from '@aurelia/runtime';
import { getTargetDOMElement } from './get-target-dom-element';
import { validateTrigger } from './validate-trigger';
import { ValidationController } from './validation-controller';

export interface IValidatedBinding extends IConnectableBinding {
  sourceExpression: IExpression;
  validateTarget: IIndexable;
  validationController: ValidationController;
  updateTarget(value: unknown, flags: LF): void;
  updateSource(value: unknown, flags: LF): void;
  vbbUpdateSource(value: unknown, flags: LF): void;
  standardUpdateTarget(value: unknown, flags: LF): void;
  validateBlurHandler(event: unknown): void;
}

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
export abstract class ValidateBindingBehaviorBase {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IDOM];

  private readonly dom: IDOM;

  constructor(dom: IDOM) {
    this.dom = dom;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: IValidatedBinding, rulesOrController?: ValidationController | any, rules?: any) {
    // identify the target element.
    const target = getTargetDOMElement(binding, scope);

    // locate the controller.
    let controller: ValidationController;
    if (rulesOrController instanceof ValidationController) {
      controller = rulesOrController;
    } else {
      if (!binding.locator.has(ValidationController, true)) {
        throw Reporter.error(1202); // TODO: create error code // throw new Error(`A ValidationController has not been registered.`);
      }
      controller = binding.locator.get(ValidationController);
      rules = rulesOrController;
    }

    controller.registerBinding(binding, target, rules);
    binding.validationController = controller;
    const trigger = this.getValidateTrigger(controller);
    if (trigger & validateTrigger.change) {
      binding.vbbUpdateSource = binding.updateSource;
      binding.updateSource = function (value: unknown, flags: LF): void {
        this.vbbUpdateSource(value, flags);
        this.validationController.validateBinding(this);
      };
    }

    // tslint:disable-next-line:no-bitwise
    if (trigger & validateTrigger.blur) {
      binding.validateBlurHandler = () => {
        controller.validateBinding(binding);
      };
      binding.validateTarget = target;
      this.dom.addEventListener('blur', binding.validateBlurHandler, target);
    }

    if (trigger !== validateTrigger.manual) {
      binding.standardUpdateTarget = binding.updateTarget;
      binding.updateTarget = function (value: unknown, flags: LF): void {
        this.standardUpdateTarget(value, flags);
        this.validationController.resetBinding(this);
      };
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IValidatedBinding) {
    // reset the binding to it's original state.
    if (binding.vbbUpdateSource) {
      binding.updateSource = binding.vbbUpdateSource;
      binding.vbbUpdateSource = null;
    }
    if (binding.standardUpdateTarget) {
      binding.updateTarget = binding.standardUpdateTarget;
      binding.standardUpdateTarget = null;
    }
    if (binding.validateBlurHandler) {
      binding.validateTarget.removeEventListener('blur', binding.validateBlurHandler);
      binding.validateBlurHandler = null;
      binding.validateTarget = null;
    }
    binding.validationController.unregisterBinding(binding);
    binding.validationController = null;
  }

  protected abstract getValidateTrigger(controller: ValidationController): validateTrigger;
}
