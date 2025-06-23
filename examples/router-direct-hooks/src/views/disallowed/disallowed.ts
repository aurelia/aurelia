import { customElement } from '@aurelia/runtime-html';
import template from './disallowed.html';
import { IRouteableComponent } from '@aurelia/router-direct';

@customElement({
  name: 'disallowed',
  template,
})
export class Disallowed implements IRouteableComponent { }
