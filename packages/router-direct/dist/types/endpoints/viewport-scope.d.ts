/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { CustomElementType } from '@aurelia/runtime-html';
import { IRouter } from '../router';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { TransitionAction, RoutingScope } from '../routing-scope';
import { Navigation } from '../navigation';
import { NavigationCoordinator } from '../navigation-coordinator';
import { Step } from '../utilities/runner';
import { Route } from '../route';
import { Endpoint, IConnectedCustomElement, IEndpointOptions } from './endpoint';
/**
 * The viewport scope is an endpoint that encapsulates an au-viewport-scope custom
 * element instance. Its content isn't managed by, or even relevant for, the viewport
 * scope since it's only a container custom element. Instead of managing content,
 * the viewport scope provides a way to
 * a) add a routing scope without having to add an actual viewport,
 * b) have segments in routes/paths/instructions without requiring a viewport, and
 * c) make viewports repeatable (something they can't be by themselves) by
 * enclosing them.
 *
 * Since it is an endpoint, the viewport scope is participating in navigations and
 * instructed by the router and navigation coordinator (but with a very simple
 * transition and other navigation actions).
 */
export interface IViewportScopeOptions extends IEndpointOptions {
    catches?: string | string[];
    collection?: boolean;
    source?: unknown[] | null;
}
export declare class ViewportScope extends Endpoint {
    rootComponentType: CustomElementType | null;
    options: IViewportScopeOptions;
    instruction: RoutingInstruction | null;
    available: boolean;
    sourceItem: unknown;
    sourceItemIndex: number;
    private remove;
    private add;
    constructor(router: IRouter, name: string, connectedCE: IConnectedCustomElement | null, owningScope: RoutingScope | null, scope: boolean, rootComponentType?: CustomElementType | null, // temporary. Metadata will probably eliminate it
    options?: IViewportScopeOptions);
    get isEmpty(): boolean;
    get passThroughScope(): boolean;
    get siblings(): ViewportScope[];
    get source(): unknown[] | null;
    get catches(): string[];
    get default(): string | undefined;
    toString(): string;
    setNextContent(instruction: RoutingInstruction, navigation: Navigation): TransitionAction;
    transition(coordinator: NavigationCoordinator): void;
    finalizeContentChange(coordinator: NavigationCoordinator, _step: Step<void> | null): void;
    cancelContentChange(coordinator: NavigationCoordinator, noExitStep?: Step<void> | null): void | Step<void>;
    acceptSegment(segment: string): boolean;
    binding(): void;
    unbinding(): void;
    getAvailableSourceItem(): unknown;
    addSourceItem(): unknown;
    removeSourceItem(): void;
    getRoutes(): Route[];
}
//# sourceMappingURL=viewport-scope.d.ts.map