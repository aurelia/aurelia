import { IRouter } from '../router.js';
import { Viewport } from '../endpoints/viewport.js';
import { RoutingScope } from '../routing-scope.js';

/**
 * Public API - The routing instructions are the core of the router's navigations
 */

export type ViewportHandle = string | Viewport;

export class InstructionViewport {
  public name: string | null = null;
  public instance: Viewport | null = null;

  public scope: RoutingScope | null = null;

  public get none(): boolean {
    return this.name === null && this.instance === null;
  }

  public static create(viewportHandle?: ViewportHandle | null): InstructionViewport {
    const viewport = new InstructionViewport();
    viewport.set(viewportHandle);
    return viewport;
  }

  public static isName(viewport: ViewportHandle): viewport is string {
    return typeof viewport === 'string';
  }
  public static isInstance(viewport: ViewportHandle): viewport is Viewport {
    return viewport instanceof Viewport;
  }
  public static getName(viewport: ViewportHandle): string | null {
    if (InstructionViewport.isName(viewport)) {
      return viewport;
    } else {
      return viewport ? (viewport).name : null;
    }
  }
  public static getInstance(viewport: ViewportHandle): Viewport | null {
    if (InstructionViewport.isName(viewport)) {
      return null;
    } else {
      return viewport;
    }
  }

  public set(viewport?: ViewportHandle | null): void {
    if (viewport === undefined || viewport === '') {
      viewport = null;
    }
    if (typeof viewport === 'string') {
      this.name = viewport;
      this.instance = null;
    } else {
      this.instance = viewport;
      if (viewport !== null) {
        this.name = viewport.name;
        this.scope = viewport.owningScope;
      }
    }
  }

  public toInstance(router: IRouter): Viewport | null {
    if (this.instance !== null) {
      return this.instance;
    }
    return router.getEndpoint('Viewport', this.name as string) as Viewport | null;
  }

  public same(other: InstructionViewport, compareScope: boolean): boolean {
    if (this.instance !== null && other.instance !== null) {
      return this.instance === other.instance;
    }
    return (!compareScope || this.scope === other.scope) &&
      (this.instance !== null ? this.instance.name : this.name) ===
      (other.instance !== null ? other.instance.name : other.name);
  }
}
