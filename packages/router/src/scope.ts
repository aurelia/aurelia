import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Viewport } from './viewport';
import { Router } from './router';

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
    const parts = name.split('+');
    const names = parts.shift().split(':');
    const comp = names.pop();
    name = names.shift();
    let newScope = false;
    if (name.endsWith('!')) {
      newScope = true;
      name = name.substr(0, name.length - 1);
    }
    const viewport = this.resolveViewport(name, comp) || this.addViewport(name, null, newScope);
    if (!parts.length) {
      return viewport;
    } else {
      const scope = viewport.scope || viewport.owningScope;
      return scope.findViewport(parts.join('+'));
    }
  }

  public resolveViewport(name: string, component: string): Viewport {
    if (name.length && name.charAt(0) !== '?') {
      return this.viewports[name];
    }
    // Need more ways to resolve viewport based on component name!
    const comp = this.resolveComponent(component);
    if ((<any>comp).viewport) {
      name = (<any>comp).viewport;
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

      viewport = this.viewports[name] = new Viewport(this.router.container, name, element, this, scope);
      // First added viewport with element is always scope viewport (except for root scope)
      if (element && scope && scope.parent && !scope.viewport) {
        scope.viewport = viewport;
      }
    }
    if (element) {
      if (viewport.scope && !viewport.scope.element) {
        viewport.scope.element = element;
      }
      if (!viewport.element) {
        viewport.element = element;
        if (!viewport.element.children) {
          this.renderViewport(viewport);
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

  public removeScope() {
    for (const child of this.children) {
      child.removeScope();
    }
    for (const viewport in this.viewports) {
      this.router.removeViewport(this.viewports[viewport]);
    }
  }

  public renderViewport(viewport: Viewport): Promise<any> {
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
      states.push((<Viewport>this.viewports[viewport]).description())
    }
    for (const scope of this.children) {
      states.push(...(<Scope>scope).viewportStates());
    }
    return states.filter((value) => value && value.length);
  }

  private resolveComponent(component: ICustomElementType | string): ICustomElementType {
    if (typeof component === 'string') {
      const resolver = this.router.container.getResolver(CustomElementResource.keyFrom(component));
      if (resolver !== null) {
        component = <ICustomElementType>resolver.getFactory(this.router.container).Type;
      }
    }
    return <ICustomElementType>component;
  }
}
