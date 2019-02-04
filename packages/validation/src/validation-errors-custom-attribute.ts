import { BindingMode,customAttribute, bindable, INode } from '@aurelia/runtime';
import { ValidationController } from './validation-controller';
import { ValidateResult } from './validate-result';
import { ValidationRenderer, RenderInstruction } from './validation-renderer';

export interface RenderedError {
  error: ValidateResult;
  targets: INode[];
}

@customAttribute('validation-errors')
export class ValidationErrorsCustomAttribute implements ValidationRenderer {

  public static inject() {
    return [INode, Lazy.of(ValidationController)];
  }

  @bindable({ primaryProperty: true, mode: BindingMode.twoWay })
  public errors: RenderedError[] = [];

  @bindable({ mode: BindingMode.toView })
  public controller: ValidationController | null = null;

  private errorsInternal: RenderedError[] = [];

  constructor(private boundaryElement: INode, private controllerAccessor: () => ValidationController) {
  }

  public sort() {
    this.errorsInternal.sort((a, b) => {
      if (a.targets[0] === b.targets[0]) {
        return 0;
      }
      // tslint:disable-next-line:no-bitwise
      return a.targets[0].compareDocumentPosition(b.targets[0]) & 2 ? 1 : -1;
    });
  }

  public interestingElements(elements: INode[]): INode[] {
    return elements.filter(e => this.boundaryElement.contains(e));
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
      const targets = this.interestingElements(elements);
      if (targets.length) {
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
