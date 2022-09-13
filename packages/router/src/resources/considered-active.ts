import { BindingMode, customAttribute, bindable, ICustomAttributeViewModel } from '@aurelia/runtime-html';

@customAttribute('considered-active')
export class ConsideredActiveCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;
}
