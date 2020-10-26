import { customElement } from '@aurelia/runtime-html';
import { wait } from '../utils';

@customElement({
  name: 'board',
  template: `THE BIG BOARD! <input>`,
})
export class Board {
  public async enter() {
    return wait(5000);
  }
}
