import { customElement } from 'aurelia';
import * as template from './app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
