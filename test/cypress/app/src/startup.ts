import { NavCustomElement, ViewportCustomElement } from '@aurelia/router';
import { RuntimeHtmlConfiguration } from '@aurelia/runtime-html';
import { Aurelia } from '@aurelia/runtime';
import { registerComponent } from './utils';
import { App } from './app';
import { RouterHome } from './components/router/home';
import { RouterWithNav } from './components/router/with-nav';

const container = RuntimeHtmlConfiguration.createContainer();

container.register(
  ViewportCustomElement as any,
  NavCustomElement as any
);

registerComponent(
  container,
  RouterHome as any,
  RouterWithNav as any
);

window['au'] = new Aurelia(container)
  .app({ host: document.querySelector('app'), component: App })
  .start();
