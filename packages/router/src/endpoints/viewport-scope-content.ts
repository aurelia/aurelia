import { EndpointContent } from '../index.js';

/**
 * The viewport scope content represents the content of a viewport scope
 * and whether it's active or not.
 *
 * During a transition, a viewport scope has two viewport scope contents,
 * the current and the next, which is turned back into one when the
 * transition is either finalized or aborted.
 *
 * Viewport scope contents are used to represent the full state and can
 * be used for caching
 */

export class ViewportScopeContent extends EndpointContent {
}
