import { ViewportScope } from './endpoints/viewport-scope.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Viewport } from './endpoints/viewport.js';
import { arrayRemove } from './utilities/utils.js';
import { Collection } from './utilities/collection.js';
import { RoutingScope } from './routing-scope.js';
import { IRouter } from './index.js';

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

export class EndpointMatcher {

  // TODO: In addition to check whether the viewport is configured for components, check if
  // the components are configured for viewports.
  // TODO: When matching/checking on component and viewport, match on ComponentAppelation
  // and ViewportHandle.

  /**
   * Finds endpoints, viewports and viewport scopes, that matches routing instructions' criteria.
   * See comment at the top of the file for more details.
   *
   * @param instructions - The routing instructions to find matches for
   * @param routingScope - The routing scope where to find the matching endpoints
   * @param alreadyMatched - Already matched routing instructions whose endpoints are no longer available
   * @param disregardViewports - Ignore already existing matchin endpoints on the routing instructions
   */
  // Note: This can't change state other than the instructions!
  public static matchEndpoints(routingScope: RoutingScope, instructions: RoutingInstruction[], alreadyMatched: RoutingInstruction[], disregardViewports: boolean = false): IMatchEndpointsResult {
    const matchedInstructions: RoutingInstruction[] = [];

    // Get all the routing scopes owned by this scope
    // TODO: Investigate if Infinity needs to be a timestamp
    const ownedScopes = routingScope.getOwnedRoutingScopes(Infinity);

    // Get a shallow copy of all available endpoints
    const endpoints = ownedScopes.map(scope => scope.endpoint);
    const availableEndpoints = endpoints
      .filter(endpoint => endpoint !== null
        && !alreadyMatched.some(found => endpoint === found.endpoint.instance)
      ) as (Viewport | ViewportScope)[];

    const routingInstructions = new Collection<RoutingInstruction>(...instructions.slice());
    let instruction: RoutingInstruction | null = null;

    // First, match instructions with already known viewport scopes...
    // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
    // and sets viewport/viewport scope and scope in actual RoutingInstruction
    // Pass in `false` to `doesntNeedViewportDescribed` even though it doesn't really apply for ViewportScope
    EndpointMatcher.matchKnownEndpoints(
      routingScope.router,
      'ViewportScope',
      routingInstructions,
      availableEndpoints,
      matchedInstructions,
      false,
    );

    // ...and instructions with already known viewports (unless we're disregarding already known viewports when matching).
    if (!disregardViewports) {
      // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
      // and sets viewport/viewport scope and scope in actual RoutingInstruction
      // Pass in `false` to `doesntNeedViewportDescribed` since we can't know for sure whether viewport is necessary or not
      EndpointMatcher.matchKnownEndpoints(
        routingScope.router,
        'Viewport',
        routingInstructions,
        availableEndpoints,
        matchedInstructions,
        false,
      );
    }

    // Then match viewport scopes that accepts the component (name) as segment.
    // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
    // and sets viewport scope and scope in actual RoutingInstruction
    EndpointMatcher.matchViewportScopeSegment(
      routingScope.router,
      routingScope,
      routingInstructions,
      availableEndpoints,
      matchedInstructions,
    );

    // All instructions not yet matched need viewport described in some way unless
    // specifically specified as not needing it (parameter to `foundEndpoint`)
    while ((instruction = routingInstructions.next()) !== null) {
      instruction.needsEndpointDescribed = true;
    }

    // Match viewports with configuration (for example `used-by` attribute) that matches instruction components.
    // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
    // and sets viewport scope and scope in actual RoutingInstruction
    EndpointMatcher.matchViewportConfiguration(
      routingInstructions,
      availableEndpoints,
      matchedInstructions,
    );

    // Next in line is specified viewport (but not if we're disregarding viewports)
    if (!disregardViewports) {
      // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
      // and sets viewport scope and scope in actual RoutingInstruction.
      // Pass in `false` to `doesntNeedViewportDescribed` since we can't know for sure whether viewport is necessary or not
      EndpointMatcher.matchSpecifiedViewport(
        routingInstructions,
        availableEndpoints,
        matchedInstructions,
        false,
      );
    }

    // Finally, only one available and accepting viewport remaining?
    // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
    // and sets viewport scope and scope in actual RoutingInstruction
    EndpointMatcher.matchLastViewport(
      routingInstructions,
      availableEndpoints,
      matchedInstructions,
    );

    // If we're ignoring viewports, we now match them anyway
    if (disregardViewports) {
      // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
      // and sets viewport scope and scope in actual RoutingInstruction.
      // Pass in `false` to `doesntNeedViewportDescribed` since we do need the viewport if we got here
      EndpointMatcher.matchSpecifiedViewport(
        routingInstructions,
        availableEndpoints,
        matchedInstructions,
        false,
      );
    }

    return {
      matchedInstructions,
      remainingInstructions: [...routingInstructions],
    };
  }

  private static matchKnownEndpoints(
    router: IRouter,
    type: string,
    routingInstructions: Collection<RoutingInstruction>,
    availableEndpoints: (Viewport | ViewportScope)[],
    matchedInstructions: RoutingInstruction[],
    doesntNeedViewportDescribed: boolean = false,
  ): void {
    let instruction: RoutingInstruction | null;
    while ((instruction = routingInstructions.next()) !== null) {
      if (
        // The endpoint is already known and it's not an add instruction...
        instruction.endpoint.instance !== null && !instruction.isAdd(router) &&
        // ...(and of the type we're currently checking)...
        instruction.endpoint.endpointType === type
      ) {
        // ...match the endpoint, updating the instruction!, and set the scope
        // for the next scope instructions ("children") to the endpoint's scope...
        EndpointMatcher.matchEndpoint(
          instruction,
          instruction.endpoint.instance as Viewport | ViewportScope,
          doesntNeedViewportDescribed,
        );
        // ...add the matched instruction as a matched instruction...
        matchedInstructions.push(instruction);
        // ...remove the endpoint as available...
        arrayRemove(availableEndpoints, available => available === instruction!.endpoint.instance);
        // ...and finally delete the routing instructions to prevent further processing of it.
        routingInstructions.removeCurrent();
      }
    }
  }

  private static matchViewportScopeSegment(
    router: IRouter,
    routingScope: RoutingScope,
    routingInstructions: Collection<RoutingInstruction>,
    availableEndpoints: (Viewport | ViewportScope)[],
    matchedInstructions: RoutingInstruction[],
  ): void {
    let instruction: RoutingInstruction | null;

    while ((instruction = routingInstructions.next()) !== null) {
      for (let endpoint of availableEndpoints) {
        if (!(endpoint instanceof ViewportScope)) {
          continue;
        }
        // Check if viewport scope accepts (wants) the path/route segment
        if (endpoint.acceptSegment(instruction.component.name!)) {
          // If the viewport scope is a list of viewport scopes...
          if (Array.isArray(endpoint.source)) { // TODO(alpha): Remove this functionality temporarily for alpha
            // ...see if there's any already existing list entry that's available...
            let available = availableEndpoints.find(available => available instanceof ViewportScope && available.name === endpoint.name);
            // ...otherwise create one (adding it to the list) and...
            if (available === void 0 || instruction.isAdd(router)) {
              const item = endpoint.addSourceItem();
              available = routingScope.getOwnedScopes()
                .filter(scope => scope.isViewportScope)
                .map(scope => scope.endpoint as ViewportScope)
                .find(viewportScope => viewportScope.sourceItem === item)!;
            }
            // ...use the available one as endpoint.
            endpoint = available;
          }
          // Match the instruction with the endpoint and add its next scope instructions ("children")
          // to be processed in the call to `matchEndpoints` for the next scope.
          // Parameter `doesntNeedViewportDescribed` is set to false since described
          // viewports isn applicable on viewport scopes.
          EndpointMatcher.matchEndpoint(instruction, endpoint, false);
          // Add the matched instruction to the result
          matchedInstructions.push(instruction);
          // Remove the endpoint from available endpoints
          arrayRemove(availableEndpoints, available => available === instruction!.endpoint.instance);
          // Remove the matched instruction from the currently processed instruction
          routingInstructions.removeCurrent();
          break;
        }
      }
    }
  }

  private static matchViewportConfiguration(
    routingInstructions: Collection<RoutingInstruction>,
    availableEndpoints: (Viewport | ViewportScope)[],
    matchedInstructions: RoutingInstruction[],
  ): void {
    let instruction: RoutingInstruction | null;
    while ((instruction = routingInstructions.next()) !== null) {
      for (const endpoint of availableEndpoints) {
        if (!(endpoint instanceof Viewport)) {
          continue;
        }
        // Check if a viewport has "ownership"/is the only target of a component
        if (endpoint?.wantComponent(instruction.component.name!)) {
          // Match the instruction with the endpoint and add its next scope instructions ("children")
          // to be processed in the call to `matchEndpoints` for the next scope.
          // Parameter `doesntNeedViewportDescribed` is set to true since it's the
          // configuration on the viewport that matches the instruction.
          EndpointMatcher.matchEndpoint(instruction, endpoint, true);
          // Add the matched instruction to the result
          matchedInstructions.push(instruction);
          // Remove the endpoint from available endpoints
          arrayRemove(availableEndpoints, available => available === instruction!.endpoint.instance);
          // Remove the matched instruction from the currently processed instruction
          routingInstructions.removeCurrent();
          break;
        }
      }
    }
  }

  private static matchSpecifiedViewport(
    routingInstructions: Collection<RoutingInstruction>,
    availableEndpoints: (Viewport | ViewportScope)[],
    matchedInstructions: RoutingInstruction[],
    disregardViewports: boolean,
  ): void {
    let instruction: RoutingInstruction | null;

    while ((instruction = routingInstructions.next()) !== null) {
      let viewport = instruction.endpoint.instance as Viewport;
      // If instruction don't have a viewport instance...
      if (viewport == null) {
        const name = instruction.endpoint.name;
        // ...but a viewport name...
        if ((name?.length ?? 0) === 0) {
          continue;
        }
        // TODO(alpha): No longer pre-creating viewports here. Evaluate!
        // const newScope = instruction.ownsScope;
        // ...look through all available endpoints...
        for (const endpoint of availableEndpoints) {
          if (!(endpoint instanceof Viewport)) {
            continue;
          }
          // ...and use the one with the matching name.
          if (name === endpoint.name) {
            viewport = endpoint;
            break;
          }
          // TODO(alpha): No longer pre-creating viewports here. Evaluate!
          // routingScope.addViewport(name!, null, { scope: newScope, forceDescription: true });
          // availableViewports[name!] = routingScope.getEnabledViewports(ownedScopes)[name!];
        }
      }
      // Check if the matching viewport accepts this component.
      if (viewport?.acceptComponent(instruction.component.name!)) {
        // Match the instruction with the endpoint and add its next scope instructions ("children")
        // to be processed in the call to `matchEndpoints` for the next scope.
        // Parameter `doesntNeedViewportDescribed` is set to `disregardViewports` since the time of
        // invocation and whether viewport is part of that decides if it's needed.
        EndpointMatcher.matchEndpoint(instruction, viewport, disregardViewports);
        // Add the matched instruction to the result
        matchedInstructions.push(instruction);
        // Remove the endpoint from available endpoints
        arrayRemove(availableEndpoints, available => available === instruction!.endpoint.instance);
        // Remove the matched instruction from the currently processed instruction
        routingInstructions.removeCurrent();
      }
    }
  }

  private static matchLastViewport(
    routingInstructions: Collection<RoutingInstruction>,
    availableEndpoints: (Viewport | ViewportScope)[],
    matchedInstructions: RoutingInstruction[],
  ): void {
    let instruction: RoutingInstruction | null;

    while ((instruction = routingInstructions.next()) !== null) {
      // All remaining available viewports...
      const availableViewports: Viewport[] = [];
      for (const endpoint of availableEndpoints) {
        if (!(endpoint instanceof Viewport)) {
          continue;
        }
        // ...that accepts the instruction.
        if (endpoint.acceptComponent(instruction.component.name!)) {
          availableViewports.push(endpoint);
        }
      }
      if (availableViewports.length === 1) {
        const viewport = availableViewports[0];
        // Match the instruction with the endpoint and add its next scope instructions ("children")
        // to be processed in the call to `matchEndpoints` for the next scope.
        // Parameter `doesntNeedViewportDescribed` is set to `true` since the viewport is the only
        // available option.
        EndpointMatcher.matchEndpoint(instruction, viewport, true);
        // Add the matched instruction to the result
        matchedInstructions.push(instruction);
        // Remove the endpoint from available endpoints
        arrayRemove(availableEndpoints, available => available === instruction!.endpoint.instance);
        // Remove the matched instruction from the currently processed instruction
        routingInstructions.removeCurrent();
      }
    }
  }

  private static matchEndpoint(instruction: RoutingInstruction, endpoint: Viewport | ViewportScope, doesntNeedViewportDescribed: boolean): void {
    instruction.endpoint.set(endpoint);
    if (doesntNeedViewportDescribed) {
      instruction.needsEndpointDescribed = false;
    }
    // Get all the next scope instructions...
    if (instruction.hasNextScopeInstructions) {
      instruction.nextScopeInstructions!.forEach(next => {
        if (next.scope === null) {
          // ...and set the endpoint's routing scope as their scope
          next.scope = endpoint instanceof Viewport ? endpoint.scope : endpoint.scope.scope;
        }
      });
    }
  }
}
