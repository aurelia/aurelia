import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { App } from './app';
import { useUrlFragmentHash } from "./config";

Aurelia
  .register(
    RouterConfiguration.customize({
      useUrlFragmentHash,
    }),
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
