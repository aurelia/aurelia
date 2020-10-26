import { NavCustomElement, ViewportCustomElement } from '@aurelia/router';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { registerComponent } from './utils';
import { App } from './app';
import { RouterHome } from './components/router/home';
import { RouterWithNav } from './components/router/with-nav';

const container = StandardConfiguration.createContainer();

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
