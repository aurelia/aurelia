import { JitConfiguration } from '../../../../../jit';
import { DI } from '../../../../../kernel';
import { NavCustomElement, ViewportCustomElement } from '../../../../../router';
import { Aurelia, CustomElement } from '../../../../../runtime';
import { App } from './app';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';
import { GotoCustomElement } from './components/goto';

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

const container = DI.createContainer();
container.register(JitConfiguration,
                   ViewportCustomElement as any,
                   NavCustomElement as any,
                   GotoCustomElement as any,
                   App as any,
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
const component = container.get(CustomElement.keyFrom('app'));

const au = new Aurelia(container);
window['au'] = au;
au.app({ host: document.querySelector('app'), component });
au.start();
