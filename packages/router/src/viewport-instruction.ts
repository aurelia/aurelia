import { IContainer } from '@aurelia/kernel';
import { CustomElement, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';

export class ViewportInstruction {
  public componentType?: IRouteableComponentType;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;
  public parametersString?: string;
  public parameters?: Record<string, unknown>;
  public parametersList?: string[];

  constructor(
    component: ComponentAppellation,
    viewport?: ViewportHandle,
    parameters?: ComponentParameters,
    public ownsScope: boolean = true,
    public nextScopeInstruction?: ViewportInstruction,
  ) {
    this.setComponent(component);
    this.setViewport(viewport);
    this.setParameters(parameters);
  }

  public setComponent(component: ComponentAppellation): void {
    if (typeof component === 'string') {
      this.componentName = component;
      this.componentType = null;
    } else {
      this.componentType = component as IRouteableComponentType;
      this.componentName = (component as ICustomElementType).description.name;
    }
  }

  public setViewport(viewport: ViewportHandle): void {
    if (viewport === undefined || viewport === '') {
      viewport = null;
    }
    if (typeof viewport === 'string') {
      this.viewportName = viewport;
      this.viewport = null;
    } else {
      this.viewport = viewport;
      if (viewport !== null) {
        this.viewportName = viewport.name;
      }
    }
  }

  public setParameters(parameters: ComponentParameters): void {
    if (parameters === undefined || parameters === '') {
      parameters = null;
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

  public toComponentType(context: IRenderContext): IRouteableComponentType {
    if (this.componentType !== null) {
      return this.componentType;
    }
    const container = context.get(IContainer);
    const resolver = container.getResolver<IRouteableComponentType>(CustomElement.keyFrom(this.componentName));
    if (resolver !== null) {
      return resolver.getFactory(container).Type;
    }
    return null;
  }

  public toViewportInstance(router: IRouter): Viewport {
    if (this.viewport !== null) {
      return this.viewport;
    }
    return router.allViewports()[this.viewportName];
  }

  public sameComponent(other: ViewportInstruction, compareParameters: boolean = false, compareType: boolean = false): boolean {
    if (compareParameters && this.parametersString !== other.parametersString) {
      return false;
    }
    return compareType ? this.componentType === other.componentType : this.componentName === other.componentName;
  }

  public sameViewport(other: ViewportInstruction): boolean {
    return (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
  }
}
