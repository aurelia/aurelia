import { NavCustomElement, ViewportCustomElement } from '@aurelia/router';
import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { registerComponent } from './utils';
import { App } from './app';
import { RouterHome } from './components/router/home';
import { RouterWithNav } from './components/router/with-nav';

const container = JitHtmlBrowserConfiguration.createContainer();

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
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
