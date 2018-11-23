import 'pixi.js';
import { Aurelia } from '@aurelia/runtime-pixi';
import { DebugConfiguration } from '@aurelia/debug';
import { App } from './app';
import { BasicConfiguration } from './registration';

const au = window['au'] = new Aurelia()
  .register(
    BasicConfiguration,
    DebugConfiguration,
  )
  .app({
    host: document.querySelector('app'),
    component: App,
    pixi: {
      backgroundColor: 0xcecece,
      width: 256,
      height: 256,      
    }
  })
  .start();
