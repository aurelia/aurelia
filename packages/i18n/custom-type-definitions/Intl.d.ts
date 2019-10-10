/**
 * This is a temporary type definitions for the missing APIs in Intl.
 * Once those are included in TS lib, this file can be deleted.
 */
declare namespace Intl {
  type TimeUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

  interface RelativeTimeFormatOptions {
    localeMatcher: 'lookup' | 'best fit';
    numeric: 'always' | 'auto';
    style: 'long' | 'short' | 'narrow';
  }
  const defaultOptions: RelativeTimeFormatOptions = {
    localeMatcher: 'best fit',
    numeric: 'always',
    style: 'long'
  }

  class RelativeTimeFormat {
    public constructor(locale?: string | string[], options: RelativeTimeFormatOptions = defaultOptions);
    format(value: number, unit: TimeUnit): string;
  }
}
