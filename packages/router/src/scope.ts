import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Viewport } from './viewport';

export class Scope {
  public viewport: Viewport;

  public children: Scope[] = [];
  public viewports: Object = {};

  constructor(private container: IContainer, public element: Element, public parent: Scope) {
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  //xx  public findViewport(name: string): Promise<Viewport> {
  public findViewport(name: string): Viewport {
    const parts = name.split('.');
    const names = parts.shift().split(':');
    const comp = names.pop();
    name = names.shift();
    const viewport = this.resolveViewport(name, comp) || this.addViewport(name, null, null);
    if (!parts.length) {
      return viewport;
      //xx return Promise.resolve(viewport);
    } else {
      //xx if (viewport.scope) {
        return viewport.scope.findViewport(parts.join('.'));
      //xx }
      // else {
      //   return new Promise<Viewport>((resolve, reject) => {
      //     viewport.pendingQueries.push({
      //       name: parts.join('.'),
      //       resolve: resolve,
      //     });
      //   });
      //xx }
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
      return this.viewports[name] || this.addViewport(name, null, this);
    }
    return null;
  }

  public addViewport(name: string, element: Element, scope: Scope): Viewport {
    let viewport = this.viewports[name];
    if (!viewport) {
      viewport = this.viewports[name] = new Viewport(this.container, name, element, scope);
      // First added viewport with element is always scope viewport (except for root scope)
      if (element && scope.parent && !scope.viewport) {
        scope.viewport = viewport;
      }
    }
    if (element) {
      viewport.scope = scope;
      viewport.element = element;
      // Promise.resolve(viewport).then((viewport) => {
      this.renderViewport(viewport);
      //xx Promise.resolve(viewport).then((viewport) => {
      //   while (viewport.pendingQueries.length) {
      //     const query = viewport.pendingQueries.shift();
      //     query.resolve(this.findViewport(query.name));
      //   }
      //xx });
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
      const resolver = this.container.getResolver(CustomElementResource.keyFrom(component));
      if (resolver !== null) {
        component = <ICustomElementType>resolver.getFactory(this.container).Type;
      }
    }
    return <ICustomElementType>component;
  }
}
