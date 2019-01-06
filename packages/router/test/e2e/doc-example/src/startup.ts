import { DebugConfiguration } from '@aurelia/debug';
import { HTMLJitConfiguration } from '@aurelia/jit-html';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { NavCustomElement, ViewportCustomElement } from '../../../../../router/src/index';
import { App } from './app';

import { About } from './components/about';
import { Author } from './components/author';
import { Authors } from './components/authors';
import { Book } from './components/book';
import { Books } from './components/books';

const container = HTMLJitConfiguration.createContainer();
container.register(
  ViewportCustomElement as any,
  NavCustomElement as any,
  App as any,

  About as any,
  Author as any,
  Authors as any,
  Book as any,
  Books as any,
);
const component = container.get(CustomElementResource.keyFrom('app'));

window['au'] = new Aurelia(container)
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: component })
  .start();
