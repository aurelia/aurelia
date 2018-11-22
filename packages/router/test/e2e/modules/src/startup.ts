import { DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { App } from './app';
import { ViewportCustomElement } from './components/viewport';
import { GotoCustomElement } from './components/goto';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';
import { MasterComponent } from './components/master-component';
import { DetailComponent } from './components/detail-component';
import { ContentComponent } from './components/content-component';
import { Content2Component } from './components/content2-component';
import { Content3Component } from './components/content3-component';

const container = DI.createContainer();
container.register(BasicConfiguration,
  <any>ViewportCustomElement,
  <any>GotoCustomElement,
  <any>App,
  <any>AbcComponent,
  <any>DefComponent,
  <any>MasterComponent,
  <any>DetailComponent,
  <any>ContentComponent,
  <any>Content2Component,
  <any>Content3Component,
);
const component = container.get(CustomElementResource.keyFrom('app'));

const au = new Aurelia(container);
window['au'] = au;
au.app({ host: document.querySelector('app'), component });
au.start();
