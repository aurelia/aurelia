import { IRouter } from '@aurelia/router-lite';
import template from './app.html';
import { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';
import { Home } from './pages/home';
import { IRouterEventLoggerService } from './router-event-logger-service';

export class App {
  static $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'app',
    template
  };
  static routes =  [
    { id: 'home', path: '', component: Home, title: 'Home' },
    { path: 'auth', component: import('./pages/auth').then(x => x.Auth), title: 'Sign in' },
    { path: 'one', component: import('./pages/one'), title: 'One' },
    { path: 'two', component: import('./pages/two'), title: 'Two' },
  ];
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
