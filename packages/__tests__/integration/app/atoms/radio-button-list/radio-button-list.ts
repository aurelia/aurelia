/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { bindable, customElement } from '@aurelia/runtime';
import template from './radio-button-list.html';

@customElement({ name: 'radio-button-list', template })
export class RadioButtonList {
  @bindable public group: string = 'choices';

  @bindable public choices1: Map<any, string>;
  @bindable public chosen1: any;

  @bindable public choices2: Map<any, string>;
  @bindable public chosen2: any;

  @bindable public choices3: object[];
  @bindable public chosen3: object;

  @bindable public choices4: object[];
  @bindable public chosen4: object;

  @bindable public choices5: object[];
  @bindable public chosen5: object;

  @bindable public matcher: (a: any, b: any) => boolean;
}
