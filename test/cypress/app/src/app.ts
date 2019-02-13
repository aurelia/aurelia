import { customElement } from '@aurelia/runtime';
import template from './app.html';

@customElement({ name: 'app', template })
export class App {
  message = 'Hello World!';
}
