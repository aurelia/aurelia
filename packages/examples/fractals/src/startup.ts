import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { IContainer } from '@aurelia/kernel';
import { register } from '@aurelia/plugin-svg';
import { State } from './state';
import { Pythagoras } from './pythagoras';

window['App'] = App;
window['Pythagoras'] = Pythagoras;

let state: State;
const au = window['au'] = new Aurelia()
  .register(
    {
      register(container: IContainer) {
        state = container.get(State);
        register(container);
      }
    },
    BasicConfiguration,
    Pythagoras as any
  )
  .app({ host: document.querySelector('app'), component: new App(state) });
au
  .start();
