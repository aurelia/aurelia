import { HTMLJitConfiguration } from '../../../../../jit-html/src/index';
import { NavCustomElement, ViewportCustomElement } from '../../../../../router';
import { Aurelia, CustomElement } from '../../../../../runtime';
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
const component = container.get(CustomElement.keyFrom('app'));

const au = new Aurelia(container);
window['au'] = au;
au.app({ host: document.querySelector('app'), component });
au.start();
