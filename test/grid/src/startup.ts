import * as faker from 'faker';
import { Aurelia } from '@aurelia/runtime';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { App } from './app';
import { DI } from '@aurelia/kernel';

window['faker'] = faker;

const container = DI.createContainer().register(
  JitHtmlBrowserConfiguration,
);

const au = window['au'] = new Aurelia(container);
au.app({ host: document.querySelector('app'), component: App });
au.start();
