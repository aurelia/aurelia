import { customElement } from 'aurelia';

@customElement({ name: 'empty', template: '' })
class Empty {}

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
