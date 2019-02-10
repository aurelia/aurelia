import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { Router } from './router';
import { Viewport } from './viewport';
import { IRouteableCustomElementType } from './viewport-content';

export class ViewportInstruction {
  public component?: Partial<ICustomElementType>;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;
  public parametersString?: string;
  public parameters?: Record<string, unknown>;
  public parametersList?: string[];

  constructor(component: Partial<ICustomElementType> | string, viewport?: Viewport | string, parameters?: Record<string, unknown> | string) {
    this.initialize(component, viewport, parameters);
  }

  public initialize(component: Partial<ICustomElementType> | string, viewport?: Viewport | string, parameters?: Record<string, unknown> | string): void {
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
    if (typeof parameters === 'string') {
      this.parametersString = parameters;
      // TODO: Initialize parameters better and more of them and just fix this
      this.parameters = { id: parameters };
    } else {
      this.parameters = parameters;
      // TODO: Create parametersString
    }
    // TODO: Deal with parametersList
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

  public sameComponent(other: ViewportInstruction, compareParameters: boolean = false, compareType: boolean = false): boolean {
    if (compareParameters && this.parametersString !== other.parametersString) {
      return false;
    }
    return compareType ? this.component === other.component : this.componentName === other.componentName;
  }
}
