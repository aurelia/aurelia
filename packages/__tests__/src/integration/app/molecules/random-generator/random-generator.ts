import template from "./random-generator.html";
import { customElement } from '@aurelia/runtime-html';

/**
 * Potential coverage target
 * - `runtime-html`
 *    - Binding behaviors
 *      - `attr`
 *      - `self`
 */
@customElement({ name: 'random-generator', template })
export class RandomGenerator {
  public random: number;

  public constructor() {
    this.generate();
  }

  public generate(): void {
    this.random = Math.round(Math.random() * 10000);
  }

  public doSomething(): void {
    // console.log('random-generator.ts__doSomething()');
  }
}
