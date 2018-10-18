export interface ISanitizer {
    /**
     * Sanitizes the provided input.
     * @param input The input to be sanitized.
     */
    sanitize(input: string): string;
}
export declare const ISanitizer: import("@aurelia/kernel/dist/di").InterfaceSymbol<ISanitizer>;
/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
export declare class SanitizeValueConverter {
    private sanitizer;
    constructor(sanitizer: ISanitizer);
    /**
     * Process the provided markup that flows to the view.
     * @param untrustedMarkup The untrusted markup to be sanitized.
     */
    toView(untrustedMarkup: string): string;
}
//# sourceMappingURL=sanitize.d.ts.map