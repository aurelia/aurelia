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
    constructor(endpoint: Endpoint<T>, params: Readonly<Record<string, string | undefined>>);
}
export declare class RouteRecognizer<T> {
    private readonly rootState;
    private readonly cache;
    add(routeOrRoutes: IConfigurableRoute<T> | readonly IConfigurableRoute<T>[]): void;
    private $add;
    recognize(path: string): RecognizedRoute<T> | null;
    private $recognize;
}
//# sourceMappingURL=index.d.ts.map