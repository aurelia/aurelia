import { customElement } from '@aurelia/runtime';
import * as template from 'text!./app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
