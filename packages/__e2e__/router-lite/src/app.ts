import { IRouter, route } from '@aurelia/router-lite';
import { customElement } from 'aurelia';
import template from './app.html';
// import { Auth } from './pages/auth';
import { Home } from './pages/home';
import { IRouterEventLoggerService } from './router-event-logger-service';

@route({
  routes: [
    { id: 'home', path: '', component: Home, title: 'Home' },
    { path: 'auth', component: import('./pages/auth').then(x => x.Auth), title: 'Sign in' },
    { path: 'one', component: import('./pages/one'), title: 'One' },
    { path: 'two', component: import('./pages/two'), title: 'Two' },
  ]
})
@customElement({
  name: 'app',
  template,
})
export class App {
  public static inject = [IRouter, IRouterEventLoggerService];
  public message = 'Hello World!';
  public iframeSrc: string;
  public iframeVisible: boolean;

  constructor(
    public router: IRouter,
    private readonly service: IRouterEventLoggerService,
  ) {
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
