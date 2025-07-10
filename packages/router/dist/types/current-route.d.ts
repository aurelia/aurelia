import type { Params, ViewportInstruction } from './instructions';
import type { RouteConfig } from './route';
export declare const ICurrentRoute: import("@aurelia/kernel").InterfaceSymbol<ICurrentRoute>;
export interface ICurrentRoute extends CurrentRoute {
}
export declare class CurrentRoute {
    readonly path: string;
    readonly url: string;
    readonly title: string;
    readonly query: URLSearchParams;
    readonly parameterInformation: ParameterInformation[];
    constructor();
}
export declare class ParameterInformation {
    readonly config: RouteConfig | null;
    readonly viewport: string | null;
    readonly params: Readonly<Params> | null;
    readonly children: ParameterInformation[];
    private constructor();
    static create(instruction: ViewportInstruction): ParameterInformation;
}
//# sourceMappingURL=current-route.d.ts.map