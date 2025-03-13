import { DI, IContainer, Registration } from 'aurelia';
import { I18N } from '@aurelia/i18n';

/**
 * Options for converting a number to a string using NumberService.toString().
 */
export interface IToStringOptions {
  /**
   * The number of digits to appear after the decimal point.
   */
  fractionDigits?: string | number;
  /**
   * Whether to use grouping separators, such as thousands separators or thousand/million/billion separators.
   */
  useGrouping?: boolean;
  /**
   * Whether the value should be displayed as a percentage.
   */
  isPercentage?: boolean;
  /**
   * Whether the value should be displayed as a currency.
   */
  isCurrency?: boolean;
}

/**
 * An alias for the NumberService class.
 */
export type INumberService = NumberService;

/**
 * A Dependency Injection token for the NumberService class.
 */
export const INumberService = DI.createInterface<INumberService>('NumberService');

/**
 * A utility class for working with numbers and strings.
 */
export class NumberService {
  /**
   * Constructs a new NumberService instance.
   * @param i18n - The I18N service to use for formatting.
   */
  constructor(@I18N private readonly i18n: I18N) {}

  /**
   * Registers the NumberService class with the provided container.
   * @param container - The container to register with.
   */
  public static register(container: IContainer): void {
    container.register(Registration.singleton(INumberService, NumberService));
  }

  /**
   * Converts a number to a localized string using the provided options.
   * @param value - The number to convert to a string.
   * @param options - The options to use for conversion.
   * @returns A string representation of the number.
   */
  public toString(value: number | string | null | undefined, options?: IToStringOptions): string | null | undefined {
    if (value === null || typeof value === 'undefined' || typeof value === 'string') {
      return value;
    }

    if (Number.isNaN(value)) {
      return 'NaN';
    }

    const useGrouping = options?.useGrouping ?? true;
    const isPercentage = options?.isPercentage ?? false;
    const isCurrency = options?.isCurrency ?? false;
    let fractionDigits = this.fromString(options?.fractionDigits);
    if (isNaN(fractionDigits)) {
      fractionDigits = 2;
    }
    const format = isCurrency ? { style: 'currency', currency: 'USD' } :
                   isPercentage ? { style: 'percent' } :
                   { style: 'decimal' };

    return this.i18n.nf(
      value,
      Object.assign(format, {
        useGrouping,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    );
  }

  /**
   * Converts a localized string to a number.
   * @param value - The string or number to convert to a number.
   * @returns The parsed number, or NaN if the input is not a valid number.
   */
  public fromString(value?: string | number | null | undefined): number {
    if (value === null || typeof value === 'undefined') {
      return NaN;
    }
    if (typeof value === 'number') {
      return value;
    }
    return this.i18n.uf(value);
  }
}
