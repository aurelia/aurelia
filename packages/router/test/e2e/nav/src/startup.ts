import { DebugConfiguration } from '@aurelia/debug';
import { HTMLJitConfiguration } from '@aurelia/jit-html';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { NavCustomElement, ViewportCustomElement } from '../../../../../router';
import { App } from './app';

import { About } from './components/about';
import { Board } from './components/board';
import { Contact } from './components/contact';
import { Contacts } from './components/contacts';
import { Game } from './components/game';
import { Inventory } from './components/inventory';
import { Lobby } from './components/lobby';

const container = HTMLJitConfiguration.createContainer();
container.register(
  ViewportCustomElement as any,
  NavCustomElement as any,
  App as any,

  Game as any,
  Lobby as any,
  About as any,
  Contacts as any,
  Contact as any,
  Board as any,
  Inventory as any,
);
const component = container.get(CustomElementResource.keyFrom('app'));

window['au'] = new Aurelia(container)
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: component })
  .start();
