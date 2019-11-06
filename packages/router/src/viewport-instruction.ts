import { IContainer } from '@aurelia/kernel';
import { CustomElement, IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponent, RouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { ComponentAppellationResolver } from './type-resolvers';
import { Viewport } from './viewport';

export const enum ParametersType {
  none = 'none',
  string = 'string',
  array = 'array',
  object = 'object',
}

export class ViewportInstruction {
  public componentName: string | null = null;
  public componentType: RouteableComponentType | null = null;
  public componentInstance: IRouteableComponent | null = null;
  public viewportName: string | null = null;
  public viewport: Viewport | null = null;
  public parametersString: string | null = null;
  public parameters: Record<string, unknown> | null = null;
  public parametersList: string[] | null = null;
  public parametersType: ParametersType = ParametersType.none;

  public scope: Viewport | null = null;
  public needsViewportDescribed: boolean = false;

  public default: boolean = false;

  public constructor(
    component: ComponentAppellation,
    viewport?: ViewportHandle,
    parameters?: ComponentParameters,
    public ownsScope: boolean = true,
    public nextScopeInstructions: ViewportInstruction[] | null = null,
  ) {
    this.setComponent(component);
    this.setViewport(viewport);
    this.setParameters(parameters);
  }

  public setComponent(component: ComponentAppellation): void {
    if (ComponentAppellationResolver.isName(component)) {
      this.componentName = ComponentAppellationResolver.getName(component);
      this.componentType = null;
      this.componentInstance = null;
    } else if (ComponentAppellationResolver.isType(component)) {
      this.componentName = ComponentAppellationResolver.getName(component);
      this.componentType = ComponentAppellationResolver.getType(component);
      this.componentInstance = null;
    } else if (ComponentAppellationResolver.isInstance(component)) {
      this.componentName = ComponentAppellationResolver.getName(component);
      this.componentType = ComponentAppellationResolver.getType(component);
      this.componentInstance = ComponentAppellationResolver.getInstance(component);
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
        this.scope = viewport.owningScope;
      }
    }
  }

  public setParameters(parameters?: ComponentParameters | null): void {
    // TODO: Initialize parameters better and more of them and just fix this
    if (parameters === undefined || parameters === null || parameters === '') {
      this.parametersType = ParametersType.none;
      parameters = null;
    } else if (typeof parameters === 'string') {
      this.parametersType = ParametersType.string;
      this.parametersString = parameters;
      this.parameters = { id: parameters };
    } else if (Array.isArray(parameters)) {
      this.parametersType = ParametersType.array;
      this.parametersList = parameters;
      this.parametersString = this.parametersList.join(',');
    } else {
      this.parametersType = ParametersType.object;
      this.parameters = parameters;
      this.parametersString = Object.keys(this.parameters!).map(param => `${param}=${this.parameters![param]}`).join(',');
    }
  }

  // This only works with objects added to objects!
  public addParameters(parameters: Record<string, unknown>): void {
    if (this.parametersType === ParametersType.none) {
      return this.setParameters(parameters);
    }
    if (this.parametersType !== ParametersType.object) {
      throw new Error('Can\'t add object parameters to existing non-object parameters!');
    }
    this.setParameters({ ...this.parameters, ...parameters });
  }

  public isEmpty(): boolean {
    return !this.isComponentName() && !this.isComponentType() && !this.isComponentInstance();
  }
  public isComponentName(): boolean {
    return !!this.componentName && !this.isComponentType() && !this.isComponentInstance();
  }
  public isComponentType(): boolean {
    return this.componentType !== null && !this.isComponentInstance();
  }
  public isComponentInstance(): boolean {
    return this.componentInstance !== null;
  }

  public toComponentType(context: IRenderContext | IContainer): RouteableComponentType | null {
    if (this.componentType !== null) {
      return this.componentType;
    }
    if (this.componentName !== null && typeof this.componentName === 'string') {
      const container = context.get(IContainer);
      if (container !== null && container.has<RouteableComponentType>(CustomElement.keyFrom(this.componentName), true)) {
        const resolver = container.getResolver<RouteableComponentType>(CustomElement.keyFrom(this.componentName));
        if (resolver !== null && resolver.getFactory !== void 0) {
          const factory = resolver.getFactory(container);
          if (factory) {
            return factory.Type;
          }
        }
      }
    }
    return null;
  }
  public toComponentInstance(context: IRenderContext | IContainer): IRouteableComponent | null {
    if (this.componentInstance !== null) {
      return this.componentInstance;
    }
    // TODO: Remove once "local registration is fixed"
    // const component = this.toComponentName();
    const container = context.get(IContainer);
    if (container !== void 0 && container !== null) {
      if (this.isComponentType()) {
        return container.get<IRouteableComponent>(this.componentType!);
      } else {
        return container.get<IRouteableComponent>(CustomElement.keyFrom(this.componentName!));
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

  // TODO: Somewhere we need to check for format such as spaces etc
  public sameParameters(other: ViewportInstruction): boolean {
    return this.parametersString === other.parametersString;
  }

  public sameViewport(other: ViewportInstruction): boolean {
    if (this.viewport !== null && other.viewport !== null) {
      return this.viewport === other.viewport;
    }
    return this.scope === other.scope &&
      (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
  }
}
