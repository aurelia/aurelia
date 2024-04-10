import { resolve } from '@aurelia/kernel';
import { createInterface } from '../../utilities-di';
import { ValueConverterStaticAuDefinition, converterTypeName } from '../value-converter';
import { ErrorNames, createMappedError } from '../../errors';

export interface ISanitizer {
  /**
   * Sanitizes the provided input.
   *
   * @param input - The input to be sanitized.
   */
  sanitize(input: string): string;
}

export const ISanitizer = /*@__PURE__*/createInterface<ISanitizer>('ISanitizer', x => x.singleton(class {
  public sanitize(): string {
    throw createMappedError(ErrorNames.method_not_implemented, 'sanitize');
  }
}));

/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
export class SanitizeValueConverter {
  public static readonly $au: ValueConverterStaticAuDefinition = {
    type: converterTypeName,
    name: 'sanitize',
  };

  /** @internal */ private readonly _sanitizer = resolve(ISanitizer);

  /**
   * Process the provided markup that flows to the view.
   *
   * @param untrustedMarkup - The untrusted markup to be sanitized.
   */
  public toView(untrustedMarkup: string): string|null {
    if (untrustedMarkup == null) {
      return null;
    }

    return this._sanitizer.sanitize(untrustedMarkup);
  }
}
