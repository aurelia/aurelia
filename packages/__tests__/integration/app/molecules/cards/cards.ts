import { customElement, bindable } from '@aurelia/runtime';
import * as template from './cards.html';
import * as css from './cards.css';
import { styles } from '@aurelia/runtime-html';

export interface Card {
  header: string;
  details: string;
}

/**
 * Potential coverage target
 * - `runtime-html`
 *    - `css-modules-registry`
 */
@customElement({ name: 'cards', template, dependencies: [styles(css)] })
export class Cards {
  @bindable public items: Card[];
  @bindable public selected: Card;

  public select(card: Card) {
    this.selected = card;
  }
}
