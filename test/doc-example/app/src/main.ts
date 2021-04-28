import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { RouterConfiguration } from 'aurelia-direct-router';
import { MyApp } from './my-app';
import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';

const au = new Aurelia()
  .register(
    StandardConfiguration,
    RouterConfiguration.customize({ swapOrder: 'detach-attach-simultaneously' }),
    LoggerConfiguration.create({ $console: console, level: LogLevel.trace}),
  );

// (au as any).container.resourceResolvers['au:resource:custom-attribute:load'].state.prototype.bound = function () {
//   this.activeClass = 'my-new-load-active-class';
// }

au.app({
  host: document.querySelector('app') as HTMLElement,
  component: MyApp
});
au.start();
