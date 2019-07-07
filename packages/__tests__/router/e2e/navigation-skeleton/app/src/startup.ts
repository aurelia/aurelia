import { ChildRouter } from './child-router';
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, IDOM } from '@aurelia/runtime';
import { RouterConfiguration } from '@aurelia/router';
import { registerComponent } from './utils';

import { App } from './app';

import { State } from './state';
import { Welcome, UpperValueConverter } from './welcome';
import { Users } from './users';

const container = BasicConfiguration.createContainer();

container.register(
  App as any,
  State as any,
);
registerComponent(
  container,

  Welcome as any,
  Users as any,
  ChildRouter as any,
  UpperValueConverter as any,
);

window['au'] = new Aurelia(container)
  .register(DebugConfiguration, RouterConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
