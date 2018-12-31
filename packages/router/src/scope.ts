import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Router } from './router';
import { IFindViewportsResult } from './scope';
import { IViewportOptions, Viewport } from './viewport';

export interface IViewportCustomElementType extends ICustomElementType {
  viewport?: string;
}

export interface IComponentViewport {
  component: ICustomElementType | string;
  viewport: Viewport;
}

export interface IFindViewportsResult {
  componentViewports?: IComponentViewport[];
  viewportsRemaining?: boolean;
}

export class Scope {
  public viewport: Viewport;

  public children: Scope[] = [];
  public viewports: Object = {};

  private scopeViewportParts: Object = {};
  private availableViewports: Object;

  constructor(private router: Router, public element: Element, public parent: Scope) {
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  public findViewports(viewports?: Object): IFindViewportsResult {
    const componentViewports: IComponentViewport[] = [];
    let viewportsRemaining: boolean = false;

    // Get a shallow copy of all available viewports (clean if it's the first find)
    if (viewports) {
      this.availableViewports = {};
      this.scopeViewportParts = {};
    }
    this.availableViewports = { ...this.viewports, ...this.availableViewports };

    // Get the parts for this scope (pointing to the rest)
    for (const viewport in viewports) {
      const parts = viewport.split(this.router.separators.scope);
      const vp = parts.shift();
      if (!this.scopeViewportParts[vp]) {
        this.scopeViewportParts[vp] = [];
      }
      this.scopeViewportParts[vp].push(parts);
    }

    // Configured viewport is ruling
    for (const viewportPart in this.scopeViewportParts) {
      const parameters = viewportPart.split(this.router.separators.parameters);
      const componentViewportPart = parameters.shift();
      const component = componentViewportPart.split(this.router.separators.viewport).shift();
      const componentParameters = component + (parameters.length ? this.router.separators.parameters + parameters.join(this.router.separators.parameters) : '');
      for (const name in this.availableViewports) {
        const viewport: Viewport = this.availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport && viewport.wantComponent(component)) {
          const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
          componentViewports.push(...found.componentViewports);
          viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
          this.availableViewports[name] = null;
          delete this.scopeViewportParts[viewportPart];
          break;
        }
      }
    }

    // Next in line is specified viewport
    for (const viewportPart in this.scopeViewportParts) {
      const parameters = viewportPart.split(this.router.separators.parameters);
      const componentViewportPart = parameters.shift();
      const parts = componentViewportPart.split(this.router.separators.viewport);
      const component = parts.shift();
      const componentParameters = component + (parameters.length ? this.router.separators.parameters + parameters.join(this.router.separators.parameters) : '');
      let name = parts.shift();
      if (!name || !name.length || name.startsWith('?')) {
        continue;
      }
      let newScope = false;
      if (name.endsWith(this.router.separators.ownsScope)) {
        newScope = true;
        name = name.substr(0, name.length - 1);
      }
      if (!this.viewports[name]) {
        this.addViewport(name, null, { scope: newScope, forceDescription: true });
        this.availableViewports[name] = this.viewports[name];
      }
      const viewport = this.availableViewports[name];
      if (viewport && viewport.acceptComponent(component)) {
        const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
        componentViewports.push(...found.componentViewports);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
        this.availableViewports[name] = null;
        delete this.scopeViewportParts[viewportPart];
      }
    }

    // Finally, only one accepting viewport left?
    for (const viewportPart in this.scopeViewportParts) {
      const parameters = viewportPart.split(this.router.separators.parameters);
      const componentViewportPart = parameters.shift();
      const component = componentViewportPart.split(this.router.separators.viewport).shift();
      const componentParameters = component + (parameters.length ? this.router.separators.parameters + parameters.join(this.router.separators.parameters) : '');
      const remainingViewports = [];
      for (const name in this.availableViewports) {
        const viewport: Viewport = this.availableViewports[name];
        if (viewport && viewport.acceptComponent(component)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        const viewport = remainingViewports.shift();
        const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
        componentViewports.push(...found.componentViewports);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
        this.availableViewports[viewport.name] = null;
        delete this.scopeViewportParts[viewportPart];
        break;
      }
    }

    viewportsRemaining = viewportsRemaining || Object.keys(this.scopeViewportParts).length > 0;

    // If it's a repeat there might be remaining viewports in scope children
    if (!viewports) {
      for (const child of this.children) {
        const found = child.findViewports();
        componentViewports.push(...found.componentViewports);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
      }
    }

    return {
      componentViewports: componentViewports,
      viewportsRemaining: viewportsRemaining,
    };
  }

  public foundViewport(viewports: Object, scopeViewportParts: Object, viewportPart: string, component: ICustomElementType | string, viewport: Viewport): IFindViewportsResult {
    const componentViewports: IComponentViewport[] = [{ component: component, viewport: viewport }];
    let viewportsRemaining: boolean = false;

    if (scopeViewportParts[viewportPart].length) {
      const scope = viewport.scope || viewport.owningScope;
      for (const remainingParts of scopeViewportParts[viewportPart]) {
        if (remainingParts.length) {
          const remaining = remainingParts.join(this.router.separators.scope);
          const vps = {};
          vps[remaining] = viewports[viewportPart + this.router.separators.scope + remaining];
          const scoped = scope.findViewports(vps);
          componentViewports.push(...scoped.componentViewports);
          viewportsRemaining = viewportsRemaining || scoped.viewportsRemaining;
        }
      }
    }
    return {
      componentViewports: componentViewports,
      viewportsRemaining: viewportsRemaining,
    };
  }

  // public findViewport(name: string): Viewport {
  //   const parts = name.split(this.router.separators.scope);
  //   const names = parts.shift().split(this.router.separators.viewport);
  //   const comp = names.shift();
  //   name = names.shift();
  //   let newScope = false;
  //   if (name.endsWith(this.router.separators.ownsScope)) {
  //     newScope = true;
  //     name = name.substr(0, name.length - 1);
  //   }
  //   const viewport = this.resolveViewport(name, comp) || this.addViewport(name, null, { scope: newScope });
  //   if (!parts.length) {
  //     return viewport;
  //   } else {
  //     const scope = viewport.scope || viewport.owningScope;
  //     return scope.findViewport(parts.join(this.router.separators.scope));
  //   }
  // }

  // public resolveViewport(name: string, component: string): Viewport {
  //   if (name.length && name.charAt(0) !== '?') {
  //     return this.viewports[name];
  //   }
  //   // Need more ways to resolve viewport based on component name!
  //   const comp = this.resolveComponent(component);
  //   if (comp.viewport) {
  //     name = comp.viewport;
  //     return this.viewports[name];
  //   }
  //   return null;
  // }

  public addViewport(name: string, element: Element, options?: IViewportOptions): Viewport {
    let viewport = this.viewports[name];
    if (!viewport) {
      let scope: Scope;
      if (options.scope) {
        scope = new Scope(this.router, element, this);
        this.router.scopes.push(scope);
      }

      viewport = this.viewports[name] = new Viewport(this.router, name, element, this, scope, options);
    }
    if (element) {
      // First added viewport with element is always scope viewport (except for root scope)
      if (viewport.scope && viewport.scope.parent && !viewport.scope.viewport) {
        viewport.scope.viewport = viewport;
      }
      if (viewport.scope && !viewport.scope.element) {
        viewport.scope.element = element;
      }
      if (!viewport.element) {
        viewport.element = element;
        if (!viewport.element.children) {
          this.renderViewport(viewport).catch(error => { throw error; });
        }
      }
    }
    return viewport;
  }
  public removeViewport(viewport: Viewport): number {
    if (viewport.scope) {
      this.router.removeScope(viewport.scope);
    }
    delete this.viewports[viewport.name];
    return Object.keys(this.viewports).length;
  }

  public removeScope(): void {
    for (const child of this.children) {
      child.removeScope();
    }
    for (const viewport in this.viewports) {
      this.router.removeViewport(this.viewports[viewport]);
    }
  }

  public renderViewport(viewport: Viewport): Promise<boolean> {
    return viewport.canEnter().then(() => viewport.loadContent());
  }

  public addChild(child: Scope): void {
    if (this.children.indexOf(child) < 0) {
      this.children.push(child);
    }
  }
  public removeChild(child: Scope): void {
    this.children.splice(this.children.indexOf(child), 1);
  }

  public viewportStates(full: boolean = false): string[] {
    const states: string[] = [];
    for (const viewport in this.viewports) {
      states.push((this.viewports[viewport] as Viewport).scopedDescription(full));
    }
    for (const scope of this.children) {
      states.push(...scope.viewportStates(full));
    }
    return states.filter((value) => value && value.length);
  }

  public allViewports(): Viewport[] {
    const viewports: Viewport[] = [];
    for (const viewport in this.viewports) {
      viewports.push(this.viewports[viewport]);
    }
    for (const scope of this.children) {
      viewports.push(...scope.allViewports());
    }
    return viewports;
  }

  public context(full: boolean = false): string {
    if (!this.element || !this.parent) {
      return '';
    }
    const parents: string[] = [];
    if (this.viewport) {
      parents.unshift(this.viewport.description(full));
    }
    let viewport: Viewport = this.parent.closestViewport(this.element.parentElement);
    while (viewport && viewport.owningScope === this.parent) {
      parents.unshift(viewport.description(full));
      viewport = this.closestViewport(viewport.element.parentElement);
    }
    parents.unshift(this.parent.context(full));

    return parents.filter((value) => value && value.length).join(this.router.separators.scope);
  }

  private resolveComponent(component: ICustomElementType | string): IViewportCustomElementType {
    if (typeof component === 'string') {
      const resolver = this.router.container.getResolver(CustomElementResource.keyFrom(component));
      if (resolver !== null) {
        component = resolver.getFactory(this.router.container).Type as ICustomElementType;
      }
    }
    return component as ICustomElementType;
  }

  // This is not an optimal way of doing this
  private closestViewport(element: Element): Viewport {
    let closest: number = Number.MAX_SAFE_INTEGER;
    let viewport: Viewport;
    for (const vp in this.viewports) {
      const viewportElement = this.viewports[vp].element;
      let el = element;
      let i = 0;
      while (el) {
        if (el === viewportElement) {
          break;
        }
        i++;
        el = el.parentElement;
      }
      if (i < closest) {
        closest = i;
        viewport = this.viewports[vp];
      }
    }
    return viewport;
  }
}
