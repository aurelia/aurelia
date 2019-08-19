import { Constructable, IContainer } from '@aurelia/kernel';
import { CustomElement, IRenderContext } from '@aurelia/runtime';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { IRouteableComponentType } from './interfaces';

export class ViewportInstruction {
  public component?: IRouteableComponentType;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;
  public parametersString?: string;
  public parameters?: Record<string, unknown>;
  public parametersList?: string[];
  public ownsScope?: boolean;
  public nextScopeInstruction?: ViewportInstruction;

  constructor(component: IRouteableComponentType | string, viewport?: Viewport | string, parameters?: Record<string, unknown> | string, ownsScope: boolean = true, nextScopeInstruction: ViewportInstruction = null) {
    this.component = null;
    this.componentName = null;
    this.viewport = null;
    this.viewportName = null;
    this.parametersString = null;
    this.parameters = null;
    this.parametersList = null;

    this.setComponent(component);
    this.setViewport(viewport);
    this.setParameters(parameters);

    this.ownsScope = ownsScope;
    this.nextScopeInstruction = nextScopeInstruction;
  }

  public setComponent(component: IRouteableComponentType | string): void {
    if (typeof component === 'string') {
      this.componentName = component;
      this.component = null;
    } else {
      this.component = component;
      this.componentName = component.description.name;
    }
  }

  public setViewport(viewport: Viewport | string): void {
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

  public setParameters(parameters: Record<string, unknown> | string): void {
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

  public componentType(context: IRenderContext): IRouteableComponentType {
    if (this.component !== null) {
      return this.component;
    }
    const container = context.get(IContainer);
    const resolver = container.getResolver<Constructable & IRouteableComponentType>(CustomElement.keyFrom(this.componentName));
    if (resolver !== null) {
      return resolver.getFactory(container).Type;
    }
    return null;
  }

  public viewportInstance(router: IRouter): Viewport {
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

  public sameViewport(other: ViewportInstruction): boolean {
    return (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
  }
}
