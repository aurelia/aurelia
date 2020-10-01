import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: true,
    navigationSyncStates: ['completed', 'guarded', 'guardedLoad', 'guardedUnload', 'swapped'],
  }))
  .app(MyApp)
  .start();
