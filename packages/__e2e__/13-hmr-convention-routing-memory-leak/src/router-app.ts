import { route } from '@aurelia/router';
import { P1 } from './p-1';
import { P2 } from './p-2';

@route({
  routes: [
    { path: '', redirectTo: 'p-1' },
    { path: 'p-1', component: P1/* import('./p-1') */ },
    { path: 'p-2', component: P2/* import('./p-2') */ },
  ],
})
export class RouterApp {
  public message = 'Hello World!';
}
