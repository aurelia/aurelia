import { DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { App } from './app';
import { ViewportCustomElement } from '../../../../src/resources/viewport';
import { NavCustomElement } from '../../../../src/resources/nav';
import { GotoCustomElement } from './components/goto';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';

import { Email } from './components/email';
import { Calendar } from './components/calendar';
import { About } from './components/about';
import { Contacts } from './components/contacts';
import { Inbox } from './components/inbox';
import { Schedule } from './components/schedule';
import { Dates } from './components/dates';
import { Recursive } from './components/recursive';
import { Header } from './components/header';

import { One } from './components/one';
import { Two } from './components/two';
import { Three } from './components/three';

import { Sub } from './components/sub';
import { Alpha } from './components/alpha';
import { Beta } from './components/beta';

const container = DI.createContainer();
container.register(BasicConfiguration,
  <any>ViewportCustomElement,
  <any>NavCustomElement,
  <any>GotoCustomElement,
  <any>App,
  <any>AbcComponent,
  <any>DefComponent,

  <any>Email,
  <any>Calendar,
  <any>About,
  <any>Contacts,
  <any>Inbox,
  <any>Schedule,
  <any>Dates,
  <any>Recursive,
  <any>Header,

  <any>One,
  <any>Two,
  <any>Three,

  <any>Sub,
  <any>Alpha,
  <any>Beta,
);
const component = container.get(CustomElementResource.keyFrom('app'));

const au = new Aurelia(container);
window['au'] = au;
au.app({ host: document.querySelector('app'), component });
au.start();
