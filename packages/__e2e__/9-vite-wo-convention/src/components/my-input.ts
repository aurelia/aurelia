import { bindable, customElement } from '@aurelia/runtime-html';
import template from './my-input.html?raw';

@customElement({ name: 'my-input', template })
export class MyInput {
  @bindable value = '';
}
