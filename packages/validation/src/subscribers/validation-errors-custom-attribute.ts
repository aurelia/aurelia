import { IContainer } from '@aurelia/kernel';
import { bindable, BindingMode, customAttribute, INode } from '@aurelia/runtime';
import { IValidationController, ValidationErrorsSubscriber, ValidationEvent, ValidationResultTarget } from '../validation-controller';

@customAttribute('validation-errors')
export class ValidationErrorsCustomAttribute implements ValidationErrorsSubscriber {

  @bindable public controller?: IValidationController;

  @bindable({ primary: true, mode: BindingMode.twoWay })
  public errors: ValidationResultTarget[] = [];

  private readonly errorsInternal: ValidationResultTarget[] = [];
  private readonly host: HTMLElement;
  public constructor(@INode host: INode, @IContainer private readonly container: IContainer) {
    this.host = host as HTMLElement;
  }

  public handleValidationEvent(event: ValidationEvent) {
    for (const { result } of event.removedResults) {
      const index = this.errorsInternal.findIndex(x => x.result === result);
      if (index !== -1) {
        this.errorsInternal.splice(index, 1);
      }
    }

    for (const { result, targets: elements } of event.addedResults) {
      if (result.valid) {
        continue;
      }
      const targets = elements.filter(e => this.host.contains(e));
      if (targets.length > 0) {
        this.errorsInternal.push(new ValidationResultTarget(result, targets));
      }
    }

    this.errorsInternal.sort((a, b) => {
      if (a.targets[0] === b.targets[0]) {
        return 0;
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return a.targets[0].compareDocumentPosition(b.targets[0]) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
    });
    this.errors = this.errorsInternal;
  }

  public beforeBind() {
    this.controller = this.controller ?? this.container.get(IValidationController);
    this.controller.addSubscriber(this);
  }

  public beforeUnbind() {
    this.controller!.removeSubscriber(this);
  }
}
