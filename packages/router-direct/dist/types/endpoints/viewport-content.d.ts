/**
 * The viewport content encapsulates the component loaded into a viewport
 * and keeps track of the component's lifecycle and routing states, meaning
 * that the callers don't have to query (internal) content state to know if
 * a "state method" can be called.
 *
 * During a transition, a viewport has two viewport contents, the current
 * and the next, which is turned back into one when the transition is either
 * finalized or aborted.
 *
 * Viewport contents are used to represent the full component state
 * and can be used for caching.
 */
/**
 * The content states for the viewport content content.
 */
export type ContentState = 'created' | 'checkedUnload' | 'checkedLoad' | 'loaded' | 'activating' | 'activated';
//# sourceMappingURL=viewport-content.d.ts.map