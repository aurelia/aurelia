import { IContainer } from '@aurelia/kernel';
import { Viewport } from './viewport';

export class Scope {
  public viewport: Viewport;

  public viewports: Object = {};

  constructor(private container: IContainer, public element: Element, public parent: Scope) {
  }

  public findViewport(name: string): Viewport {
    return this.viewports[name] || this.addViewport(name, null);
  }

  public addViewport(name: string, element: Element): Viewport {
    const viewport = this.viewports[name];
    if (!viewport) {
      return this.viewports[name] = new Viewport(this.container, name, element, this);
    }
    if (element) {
      Promise.resolve().then(() => {
        viewport.element = element;
        this.renderViewport(viewport);
      });
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
}
