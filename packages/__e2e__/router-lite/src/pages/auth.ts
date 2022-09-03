import { customElement } from '@aurelia/runtime-html';
import template from './auth.html';

@customElement({
  name: 'auth',
  template
})
export class Auth {

}

// https://github.com/aurelia/aurelia/issues/1530
export class Foo1530 { }
