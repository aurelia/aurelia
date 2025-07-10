import { RoutingInstruction } from './instructions/routing-instruction';
import { RoutingScope } from './routing-scope';
/**
 * The EndpointMatcher finds endpoints, viewports and viewport scopes, that matches routing instructions' criteria.
 * It works based on RoutingScope and is a pure helper class to it. The only public method, `matchEndpoints`, is
 * invoked on two occassions during a navigation:
 * - when the router is looking for the matching endpoints to the routing instructions in a navigation, and
 * - when the router is looking for the minimum way to describe the full current state of all endpoints. In this
 * second invokation, pre-existing matching endpoints on the routing instruction are ignored.
 *
 * It mutates the actual routing instructions in which is good for the first occassion but requires a cloning of
 * the routing instructions representing the full current state before the second invokation.
 *
 * Endpoints are matched in priority order
 * 1) already existing instances (skipped in second occassion, minimum descripton of full state)
 * 2) viewport scope matching segment (component/path part)
 * 3) component configuration on viewports (used-by)
 * 4) viewport (non-instance) specified in routing instruction (skipped in second occassion, minimum descripton)
 * 5) if there's a single available viewport last
 * 6) viewport specified in routing instruction (only in second occassion, minimum descripton)
 */
export interface IMatchEndpointsResult {
    matchedInstructions: RoutingInstruction[];
    remainingInstructions: RoutingInstruction[];
}
export declare class EndpointMatcher {
    /**
     * Finds endpoints, viewports and viewport scopes, that matches routing instructions' criteria.
     * See comment at the top of the file for more details.
     *
     * @param instructions - The routing instructions to find matches for
     * @param routingScope - The routing scope where to find the matching endpoints
     * @param alreadyMatched - Already matched routing instructions whose endpoints are no longer available
     * @param disregardViewports - Ignore already existing matchin endpoints on the routing instructions
     */
    static matchEndpoints(routingScope: RoutingScope, instructions: RoutingInstruction[], alreadyMatched: RoutingInstruction[], disregardViewports?: boolean): IMatchEndpointsResult;
    private static matchKnownEndpoints;
    private static matchViewportScopeSegment;
    private static matchViewportConfiguration;
    private static matchSpecifiedViewport;
    private static matchLastViewport;
    private static matchEndpoint;
}
//# sourceMappingURL=endpoint-matcher.d.ts.map