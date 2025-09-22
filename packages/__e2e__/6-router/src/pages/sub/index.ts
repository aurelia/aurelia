import { customElement } from 'aurelia';
import template from './index.html';

@customElement({ name: 'empty', template: '' })
class Empty {}

@customElement({ name: 'sub', template })
export class Sub {
  static routes = [
    {
      path: '',
      component: Empty,
    },
    {
      id: 'details',
      path: ':id',
      component: import('./details'),
    },
  ];
}
