import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Router } from './router';
import { Viewport } from './viewport';

export interface IViewportCustomElementType extends ICustomElementType {
  viewport?: string;
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

  public findViewport(name: string): Viewport {
    const parts = name.split(this.router.separators.scope);
    const names = parts.shift().split(this.router.separators.viewport);
    const comp = names.pop();
    name = names.shift();
    let newScope = false;
    if (name.endsWith(this.router.separators.ownsScope)) {
      newScope = true;
      name = name.substr(0, name.length - 1);
    }
    const viewport = this.resolveViewport(name, comp) || this.addViewport(name, null, newScope);
    if (!parts.length) {
      return viewport;
    } else {
      const scope = viewport.scope || viewport.owningScope;
      return scope.findViewport(parts.join(this.router.separators.scope));
    }
  }

  public resolveViewport(name: string, component: string): Viewport {
    if (name.length && name.charAt(0) !== '?') {
      return this.viewports[name];
    }
    // Need more ways to resolve viewport based on component name!
    const comp = this.resolveComponent(component);
    if (comp.viewport) {
      name = comp.viewport;
      return this.viewports[name];
    }
    return null;
  }

  public addViewport(name: string, element: Element, newScope: boolean): Viewport {
    let viewport = this.viewports[name];
    if (!viewport) {
      let scope: Scope;
      if (newScope) {
        scope = new Scope(this.router, element, this);
        this.router.scopes.push(scope);
      }

      viewport = this.viewports[name] = new Viewport(this.router, name, element, this, scope);
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
      states.push((<Viewport>this.viewports[viewport]).scopedDescription());
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
        component = <ICustomElementType>resolver.getFactory(this.router.container).Type;
      }
    }
    return <ICustomElementType>component;
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
