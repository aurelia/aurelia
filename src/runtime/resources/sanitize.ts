import { DI } from '../../kernel/di';
import { inject } from '../../kernel/decorators';
import { valueConverter } from '../decorators';

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export interface ISanitizer {
  /**
  * Sanitizes the provided input.
  * @param input The input to be sanitized.
  */
  sanitize(input: string): string;
}

export const ISanitizer = DI.createInterface<ISanitizer>()
  .withDefault(x => x.singleton(class {
    sanitize(input: string): string {
      return input.replace(SCRIPT_REGEX, '');
    }
  })
);

/**
* Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
*/
@valueConverter('sanitize')
@inject(ISanitizer)
export class SanitizeValueConverter {
  constructor(private sanitizer: ISanitizer) {
    this.sanitizer = sanitizer;
  }

  /**
  * Process the provided markup that flows to the view.
  * @param untrustedMarkup The untrusted markup to be sanitized.
  */
  toView(untrustedMarkup: string) {
    if (untrustedMarkup === null || untrustedMarkup === undefined) {
      return null;
    }

    return this.sanitizer.sanitize(untrustedMarkup);
  }
}
