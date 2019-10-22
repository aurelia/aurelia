import { customElement } from '@aurelia/runtime';
import * as template from './let-demo-boolean.html';

@customElement({ name: 'let-demo-boolean', template })
export class LetDemoBoolean {
  public a: boolean = false;
  public b: boolean = false;
}
