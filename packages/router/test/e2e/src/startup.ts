import { DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { App } from './app';
import { ViewportCustomElement } from './components/viewport';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';

const container = DI.createContainer();
container.register(BasicConfiguration, <any>ViewportCustomElement, <any>App, <any>AbcComponent, <any>DefComponent);
const component = container.get(CustomElementResource.keyFrom('app'));

const au = new Aurelia(container);
au.app({ host: document.querySelector('app'), component });
au.start();
