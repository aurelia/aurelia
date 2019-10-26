/* eslint-disable jsdoc/check-indentation */
import { bindable, customElement } from '@aurelia/runtime';
import template from './radio-button-list.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `map-observer`
 * - `@aurelia/runtime-html`
 *   - `checked-observer` (`checked` bind)
 *   - `setter-observer` (`model` bind)
 */
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

  @bindable public choices6: string[];
  @bindable public chosen6: string;

  @bindable public choices7: string[];
  @bindable public chosen7: string;
}
