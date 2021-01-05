import template from './error-list.html';

import { customElement, ICustomElementViewModel, bindable } from 'aurelia';
import { ErrorList } from '../api';

@customElement({ name: 'error-list', template })
export class ErrorListCustomElement implements ICustomElementViewModel {
  @bindable() errors: ErrorList = [];
}
