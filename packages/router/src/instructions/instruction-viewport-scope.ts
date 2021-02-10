/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IRouter } from '../router.js';
import { RoutingScope } from '../routing-scope.js';
import { ViewportScope } from '../endpoints/viewport-scope.js';

/**
 * Public API - The routing instructions are the core of the router's navigations
 */

export type ViewportScopeHandle = string | ViewportScope;

export class InstructionViewportScope {
  public name: string | null = null;
  public instance: ViewportScope | null = null;

  public scope: RoutingScope | null = null;

  public get none(): boolean {
    return this.name === null && this.instance === null;
  }

  public static create(viewportScopeHandle?: ViewportScopeHandle | null): InstructionViewportScope {
    const viewportScope = new InstructionViewportScope();
    viewportScope.set(viewportScopeHandle);
    return viewportScope;
  }

  public static isName(viewportScope: ViewportScopeHandle): viewportScope is string {
    return typeof viewportScope === 'string';
  }
  public static isInstance(viewportScope: ViewportScopeHandle): viewportScope is ViewportScope {
    return viewportScope instanceof ViewportScope;
  }
  public static getName(viewportScope: ViewportScopeHandle): string | null {
    if (InstructionViewportScope.isName(viewportScope)) {
      return viewportScope;
    } else {
      return viewportScope ? (viewportScope).name : null;
    }
  }
  public static getInstance(viewportScope: ViewportScopeHandle): ViewportScopeHandle | null {
    if (InstructionViewportScope.isName(viewportScope)) {
      return null;
    } else {
      return viewportScope;
    }
  }

  public set(viewportScope?: ViewportScopeHandle | null): void {
    if (viewportScope === undefined || viewportScope === '') {
      viewportScope = null;
    }
    if (typeof viewportScope === 'string') {
      this.name = viewportScope;
      this.instance = null;
    } else {
      this.instance = viewportScope;
      if (viewportScope !== null) {
        this.name = viewportScope.name;
        this.scope = viewportScope.owningScope;
      }
    }
  }

  public toInstance(router: IRouter): ViewportScope | null {
    if (this.instance !== null) {
      return this.instance;
    }
    return null; // TODO: router.getViewportScope(this.name as string);
  }

  public same(other: InstructionViewportScope): boolean {
    if (this.instance !== null && other.instance !== null) {
      return this.instance === other.instance;
    }
    return this.scope === other.scope &&
      (this.instance ? this.instance.name : this.name) === (other.instance ? other.instance.name : other.name);
  }
}
