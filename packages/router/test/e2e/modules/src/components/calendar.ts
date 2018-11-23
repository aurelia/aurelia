import { customElement } from '@aurelia/runtime';
import * as template from './calendar.html';

@customElement({ name: 'calendar', template })
export class Calendar {
  clickDates(event) {
    console.log('LINK', event);
  }
}
