import { DebugConfiguration } from '@aurelia/debug';
import { HTMLJitConfiguration } from '@aurelia/jit-html';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { NavCustomElement, ViewportCustomElement } from '../../../../../router/src/index';
import { App } from './app';

import { Tracer } from '@aurelia/kernel';
import { About } from './components/about';
import { Board } from './components/board';
import { Cancel } from './components/cancel';
import { Contact } from './components/contact';
import { Contacts } from './components/contacts';
import { Delayed } from './components/delayed';
import { Game } from './components/game';
import { Inventory } from './components/inventory';
import { Lobby } from './components/lobby';
import { enableTracing, TraceWriter } from './tracing';

enableTracing();
Tracer.enableLiveLogging(TraceWriter);

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
  Delayed as any,
  Cancel as any,
);
const component = container.get(CustomElement.keyFrom('app'));

window['au'] = new Aurelia(container)
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: component })
  .start();
