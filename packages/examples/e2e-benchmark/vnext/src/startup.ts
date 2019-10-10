import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, ILifecycle } from '@aurelia/runtime';
import { App } from './app';
import { Instrumenter } from './instrumenter';
declare var instrumenter: Instrumenter;

instrumenter.markLifecycle('module-loaded');

const container = JitHtmlBrowserConfiguration.createContainer();
const lifecycle = container.get(ILifecycle);
instrumenter.lifecycle = lifecycle;
const au = window['au'] = new Aurelia(container);

instrumenter.markLifecycle('au-created');

const host = document.querySelector('app');
const component = new App(lifecycle);
const config = { host, component };

au.app(config);

instrumenter.markLifecycle('au-configured');

au.start();

instrumenter.markLifecycle('au-started');
