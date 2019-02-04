import { TaskQueue } from 'aurelia-task-queue';
import { ValidationController } from './validation-controller';
import { validateTrigger } from './validate-trigger';
import { ValidateBindingBehaviorBase } from './validate-binding-behavior-base';
import { bindingBehavior } from 'aurelia-binding';

/**
 * Binding behavior. Indicates the bound property should be validated
 * when the validate trigger specified by the associated controller's
 * validateTrigger property occurs.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior extends ValidateBindingBehaviorBase {
  public static inject = [TaskQueue];

  public getValidateTrigger(controller: ValidationController) {
    return controller.validateTrigger;
  }
}

/**
 * Binding behavior. Indicates the bound property will be validated
 * manually, by calling controller.validate(). No automatic validation
 * triggered by data-entry or blur will occur.
 */
@bindingBehavior('validateManually')
export class ValidateManuallyBindingBehavior extends ValidateBindingBehaviorBase {
  public static inject = [TaskQueue];

  public getValidateTrigger() {
    return validateTrigger.manual;
  }
}

/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element blurs.
 */
@bindingBehavior('validateOnBlur')
export class ValidateOnBlurBindingBehavior extends ValidateBindingBehaviorBase {
  public static inject = [TaskQueue];

  public getValidateTrigger() {
    return validateTrigger.blur;
  }
}

/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element is changed by the user, causing a change
 * to the model.
 */
@bindingBehavior('validateOnChange')
export class ValidateOnChangeBindingBehavior extends ValidateBindingBehaviorBase {
  public static inject = [TaskQueue];

  public getValidateTrigger() {
    return validateTrigger.change;
  }
}

/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element blurs or is changed by the user, causing
 * a change to the model.
 */
@bindingBehavior('validateOnChangeOrBlur')
export class ValidateOnChangeOrBlurBindingBehavior extends ValidateBindingBehaviorBase {
  public static inject = [TaskQueue];

  public getValidateTrigger() {
    return validateTrigger.changeOrBlur;
  }
}
