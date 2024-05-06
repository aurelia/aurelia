import Aurelia from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .app({
    host: document.body,
    component: MyApp
  })
  .start();
