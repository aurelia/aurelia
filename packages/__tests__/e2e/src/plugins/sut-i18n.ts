import { customElement } from '@aurelia/runtime';
import template from './sut-i18n.html';

@customElement({ name: 'sut-i18n', template })
export class SutI18N {
  private obj = {
    key: 'simple.text'
  };
}
