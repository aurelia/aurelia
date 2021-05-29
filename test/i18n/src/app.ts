import { customElement } from '@aurelia/runtime-html';
import template from './app.html';

@customElement({ name: 'app', template })
export class App {
  public readonly message: string = 'Hello World!';
}
