import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
    .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
    .app(MyApp)
    .start();
