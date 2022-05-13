import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { AnimationHooks } from './animation-hooks';
import { MyApp } from './my-app';

void Aurelia
  .register(
    RouterConfiguration.customize({ swapOrder: 'detach-attach-simultaneously', }),
    // AnimationHooks,
  )
  .app(MyApp)
  .start();

// const au = new Aurelia()
//   .register(
//     RouterConfiguration.customize({ swapOrder: 'detach-attach-simultaneously', }),
//   );

// au.app({
//   host: document.querySelector('my-app') as HTMLElement,
//   component: MyApp
// });
// void au.start();
