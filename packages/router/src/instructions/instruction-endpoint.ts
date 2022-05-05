import { IRouter } from '../router';
import { Endpoint, EndpointTypeName } from '../endpoints/endpoint';
import { RoutingScope } from '../routing-scope';
import { Viewport } from '../endpoints/viewport';
import { ViewportScope } from '../endpoints/viewport-scope';

/**
 * Public API - The routing instructions are the core of the router's navigations
 */

export type EndpointHandle = string | Endpoint;

export class InstructionEndpoint {
  public name: string | null = null;
  public instance: Endpoint | null = null;

  public scope: RoutingScope | null = null;

  public get none(): boolean {
    return this.name === null && this.instance === null;
  }

  public get endpointType(): EndpointTypeName | null {
    if (this.instance instanceof Viewport) {
      return 'Viewport';
    }
    if (this.instance instanceof ViewportScope) {
      return 'ViewportScope';
    }
    return null;
  }

  public static create(endpointHandle?: EndpointHandle | null): InstructionEndpoint {
    const endpoint = new InstructionEndpoint();
    endpoint.set(endpointHandle);
    return endpoint;
  }

  public static isName(endpoint: EndpointHandle): endpoint is string {
    return typeof endpoint === 'string';
  }
  public static isInstance(endpoint: EndpointHandle): endpoint is Endpoint {
    return endpoint instanceof Endpoint;
  }
  public static getName(endpoint: EndpointHandle): string | null {
    if (InstructionEndpoint.isName(endpoint)) {
      return endpoint;
    } else {
      return endpoint ? (endpoint).name : null;
    }
  }
  public static getInstance(endpoint: EndpointHandle): Endpoint | null {
    if (InstructionEndpoint.isName(endpoint)) {
      return null;
    } else {
      return endpoint;
    }
  }

  public set(endpoint?: EndpointHandle | null): void {
    if (endpoint === undefined || endpoint === '') {
      endpoint = null;
    }
    if (typeof endpoint === 'string') {
      this.name = endpoint;
      this.instance = null;
    } else {
      this.instance = endpoint;
      if (endpoint !== null) {
        this.name = endpoint.name;
        this.scope = endpoint.owningScope;
      }
    }
  }

  public toInstance(router: IRouter): Endpoint | null {
    if (this.instance !== null) {
      return this.instance;
    }
    return router.getEndpoint(this.endpointType as EndpointTypeName, this.name as string) as Endpoint | null;
  }

  public same(other: InstructionEndpoint, compareScope: boolean): boolean {
    if (this.instance !== null && other.instance !== null) {
      return this.instance === other.instance;
    }
    return (this.endpointType === null ||
      other.endpointType === null ||
      this.endpointType === other.endpointType
    ) &&
      (!compareScope || this.scope === other.scope) &&
      (this.instance !== null ? this.instance.name : this.name) ===
      (other.instance !== null ? other.instance.name : other.name);
  }
}
