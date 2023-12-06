import { RouterConfiguration } from '@aurelia/router';
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { DefaultVirtualizationConfiguration, VirtualRepeat } from '@aurelia/ui-virtualization';
import { Scrollbar } from './shared/scrollbar';

VirtualRepeat.prototype['created'] = function () {
  window['virtualRepeat'] = this;
};

Aurelia
  .register(
    RouterConfiguration,
    DefaultVirtualizationConfiguration,
    Scrollbar,
  )
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(MyApp)
  .start();
