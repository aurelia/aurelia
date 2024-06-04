import { bindable, customElement } from 'aurelia';
import template from './my-text.html?raw';

@customElement({ name: 'my-text', template })
export class MyText {
  @bindable text: unknown;
}
