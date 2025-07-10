import { Endpoint } from './endpoint';
import { IRouter } from '../router';
import { Navigation, RoutingInstruction, RoutingScope } from '../index';
/**
 * The endpoint content encapsulates the content of an endpoint.
 *
 * Endpoint contents are used to represent the full endpoint state
 * and can be used for caching.
 */
export declare class EndpointContent {
    readonly router: IRouter;
    /**
     * The endpoint the endpoint content belongs to
     */
    endpoint: Endpoint;
    /**
     * The routing instruction that has created the content
     */
    instruction: RoutingInstruction;
    /**
     * The navigation that created the endpoint content
     */
    navigation: Navigation;
    /**
     * The routing scope that's connected to the endpoint content
     */
    connectedScope: RoutingScope;
    /**
     * Whether the content has completed its navigation
     */
    completed: boolean;
    constructor(router: IRouter, 
    /**
     * The endpoint the endpoint content belongs to
     */
    endpoint: Endpoint, 
    /**
     * The routing scope the endpoint content belongs to/is owned by
     */
    owningScope: RoutingScope | null, 
    /**
     * Whether the endpoint has its own routing scope, containing
     * endpoints it owns
     */
    hasScope: boolean, 
    /**
     * The routing instruction that has created the content
     */
    instruction?: RoutingInstruction, 
    /**
     * The navigation that created the endpoint content
     */
    navigation?: Navigation);
    /**
     * Whether the endpoint content is the active one within its endpoint
     */
    get isActive(): boolean;
    /**
     * Delete the endpoint content and its routing scope
     */
    delete(): void;
}
//# sourceMappingURL=endpoint-content.d.ts.map