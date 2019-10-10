import { customAttribute, INode, bindable, BindingMode } from '@aurelia/runtime';

@customAttribute('goto')
export class GotoCustomAttribute {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private hasHref: boolean | null = null;
  public constructor(
    @INode private readonly element: HTMLElement,
  ) { }

  public binding(): void {
    this.updateValue();
  }

  public valueChanged(newValue: unknown): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.element.setAttribute('href', value);
    }
  }
}
