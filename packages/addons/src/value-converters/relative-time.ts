import { valueConverter } from '@aurelia/runtime-html';


const t = new Intl.RelativeTimeFormat(undefined);


/**
 * A value converter that formats a date/time value as a relative time.
 */
@valueConverter('relativeTime')
export class RelativeTime {
  /**
   * Converts a date/time value to a string representation of its relative time.
   * @param {number|string|undefined} value - The date/time value to convert.
   * @returns {string|null} A string representing the relative time between now and the given date/time value,
   * or 'never' if the value is undefined or null.
   */
  public toView(value?: number | string): string | null {
    if (!value) return 'never';
    const result = this.timeDiff(new Date(), new Date(value));
    return t.format(isFinite(result.difference) ? result.difference * -1 : 0, result.scale);
  }

  /**
   * Calculates the difference between two date/time values in various scales.
   * @param {string|Date} curr - The current date/time value.
   * @param {string|Date} prev - The previous date/time value.
   * @returns {{ difference: number; scale: 'second'|'minute'|'hour'|'day'|'month'|'year' }} An object containing the difference
   * between the two date/time values in one of six scales, along with the appropriate scale.
   */
  private timeDiff(curr: string | Date, prev: string | Date): { difference: number; scale: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' } {
    curr = new Date(curr);
    prev = new Date(prev);

    const ms_Min = 60 * 1000; // milliseconds in Minute
    const ms_Hour = ms_Min * 60; // milliseconds in Hour
    const ms_Day = ms_Hour * 24; // milliseconds in day
    const ms_Mon = ms_Day * 30; // milliseconds in Month
    const ms_Yr = ms_Day * 365; // milliseconds in Year
    const diff = Number(curr) - Number(prev); //difference between dates.

    if (diff < ms_Min) {
      return { difference: Math.round(diff / 1000), scale: 'second' };
    }
    if (diff < ms_Hour) {
      return { difference: Math.round(diff / ms_Min), scale: 'minute' };
    }
    if (diff < ms_Day) {
      return { difference: Math.round(diff / ms_Hour), scale: 'hour' };
    }
    if (diff < ms_Mon) {
      return { difference: Math.round(diff / ms_Day), scale: 'day' };
    }
    if (diff < ms_Yr) {
      return { difference: Math.round(diff / ms_Mon), scale: 'month' };
    }
    return { difference: Math.round(diff / ms_Yr), scale: 'year' };
  }
}
