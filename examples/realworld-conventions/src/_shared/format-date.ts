import { valueConverter } from 'aurelia';

@valueConverter('date')
export class FormatDateValueConverter {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
  static format = Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  toView(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return 'Invalid Date';
    }
    return FormatDateValueConverter.format.format(date);
  }
}
