import { customElement } from '@aurelia/runtime';
import template from './sut-i18n.html';

@customElement({ name: 'sut-i18n', template })
export class SutI18N {
  public obj = { key: 'simple.text' };
  public dispatchedOn = new Date(2020, 1, 10, 5, 15);
  public deliveredOn = new Date(2021, 1, 10, 5, 15);
}
