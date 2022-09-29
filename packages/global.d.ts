/**
 * A global constant that will be remove when producing the dist bundle
 *
 * @internal
 */
declare const __DEV__: boolean;

/**
 * A build variable to help packages mark const enum region for removing them from output bundle
 */
declare const _START_CONST_ENUM: () => void;

/**
 * A build variable to help packages mark const enum region for removing them from output bundle
 */
declare const _END_CONST_ENUM: () => void;
