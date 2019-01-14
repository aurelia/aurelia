import { DI, InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { ValueConverterResource } from '../value-converter';

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export interface ISanitizer {
 /**
  * Sanitizes the provided input.
  * @param input The input to be sanitized.
  */
  sanitize(input: string): string;
}

export const ISanitizer = DI.createInterface<ISanitizer>('ISanitizer').withDefault(x => x.singleton(class {
    public sanitize(input: string): string {
      return input.replace(SCRIPT_REGEX, '');
    }
  })
);

/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
export class SanitizeValueConverter {
  public static readonly inject: ReadonlyArray<InterfaceSymbol<unknown>> = [ISanitizer];

  public static register: IRegistry['register'];

  private readonly sanitizer: ISanitizer;

  constructor(sanitizer: ISanitizer) {
    this.sanitizer = sanitizer;
  }

 /**
  * Process the provided markup that flows to the view.
  * @param untrustedMarkup The untrusted markup to be sanitized.
  */
  public toView(untrustedMarkup: string): string|null {
    if (untrustedMarkup === null || untrustedMarkup === undefined) {
      return null;
    }

    return this.sanitizer.sanitize(untrustedMarkup);
  }
}
ValueConverterResource.define('sanitize', SanitizeValueConverter);
