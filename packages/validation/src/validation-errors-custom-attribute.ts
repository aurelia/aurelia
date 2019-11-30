import { lazy } from '@aurelia/kernel';
import { bindable, BindingMode, customAttribute, INode } from '@aurelia/runtime';
import { ValidationController } from './validation-controller';
import { RenderInstruction, ValidationRenderer } from './validation-renderer';
import { ValidationResult } from './rule';

export interface RenderedError {
  error: ValidationResult;
  targets: Element[];
}

@customAttribute('validation-errors')
export class ValidationErrorsCustomAttribute implements ValidationRenderer {

  @bindable({ mode: BindingMode.fromView })
  public controller: ValidationController | null = null;

  @bindable({ primary: true, mode: BindingMode.twoWay })
  public errors: RenderedError[] = [];

  private readonly errorsInternal: RenderedError[] = [];
  private readonly controllerAccessor: () => ValidationController = lazy(ValidationController);
  private readonly boundaryElement: HTMLElement;

  public constructor(
    @INode node: INode,
  ) {
    this.boundaryElement = node as HTMLElement;
  }

  public sort() {
    this.errorsInternal.sort((a, b) => {
      if (a.targets[0] === b.targets[0]) {
        return 0;
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return a.targets[0].compareDocumentPosition(b.targets[0]) & 2 ? 1 : -1;
    });
  }

  public render(instruction: RenderInstruction) {
    for (const { result } of instruction.unrender) {
      const index = this.errorsInternal.findIndex(x => x.error === result);
      if (index !== -1) {
        this.errorsInternal.splice(index, 1);
      }
    }

    for (const { result, elements } of instruction.render) {
      if (result.valid) {
        continue;
      }
      const targets = elements.filter(e => this.boundaryElement.contains(e));
      if (targets.length > 0) {
        this.errorsInternal.push({ error: result, targets });
      }
    }

    this.sort();
    this.errors = this.errorsInternal;
  }

  public bind() {
    if (!this.controller) {
      this.controller = this.controllerAccessor();
    }
    // this will call render() with the side-effect of updating this.errors
    this.controller.addRenderer(this);
  }

  public unbind() {
    if (this.controller) {
      this.controller.removeRenderer(this);
    }
  }
}
