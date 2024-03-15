import { optional, resolve } from '@aurelia/kernel';
import { INode, PartialCustomElementDefinition, bindable } from '@aurelia/runtime-html';
import { IValidationController, ValidationEvent, ValidationResultTarget, ValidationResultsSubscriber } from '../validation-controller';
import { compareDocumentPositionFlat } from './common';

export const defaultContainerTemplate = `
<slot></slot>
<slot name='secondary'>
  <span repeat.for="error of errors">
    \${error.result.message}
  </span>
</slot>
`;
export const defaultContainerDefinition: PartialCustomElementDefinition = {
  name: 'validation-container',
  shadowOptions: { mode: 'open' },
  hasSlots: true,
};
export class ValidationContainerCustomElement implements ValidationResultsSubscriber {
  @bindable public controller!: IValidationController;
  @bindable public errors: ValidationResultTarget[] = [];

  private readonly host: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;
  private readonly scopedController: IValidationController = resolve(optional(IValidationController)) as IValidationController;

  public handleValidationEvent(event: ValidationEvent): void {
    for (const { result } of event.removedResults) {
      const index = this.errors.findIndex(x => x.result === result);
      if (index !== -1) {
        this.errors.splice(index, 1);
      }
    }

    for (const { result, targets: elements } of event.addedResults) {
      if (result.valid) {
        continue;
      }
      const targets = elements.filter(e => this.host.contains(e));
      if (targets.length > 0) {
        this.errors.push(new ValidationResultTarget(result, targets));
      }
    }

    this.errors.sort((a, b) => {
      if (a.targets[0] === b.targets[0]) {
        return 0;
      }
      return compareDocumentPositionFlat(a.targets[0], b.targets[0]);
    });
  }

  public binding() {
    this.controller = this.controller ?? this.scopedController;
    this.controller.addSubscriber(this);
  }

  public unbinding() {
    this.controller.removeSubscriber(this);
  }
}
