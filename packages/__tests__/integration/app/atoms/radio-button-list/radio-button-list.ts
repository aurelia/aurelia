/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { bindable, customElement } from '@aurelia/runtime';
import template from './radio-button-list.html';

@customElement({ name: 'radio-button-list', template })
export class RadioButtonList {
  @bindable public choices: Map<any, string>;
  @bindable public chosen: any;
  @bindable public group: string = 'choices';
}
