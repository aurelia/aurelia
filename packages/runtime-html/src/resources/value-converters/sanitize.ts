import { createInterface } from '../../utilities-di';
import { valueConverter } from '../value-converter';

export interface ISanitizer {
  /**
   * Sanitizes the provided input.
   *
   * @param input - The input to be sanitized.
   */
  sanitize(input: string): string;
}

export const ISanitizer = createInterface<ISanitizer>('ISanitizer', x => x.singleton(class {
  public sanitize(): string {
    throw new Error('"sanitize" method not implemented');
  }
}));

/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
export class SanitizeValueConverter {
  public constructor(
    /** @internal */ @ISanitizer private readonly _sanitizer: ISanitizer,
  ) {}

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

valueConverter('sanitize')(SanitizeValueConverter);
