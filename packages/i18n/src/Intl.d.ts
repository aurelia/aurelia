declare namespace Intl {
  type TimeUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

  class RelativeTimeFormat {
    constructor(locale: string);
    format(value: number, unit: TimeUnit): string;
  }
}
