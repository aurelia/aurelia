import { IQueryParams } from '@aurelia/kernel';
export interface RouteHandler {
    href?: string;
    generationUsesHref?: boolean;
    name?: string | string[];
}
export interface ConfigurableRoute {
    path: string;
    handler: RouteHandler;
    caseSensitive?: boolean;
}
export declare class HandlerEntry {
    handler: RouteHandler;
    names: string[];
    constructor(handler: RouteHandler, names: string[]);
}
export declare class RouteGenerator {
    segments: Segment[];
    handlers: HandlerEntry[];
    constructor(segments: Segment[], handlers: HandlerEntry[]);
}
export declare class TypesRecord {
    statics: number;
    dynamics: number;
    stars: number;
}
export declare class RecognizeResult {
    handler: RouteHandler;
    params: Record<string, string>;
    isDynamic: boolean;
    constructor(handler: RouteHandler, params: Record<string, string>, isDynamic: boolean);
}
export interface RecognizeResults extends Array<RecognizeResult> {
    queryParams?: IQueryParams;
}
export declare class CharSpec {
    invalidChars: string | null;
    validChars: string | null;
    repeat: boolean;
    constructor(invalidChars: string | null, validChars: string | null, repeat: boolean);
    equals(other: CharSpec): boolean;
}
export declare class State {
    charSpec?: CharSpec | undefined;
    handlers: HandlerEntry[];
    regex: RegExp;
    types: TypesRecord;
    nextStates: State[];
    constructor(charSpec?: CharSpec | undefined);
    put(charSpec: CharSpec): State;
}
export declare class StaticSegment {
    caseSensitive: boolean;
    name: string;
    string: string;
    optional: boolean;
    constructor(str: string, caseSensitive: boolean);
    eachChar(callback: (spec: CharSpec) => void): void;
    regex(): string;
    generate(params: Record<string, string>, consumed: Record<string, boolean>): string;
}
export declare class DynamicSegment {
    name: string;
    optional: boolean;
    constructor(name: string, optional: boolean);
    eachChar(callback: (spec: CharSpec) => void): void;
    regex(): string;
    generate(params: Record<string, string>, consumed: Record<string, boolean>): string;
}
export declare class StarSegment {
    name: string;
    optional: boolean;
    constructor(name: string);
    eachChar(callback: (spec: CharSpec) => void): void;
    regex(): string;
    generate(params: Record<string, string>, consumed: Record<string, boolean>): string;
}
export declare class EpsilonSegment {
    name?: string;
    optional?: boolean;
    eachChar(callback: (spec: CharSpec) => void): void;
    regex(): string;
    generate(params: Record<string, string>, consumed: Record<string, boolean>): string;
}
export declare type Segment = StaticSegment | DynamicSegment | StarSegment | EpsilonSegment;
/**
 * Class that parses route patterns and matches path strings.
 */
export declare class RouteRecognizer {
    rootState: State;
    names: Record<string, RouteGenerator>;
    routes: Map<RouteHandler, RouteGenerator>;
    constructor();
    /**
     * Parse a route pattern and add it to the collection of recognized routes.
     *
     * @param route - The route to add.
     */
    add(route: ConfigurableRoute | ConfigurableRoute[]): State | undefined;
    /**
     * Retrieve a RouteGenerator for a route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns The RouteGenerator for that route.
     */
    getRoute(nameOrRoute: string | RouteHandler): RouteGenerator;
    /**
     * Retrieve the handlers registered for the route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns The handlers.
     */
    handlersFor(nameOrRoute: string | RouteHandler): HandlerEntry[];
    /**
     * Check if this RouteRecognizer recognizes a route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns True if the named route is recognized.
     */
    hasRoute(nameOrRoute: string | RouteHandler): boolean;
    /**
     * Generate a path and query string from a route name or RouteConfig (RouteHandler) and params object.
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @param params - The route params to use when populating the pattern.
     * Properties not required by the pattern will be appended to the query string.
     * @returns The generated absolute path and query string.
     */
    generate(nameOrRoute: string | RouteHandler, params?: object): string;
    /**
     * Match a path string against registered route patterns.
     *
     * @param path - The path to attempt to match.
     * @returns Array of objects containing `handler`, `params`, and
     * `isDynamic` values for the matched route(s), or undefined if no match
     * was found.
     */
    recognize(path: string): RecognizeResults;
}
//# sourceMappingURL=route-recognizer.d.ts.map