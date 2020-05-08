import { customElement } from '@aurelia/runtime';
import * as template from './calendar.html';
import { ILogger } from 'aurelia';

@customElement({ name: 'calendar', template })
export class Calendar {
  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
  }
  public clickDates(event) {
    this.logger.debug('LINK', event);
  }
}
