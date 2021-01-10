import { ValueConverter } from '../aurelia.js';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
const format = Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const FormatDate = ValueConverter.define({
  name: 'date',
}, class {
  toView(value) {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return 'Invalid Date';
    }
    return format.format(date);
  }
});
