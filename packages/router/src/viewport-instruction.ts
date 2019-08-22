import { IContainer } from '@aurelia/kernel';
import { CustomElement, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';

export class ViewportInstruction {
  public componentType: IRouteableComponentType | null = null;
  public componentName: string | null = null;
  public viewport: Viewport | null = null;
  public viewportName: string | null = null;
  public parametersString: string | null = null;
  public parameters: Record<string, unknown> | null = null;
  public parametersList: string[] | null = null;

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

  public setViewport(viewport?: ViewportHandle | null): void {
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

  public setParameters(parameters?: ComponentParameters | null): void {
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

  public toComponentType(context: IRenderContext): IRouteableComponentType | null {
    if (this.componentType !== null) {
      return this.componentType;
    }
    if (this.componentName !== null) {
      const container = context.get(IContainer);
      if (container) {
        const resolver = container.getResolver<IRouteableComponentType>(CustomElement.keyFrom(this.componentName));
        if (resolver) {
          return resolver.getFactory(container).Type;
        }
      }
    }
    return null;
  }

  public toViewportInstance(router: IRouter): Viewport | null {
    if (this.viewport !== null) {
      return this.viewport;
    }
    return router.getViewport(this.viewportName as string);
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
