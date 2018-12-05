import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Router } from './router';
import { IViewportOptions, Viewport } from './viewport';

export interface IViewportCustomElementType extends ICustomElementType {
  viewport?: string;
}

export interface IComponentViewport {
  component: ICustomElementType | string;
  viewport: Viewport;
}

export class Scope {
  public viewport: Viewport;

  public children: Scope[] = [];
  public viewports: Object = {};

  constructor(private router: Router, public element: Element, public parent: Scope) {
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  public findViewports(viewports: Object): IComponentViewport[] {
    const foundViewports: IComponentViewport[] = [];
    // Get a shallow copy of all available viewports
    const availableViewports = { ...this.viewports };

    // Get the parts for this scope (pointing to the rest)
    const scopeViewportParts = {};
    for (const viewport in viewports) {
      const parts = viewport.split(this.router.separators.scope);
      const vp = parts.shift();
      scopeViewportParts[vp] = parts;
    }

    // Configured viewport is ruling
    for (const viewportPart in scopeViewportParts) {
      const component = viewportPart.split(this.router.separators.viewport).shift();
      for (const name in availableViewports) {
        const viewport: Viewport = availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport.wantComponent(component)) {
          foundViewports.push(...this.foundViewport(viewports, scopeViewportParts, viewportPart, component, viewport));
          delete availableViewports[name];
          delete scopeViewportParts[viewportPart];
          break;
        }
      }
    }

    // Next in line is specified viewport
    for (const viewportPart in scopeViewportParts) {
      const parts = viewportPart.split(this.router.separators.viewport)
      const component = parts.shift();
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
        availableViewports[name] = this.viewports[name];
      }
      const viewport = availableViewports[name];
      if (viewport && viewport.acceptComponent(component)) {
        foundViewports.push(...this.foundViewport(viewports, scopeViewportParts, viewportPart, component, viewport));
        delete availableViewports[name];
        delete scopeViewportParts[viewportPart];
        break;
      }
    }

    // Finally, only one accepting viewport left?
    for (const viewportPart in scopeViewportParts) {
      const component = viewportPart.split(this.router.separators.viewport).shift();
      const remainingViewports = [];
      for (const name in availableViewports) {
        const viewport: Viewport = availableViewports[name];
        if (viewport.acceptComponent(component)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        const viewport = remainingViewports.shift();
        foundViewports.push(...this.foundViewport(viewports, scopeViewportParts, viewportPart, component, viewport));
        delete availableViewports[name];
        delete scopeViewportParts[viewportPart];
        break;
      }
    }
    return foundViewports;
  }

  public foundViewport(viewports: Object, scopeViewportParts: Object, viewportPart: string, component: ICustomElementType | string, viewport: Viewport): IComponentViewport[] {
    if (!scopeViewportParts[viewportPart].length) {
      return [{ component: component, viewport: viewport }];
    } else {
      const scope = viewport.scope || viewport.owningScope;
      const remaining = scopeViewportParts[viewportPart].join(this.router.separators.scope);
      const vps = {};
      vps[remaining] = viewports[viewportPart + this.router.separators.scope + remaining];
      return scope.findViewports(vps);
    }
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

  public viewportStates(): string[] {
    const states: string[] = [];
    for (const viewport in this.viewports) {
      states.push((this.viewports[viewport] as Viewport).scopedDescription());
    }
    for (const scope of this.children) {
      states.push(...scope.viewportStates());
    }
    return states.filter((value) => value && value.length);
  }

  public context(): string {
    if (!this.element || !this.parent) {
      return '';
    }
    const parents: string[] = [];
    if (this.viewport) {
      parents.unshift(this.viewport.description());
    }
    let viewport: Viewport = this.parent.closestViewport(this.element.parentElement);
    while (viewport && viewport.owningScope === this.parent) {
      parents.unshift(viewport.description());
      viewport = this.closestViewport(viewport.element.parentElement);
    }
    parents.unshift(this.parent.context());

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
