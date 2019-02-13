import { Registration } from '@aurelia/kernel';
import { NavCustomElement, ViewportCustomElement } from '@aurelia/router';
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';

import { App } from './app';

import { RouterHome } from './components/router/home';
import { registerComponent } from './utils';

const container = BasicConfiguration.createContainer();

container.register(
  ViewportCustomElement as any,
  NavCustomElement as any,
  App as any
);

registerComponent(
  container,
  RouterHome as any
);

window['au'] = new Aurelia()
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
