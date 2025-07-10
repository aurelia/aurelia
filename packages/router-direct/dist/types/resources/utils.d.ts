import { IEventAggregator } from '@aurelia/kernel';
import { IRouter } from '../router';
import { IHydratedController } from '@aurelia/runtime-html';
import { RoutingInstruction } from '../instructions/routing-instruction';
/**
 * Get either a provided value or the value of an html attribute,
 * depending on `useValue`. If `doExistCheck` is `true` the
 * existence of the html attribute is returned, regardless of
 * `useValue` (or `value`).
 *
 * @param name - Attribute name
 * @param value - The value that's used if `useValue` or if
 * the attribute doesn't exist on the element (so it's also default)
 * @param useValue - Whether the value should be used (unless check exists)
 * @param element - The element with the attributes
 * @param doExistCheck - Whether only the existence of the html attribute
 * should be checked and returned as a boolean
 */
export declare function getValueOrAttribute(name: string, value: string | boolean, useValue: boolean, element: HTMLElement, doExistCheck?: boolean): string | boolean | undefined;
/**
 * Make it possible to wait for router start by subscribing to the
 * router start event and return a promise that's resolved when
 * the router start event fires.
 */
export declare function waitForRouterStart(router: IRouter, ea: IEventAggregator): void | Promise<void>;
export declare function getConsideredActiveInstructions(router: IRouter, controller: IHydratedController, element: HTMLElement, value: unknown): RoutingInstruction[];
export declare function getLoadIndicator(element: HTMLElement): HTMLElement;
//# sourceMappingURL=utils.d.ts.map