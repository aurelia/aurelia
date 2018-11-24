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

  public findViewport(name: string): Promise<Viewport> {
    const parts = name.split('.');
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
      return Promise.resolve(viewport);
    } else {
      if (viewport.scope) {
        return viewport.scope.findViewport(parts.join('.'));
      }
      else {
        return new Promise<Viewport>((resolve, reject) => {
          viewport.pendingQueries.push({
            name: parts.join('.'),
            resolve: resolve,
          });
        });
      }
    }
  }

  public resolveViewport(name: string, component: string): Viewport {
    if (name.length && name.charAt(0) !== '+') {
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
    let scope: Scope = this;
    let viewport = this.viewports[name];
    if (!viewport) {
      if (newScope) {
        scope = new Scope(this.router, element, this);
        this.router.scopes.push(scope);
      }

      viewport = this.viewports[name] = new Viewport(this.router.container, name, element, scope);
      // First added viewport with element is always scope viewport (except for root scope)
      if (element && scope.parent && !scope.viewport) {
        scope.viewport = viewport;
      }
    }
    if (element) {
      if (!viewport.scope.element) {
        viewport.scope.element = element;
      }
      viewport.element = element;
      // Promise.resolve(viewport).then((viewport) => {
      this.renderViewport(viewport);
      Promise.resolve(viewport).then((viewport) => {
        while (viewport.pendingQueries.length) {
          const query = viewport.pendingQueries.shift();
          query.resolve(this.findViewport(query.name));
        }
      });
      // });
    }
    return viewport;
  }
  public removeViewport(viewport: Viewport): number {
    delete this.viewports[viewport.name];
    return Object.keys(this.viewports).length;
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
