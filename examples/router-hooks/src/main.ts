import { RouterConfiguration } from '@aurelia/router';
import Aurelia /*, { StyleConfiguration }*/ from 'aurelia';
import { TheHook } from './infra/hook';
import { TheSecondHook } from './infra/second-hook';
import { MyApp } from './my-app';
// Css files imported in this main file are NOT processed by style-loader
// They are for sharedStyles in shadowDOM.
// However, css files imported in other js/ts files are processed by style-loader.
// import shared from './shared.scss';

Aurelia
  /*
.register(StyleConfiguration.shadowDOM({
  // optionally add the shared styles for all components
  sharedStyles: [shared]
}))
*/
  .register(
    RouterConfiguration.customize({
      useUrlFragmentHash: false,
      useHref: false,
      navigationSyncStates: ['guardedUnload', 'swapped', 'completed'],
    }),
    TheHook,
    TheSecondHook
  )
  // To use HTML5 pushState routes, replace previous line with the following
  // customized router config.
  // .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(MyApp)
  .start();
