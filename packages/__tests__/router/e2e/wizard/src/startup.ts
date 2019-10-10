import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { registerComponent } from './utils';

import { NavCustomElement, ViewportCustomElement } from '../../../../../router/src/index';
import { GotoCustomElement } from './components/goto';
import { State } from './state';

import { App } from './app';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';

import { About } from './components/about';
import { Calendar } from './components/calendar';
import { Contacts } from './components/contacts';
import { Dates } from './components/dates';
import { Email } from './components/email';
import { Header } from './components/header';
import { Inbox } from './components/inbox';
import { Recursive } from './components/recursive';
import { Schedule } from './components/schedule';

import { One } from './components/one';
import { Three } from './components/three';
import { Two } from './components/two';

import { Alpha } from './components/alpha';
import { Beta } from './components/beta';
import { Sub } from './components/sub';

const container = JitHtmlBrowserConfiguration.createContainer();

container.register(
  ViewportCustomElement as any,
  NavCustomElement as any,
  GotoCustomElement as any,
  App as any,
  State as any,
);
registerComponent(
  container,
  AbcComponent as any,
  DefComponent as any,

  Email as any,
  Calendar as any,
  About as any,
  Contacts as any,
  Inbox as any,
  Schedule as any,
  Dates as any,
  Recursive as any,
  Header as any,

  One as any,
  Two as any,
  Three as any,

  Sub as any,
  Alpha as any,
  Beta as any,
);

window['au'] = new Aurelia(container)
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
