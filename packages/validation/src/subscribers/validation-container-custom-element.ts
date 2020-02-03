import { customElement, INode, bindable } from '@aurelia/runtime';
import { ValidationErrorsSubscriber, ValidationEvent, ValidationResultTarget, IValidationController } from '../validation-controller';
import { DOCUMENT_POSITION_PRECEDING } from './common';

@customElement({
  name: 'validation-container',
  shadowOptions: { mode: 'open' },
  hasSlots: true,
  // TODO customize template from plugin registration
  template: `
<slot></slot>
<slot name='secondary'>
  <span repeat.for="error of errors">
    \${error.result.message}
  </span>
</slot>
`
})
export class ValidationContainerCustomElement implements ValidationErrorsSubscriber {
  @bindable public errors: ValidationResultTarget[] = [];
  private readonly host: HTMLElement;

  public constructor(
    @INode host: INode,
    @IValidationController private readonly controller: IValidationController
  ) {
    this.host = host as HTMLElement;
  }

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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return a.targets[0].compareDocumentPosition(b.targets[0]) & DOCUMENT_POSITION_PRECEDING ? 1 : -1;
    });
  }

  public beforeBind() {
    this.controller.addSubscriber(this);
  }

  public beforeUnbind() {
    this.controller.removeSubscriber(this);
  }
}
