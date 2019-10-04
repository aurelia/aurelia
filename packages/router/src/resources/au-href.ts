import { customAttribute, INode, bindable, BindingMode } from '@aurelia/runtime';

@customAttribute('au-href')
export class AuHrefCustomAttribute {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private hasHref: boolean | null = null;
  constructor(
    @INode private readonly element: HTMLElement,
  ) { }

  public bound() {
    this.updateValue();
  }

  public valueChanged(newValue: unknown): void {
    this.updateValue();
  }

  private updateValue() {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    Reflect.set(this.element, '$auHref', this.value);
    if (!this.hasHref) {
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value)
      this.element.setAttribute('href', value);
    }
  }
}
