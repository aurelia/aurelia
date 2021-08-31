import { customElement, IRouter, route } from 'aurelia';
import template from './app.html';

@route({
  routes: [
    { id: 'home', path: '', component: import('./pages/home'), title: 'Home' },
    { path: '/auth', component: import('./pages/auth'), title: 'Sign in' },
  ]
})
@customElement({
  name: 'app',
  template,
})
export class App {
  public static inject = [IRouter];
  public message = 'Hello World!';

  constructor(public router: IRouter) {
    window['app'] = this;
  }
}
