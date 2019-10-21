import { customElement, bindable } from '@aurelia/runtime';
import * as template from './checkbox-list.html';

@customElement({ name: 'checkbox-list', template })
export class CheckboxList {
  @bindable public choices1: object[];
  @bindable public selectedItems1: object[];

  @bindable public choices2: object[];
  @bindable public selectedItems2: object[];
  @bindable public matcher: (a: object, b: object) => boolean;
}
