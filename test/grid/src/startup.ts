import * as faker from 'faker';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { App } from './app';
import { DI } from '@aurelia/kernel';

window['faker'] = faker;

const container = DI.createContainer().register(
  StandardConfiguration,
);

const au = window['au'] = new Aurelia(container);
au.app({ host: document.querySelector('app'), component: App });
void au.start();
