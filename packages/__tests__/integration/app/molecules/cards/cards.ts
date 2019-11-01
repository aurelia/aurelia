/* eslint-disable jsdoc/check-indentation */
import { bindable, CustomElement, PartialCustomElementDefinition } from '@aurelia/runtime';
import { styles } from '@aurelia/runtime-html';
import * as css from './cards.css';
import * as template from './cards.html';

export interface Card {
  header: string;
  details: string;
}

/**
 * Potential coverage target
 * - `runtime-html`
 *    - `css-modules-registry`
 */
export class Cards {

  public static customize(useCSSModule: boolean) {
    /**
     * Note that this is done only for testing.
     * Normally, this goes like this: `@customElement({ name: 'cards', template, dependencies: [styles(css)] })`.
     */
    const defn: PartialCustomElementDefinition = { name: 'cards', template, dependencies: useCSSModule ? [styles(css)] : undefined };
    return CustomElement.define(defn, Cards);
  }

  @bindable public items: Card[];
  @bindable public selected: Card;

  public select(card: Card) {
    this.selected = card;
  }
}
