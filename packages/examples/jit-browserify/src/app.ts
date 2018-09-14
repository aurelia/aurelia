
import { customElement } from '@aurelia/runtime';
import * as view from './app.html';

@customElement({
  name: 'app',
  templateOrNode: <any>view,
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: []
})
export class App {

  message = 'Hello World!';
}

