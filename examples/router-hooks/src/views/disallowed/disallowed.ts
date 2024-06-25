import { customElement } from '@aurelia/runtime-html';
import template from './disallowed.html';
import { IRoute, IRouteableComponent } from '@aurelia/router';

@customElement({
  name: 'disallowed',
  template,
})
export class Disallowed implements IRouteableComponent { }
