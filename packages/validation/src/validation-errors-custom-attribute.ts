import { bindingMode } from 'aurelia-binding';
import { Lazy } from 'aurelia-dependency-injection';
import { customAttribute, bindable } from 'aurelia-templating';
import { ValidationController } from './validation-controller';
import { ValidateResult } from './validate-result';
import { ValidationRenderer, RenderInstruction } from './validation-renderer';
import { DOM } from 'aurelia-pal';

export interface RenderedError {
  error: ValidateResult;
  targets: Element[];
}

@customAttribute('validation-errors')
export class ValidationErrorsCustomAttribute implements ValidationRenderer {

  public static inject() {
    return [DOM.Element, Lazy.of(ValidationController)];
  }

  @bindable({ defaultBindingMode: bindingMode.oneWay })
  public controller: ValidationController | null = null;

  @bindable({ primaryProperty: true, defaultBindingMode: bindingMode.twoWay })
  public errors: RenderedError[] = [];

  private errorsInternal: RenderedError[] = [];

  constructor(private boundaryElement: Element, private controllerAccessor: () => ValidationController) {
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

  public interestingElements(elements: Element[]): Element[] {
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
