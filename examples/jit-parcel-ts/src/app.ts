import { customElement } from 'aurelia';
import template from './app.html';

@customElement({ name: 'app', template })
export class App {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, @typescript-eslint/typedef
  message = 'Hello World!';
}
