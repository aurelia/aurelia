import { customElement } from '../../../../../../runtime';
import * as template from './calendar.html';

@customElement({ name: 'calendar', template })
export class Calendar {
  public clickDates(event) {
    console.log('LINK', event);
  }
}
