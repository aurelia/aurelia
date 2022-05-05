import { BindingMode } from '@aurelia/runtime';
import { bindable, customAttribute, INode } from '@aurelia/runtime-html';
import { IValidationController, ValidationResultsSubscriber, ValidationEvent, ValidationResultTarget } from '../validation-controller';
import { compareDocumentPositionFlat } from './common';
import { optional } from '@aurelia/kernel';

/**
 * A validation errors subscriber in form of a custom attribute.
 *
 * It registers itself as a subscriber to the validation controller available for the scope.
 * The target controller can be bound via the `@bindable controller`; when omitted it takes the controller currently registered in the container.
 *
 * The set of errors related to the host element or the children of it , are exposed via the `@bindable errors`.
 *
 * @example
 * ```html
 * <div id="div1" validation-errors.bind="nameErrors">
 *   <input id="target1" type="text" value.two-way="person.name & validate">
 *   <span class="error" repeat.for="errorInfo of nameErrors">
 *     ${errorInfo.result.message}
 *   </span>
 * </div>
 * ```
 */
@customAttribute('validation-errors')
export class ValidationErrorsCustomAttribute implements ValidationResultsSubscriber {

  @bindable public controller?: IValidationController;

  @bindable({ primary: true, mode: BindingMode.twoWay })
  public errors: ValidationResultTarget[] = [];

  private readonly errorsInternal: ValidationResultTarget[] = [];
  public constructor(
    @INode private readonly host: INode<HTMLElement>,
    @optional(IValidationController) private readonly scopedController: IValidationController
  ) {}

  public handleValidationEvent(event: ValidationEvent) {
    for (const { result } of event.removedResults) {
      const index = this.errorsInternal.findIndex((x) => x.result === result);
      if (index !== -1) {
        this.errorsInternal.splice(index, 1);
      }
    }

    for (const { result, targets: elements } of event.addedResults) {
      if (result.valid) {
        continue;
      }
      const targets = elements.filter((e) => this.host.contains(e));
      if (targets.length > 0) {
        this.errorsInternal.push(new ValidationResultTarget(result, targets));
      }
    }

    this.errorsInternal.sort((a, b) => {
      if (a.targets[0] === b.targets[0]) {
        return 0;
      }
      return compareDocumentPositionFlat(a.targets[0], b.targets[0]);
    });
    this.errors = this.errorsInternal;
  }

  public binding() {
    this.controller = this.controller ?? this.scopedController;
    this.controller.addSubscriber(this);
  }

  public unbinding() {
    this.controller!.removeSubscriber(this);
  }
}
