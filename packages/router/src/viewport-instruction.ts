import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { Router } from './router';
import { Viewport } from './viewport';
import { IRouteableCustomElementType } from './viewport-content';

export class ViewportInstruction {
  public component?: ICustomElementType;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;
  public parameters?: Record<string, unknown>;

  constructor(component: ICustomElementType | string, viewport?: Viewport | string, parameters?: Record<string, unknown>) {
    this.initialize(component, viewport, parameters);
  }

  public initialize(component: ICustomElementType | string, viewport?: Viewport | string, parameters?: Record<string, unknown>): void {
    if (typeof component === 'string') {
      this.componentName = component;
      this.component = null;
    } else {
      this.component = component;
      this.componentName = component.description.name;
    }
    if (typeof viewport === 'string') {
      this.viewportName = viewport;
      this.viewport = null;
    } else {
      this.viewport = viewport;
      if (viewport) {
        this.viewportName = viewport.name;
      }
    }
    this.parameters = parameters;
  }

  public componentType(context: IRenderContext): IRouteableCustomElementType {
    if (this.component !== null) {
      return this.component;
    }
    const container = context.get(IContainer);
    const resolver = container.getResolver(CustomElementResource.keyFrom(this.componentName));
    if (resolver !== null) {
      return resolver.getFactory(container).Type as IRouteableCustomElementType;
    }
    return null;
  }

  public viewportInstance(router: Router): Viewport {
    if (this.viewport !== null) {
      return this.viewport;
    }
    return router.allViewports()[this.viewportName];
  }
}
