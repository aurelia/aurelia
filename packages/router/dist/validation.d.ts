import { PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { IChildRouteConfig, IRedirectRouteConfig, Routeable } from './route.js';
import { IViewportInstruction, RouteableComponent } from './instructions.js';
export declare function isNotNullishOrTypeOrViewModel(value: RouteableComponent | IChildRouteConfig | null | undefined): value is PartialCustomElementDefinition | IChildRouteConfig;
export declare function isPartialCustomElementDefinition(value: RouteableComponent | IChildRouteConfig | null | undefined): value is PartialCustomElementDefinition;
export declare function isPartialChildRouteConfig(value: RouteableComponent | IChildRouteConfig | IRedirectRouteConfig | null | undefined): value is IChildRouteConfig;
export declare function isPartialRedirectRouteConfig(value: RouteableComponent | IChildRouteConfig | IRedirectRouteConfig | null | undefined): value is IRedirectRouteConfig;
export declare function isPartialViewportInstruction(value: RouteableComponent | IViewportInstruction | null | undefined): value is IViewportInstruction;
export declare function expectType(expected: string, prop: string, value: unknown): never;
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
export declare function validateRouteConfig(config: Partial<IChildRouteConfig> | null | undefined, parentPath: string): void;
export declare function validateRedirectRouteConfig(config: Partial<IRedirectRouteConfig> | null | undefined, parentPath: string): void;
export declare function validateComponent(component: Routeable | null | undefined, parentPath: string): void;
export declare function shallowEquals<T>(a: T, b: T): boolean;
//# sourceMappingURL=validation.d.ts.map