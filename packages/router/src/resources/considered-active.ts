import { customAttribute, bindable, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { bmToView } from './utils';

@customAttribute('considered-active')
export class ConsideredActiveCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: bmToView })
  public value: unknown;
}
