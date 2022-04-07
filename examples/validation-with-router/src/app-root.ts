import { route } from '@aurelia/router-lite';
import { customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import template from './app-root.html';

@route({
  routes: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./login'), title: 'Sign in' },
  ],
})
@customElement({ name: 'app-root', template })
export class AppRootCustomElement implements ICustomElementViewModel { }

