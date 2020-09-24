import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: true,
    navigationSyncStates: ['guardedUnload', 'swapped', 'completed', 'guardedLoad', 'guarded'],
  }))
  .app(MyApp)
  .start();
