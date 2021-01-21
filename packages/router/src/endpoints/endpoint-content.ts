/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { Endpoint } from './endpoint';
import { IRouter } from '../router';
import { RoutingInstruction, RoutingScope } from '../index.js';

/**
 * The endpoint content encapsulates the content of an endpoint.
 *
 * Endpoint contents are used to represent the full endpoint state
 * and can be used for caching.
 */

export class EndpointContent {
  public connectedScope: RoutingScope;

  public constructor(
    public readonly router: IRouter,
    public endpoint: Endpoint,
    owningScope: RoutingScope | null,
    scope: boolean,
    public instruction: RoutingInstruction = RoutingInstruction.create('') as RoutingInstruction,
  ) {
    this.connectedScope = new RoutingScope(router, scope, owningScope, this);
    // Skip if no root scope (meaning we ARE the root scope!)
    if (this.router.rootScope !== null) {
      (this.endpoint.connectedScope?.parent ?? this.router.rootScope?.scope).addChild(this.connectedScope);
    }
  }

  public get isActive(): boolean {
    return this.endpoint.activeContent === this;
  }

  public delete(): void {
    this.connectedScope.parent?.removeChild(this.connectedScope);
  }
}
