import { valueConverter } from '@aurelia/runtime-html';
import { I18N } from '../i18n';
import { Signals, ValueConverters } from '../utils';

@valueConverter(ValueConverters.dateFormatValueConverterName)
export class DateFormatValueConverter {
  public readonly signals: string[] = [Signals.I18N_SIGNAL];

  public constructor(
    @I18N private readonly i18n: I18N,
  ) {}

  public toView(value: string | number | Date, options?: Intl.DateTimeFormatOptions, locale?: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if ((!value && value !== 0) || (typeof value === 'string' && value.trim() === '')) {
      return value;
    }

    // convert '0' to 01/01/1970 or ISO string to Date and return the original value if invalid date is constructed
    if (typeof value === 'string') {
      const numValue = Number(value);
      const tempDate = new Date(Number.isInteger(numValue) ? numValue : value);
      if (isNaN(tempDate.getTime())) {
        return value;
      }
      value = tempDate;
    }

    return this.i18n.df(value, options, locale);
  }
}
