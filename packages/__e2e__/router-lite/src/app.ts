import { IRouter, route } from '@aurelia/router-lite';
import { customElement } from 'aurelia';
import template from './app.html';
// import { Auth } from './pages/auth';
import { Home } from './pages/home';

@route({
  routes: [
    { id: 'home', path: '', component: Home, title: 'Home' },
    { path: 'auth', component: import('./pages/auth').then(x => x.Auth), title: 'Sign in' },
  ]
})
@customElement({
  name: 'app',
  template,
})
export class App {
  public static inject = [IRouter];
  public message = 'Hello World!';
  public iframeSrc: string;
  public iframeVisible: boolean;

  constructor(public router: IRouter) {
    window['app'] = this;
  }

  toggleIframe() {
    if (!this.iframeVisible) {
      this.iframeSrc = URL.createObjectURL(new Blob([
        `<html><head></head><body><a target="_top" href="${origin}/auth">Goto auth</a></body>`],
        { type: 'text/html' }
      ));
    }
    this.iframeVisible = !this.iframeVisible;
  }
}
