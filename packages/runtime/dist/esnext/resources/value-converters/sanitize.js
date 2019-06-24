import { DI } from '@aurelia/kernel';
import { ValueConverterResource } from '../value-converter';
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
export const ISanitizer = DI.createInterface('ISanitizer').withDefault(x => x.singleton(class {
    sanitize(input) {
        return input.replace(SCRIPT_REGEX, '');
    }
}));
/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
export class SanitizeValueConverter {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    /**
     * Process the provided markup that flows to the view.
     * @param untrustedMarkup The untrusted markup to be sanitized.
     */
    toView(untrustedMarkup) {
        if (untrustedMarkup == null) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
}
SanitizeValueConverter.inject = [ISanitizer];
ValueConverterResource.define('sanitize', SanitizeValueConverter);
//# sourceMappingURL=sanitize.js.map