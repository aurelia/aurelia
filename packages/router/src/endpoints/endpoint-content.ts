import { Endpoint } from './endpoint';
import { IRouter } from '../router';
import { Navigation, RoutingInstruction, RoutingScope } from '../index.js';

/**
 * The endpoint content encapsulates the content of an endpoint.
 *
 * Endpoint contents are used to represent the full endpoint state
 * and can be used for caching.
 */

export class EndpointContent {
  /**
   * The routing scope that's connected to the endpoint content
   */
  public connectedScope: RoutingScope;

  /**
   * Whether the content has completed its navigation
   */
  public completed: boolean = false;

  public constructor(
    public readonly router: IRouter,
    /**
     * The endpoint the endpoint content belongs to
     */
    public endpoint: Endpoint,
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
    public instruction: RoutingInstruction = RoutingInstruction.create('') as RoutingInstruction,

    /**
     * The navigation that created the endpoint content
     */
    public navigation = Navigation.create({
      instruction: '',
      fullStateInstruction: '',
    }),
  ) {
    this.connectedScope = new RoutingScope(router, hasScope, owningScope, this);
    // Skip if no root scope (meaning we ARE the root scope!)
    if (this.router.rootScope !== null) {
      (this.endpoint.connectedScope?.parent ?? this.router.rootScope.scope).addChild(this.connectedScope);
    }
  }

  /**
   * Whether the endpoint content is the active one within its endpoint
   */
  public get isActive(): boolean {
    return this.endpoint.activeContent === this;
  }

  /**
   * Delete the endpoint content and its routing scope
   */
  public delete(): void {
    this.connectedScope.parent?.removeChild(this.connectedScope);
  }
}
