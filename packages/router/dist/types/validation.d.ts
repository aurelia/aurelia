import { type PartialCustomElementDefinition } from '@aurelia/runtime-html';
import type { IChildRouteConfig, IRedirectRouteConfig } from './options';
import type { IExtendedViewportInstruction, IViewportInstruction, Params, RouteableComponent } from './instructions';
export declare function isPartialCustomElementDefinition(value: RouteableComponent | IChildRouteConfig | null | undefined): value is PartialCustomElementDefinition;
export declare function isPartialChildRouteConfig(value: RouteableComponent | IChildRouteConfig | IRedirectRouteConfig | null | undefined): value is IChildRouteConfig;
export declare function isPartialRedirectRouteConfig(value: RouteableComponent | IChildRouteConfig | IRedirectRouteConfig | null | undefined): value is IRedirectRouteConfig;
export declare function isPartialViewportInstruction(value: RouteableComponent | IViewportInstruction | null | undefined): value is IExtendedViewportInstruction;
export declare function expectType(expected: string, prop: string, value: unknown): never;
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
export declare function validateRouteConfig(config: Partial<IChildRouteConfig> | null | undefined, parentPath: string): void;
export declare function shallowEquals(a: Params | null, b: Params | null): boolean;
//# sourceMappingURL=validation.d.ts.map