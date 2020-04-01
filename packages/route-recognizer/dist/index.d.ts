export interface IConfigurableRoute<T> {
    readonly path: string;
    readonly caseSensitive?: boolean;
    readonly handler: T;
}
export declare class ConfigurableRoute<T> implements IConfigurableRoute<T> {
    readonly path: string;
    readonly caseSensitive: boolean;
    readonly handler: T;
    constructor(path: string, caseSensitive: boolean, handler: T);
}
export declare class Endpoint<T> {
    readonly route: ConfigurableRoute<T>;
    readonly paramNames: readonly string[];
    constructor(route: ConfigurableRoute<T>, paramNames: readonly string[]);
}
export declare class RecognizedRoute<T> {
    readonly endpoint: Endpoint<T>;
    readonly params: Readonly<Record<string, string | undefined>>;
    readonly searchParams: URLSearchParams;
    readonly isDynamic: boolean;
    readonly queryString: string;
    constructor(endpoint: Endpoint<T>, params: Readonly<Record<string, string | undefined>>, searchParams: URLSearchParams, isDynamic: boolean, queryString: string);
}
export declare class RouteRecognizer<T> {
    private readonly rootState;
    add(routeOrRoutes: IConfigurableRoute<T> | readonly IConfigurableRoute<T>[]): void;
    recognize(path: string): RecognizedRoute<T> | null;
}
//# sourceMappingURL=index.d.ts.map