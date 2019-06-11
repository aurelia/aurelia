import * as faker from 'faker';

import { Aurelia } from '@aurelia/runtime';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { App } from './app';
import { DI } from '@aurelia/kernel';

window['faker'] = faker;

const container = DI.createContainer().register(
  BasicConfiguration,
);

const au = window['au'] = new Aurelia(container);
au.app({ host: document.querySelector('app'), component: App });
au.start();
