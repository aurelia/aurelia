import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia } from '@aurelia/runtime';
import { ChildRouter } from './child-router';
import { registerComponent } from './utils';

import { App } from './app';

import { State } from './state';
import { Users } from './users';
import { UpperValueConverter, Welcome } from './welcome';

const container = JitHtmlBrowserConfiguration.createContainer();

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
