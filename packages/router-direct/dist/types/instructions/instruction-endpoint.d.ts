import { IRouter } from '../router';
import { Endpoint, EndpointTypeName } from '../endpoints/endpoint';
import { RoutingScope } from '../routing-scope';
/**
 * Public API - The routing instructions are the core of the router's navigations
 */
export type EndpointHandle = string | Endpoint;
export declare class InstructionEndpoint {
    name: string | null;
    instance: Endpoint | null;
    scope: RoutingScope | null;
    get none(): boolean;
    get endpointType(): EndpointTypeName | null;
    static create(endpointHandle?: EndpointHandle | null): InstructionEndpoint;
    static isName(endpoint: EndpointHandle): endpoint is string;
    static isInstance(endpoint: EndpointHandle): endpoint is Endpoint;
    static getName(endpoint: EndpointHandle): string | null;
    static getInstance(endpoint: EndpointHandle): Endpoint | null;
    set(endpoint?: EndpointHandle | null): void;
    toInstance(router: IRouter): Endpoint | null;
    same(other: InstructionEndpoint, compareScope: boolean): boolean;
}
//# sourceMappingURL=instruction-endpoint.d.ts.map