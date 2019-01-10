import { CustomElementResource, ICustomElement, ICustomElementType, IDOM, INode, IProjectorLocator, IRenderingEngine, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { mergeParameters } from './parser';
import { Router } from './router';
import { Scope } from './scope';
import { IRouteableCustomElement, IViewportOptions } from './viewport';

export interface IRouteableCustomElementType extends ICustomElementType {
  parameters?: string[];
}

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?: Function;
  enter?: Function;
  canLeave?: Function;
  leave?: Function;
}

export interface IViewportOptions {
  scope?: boolean;
  usedBy?: string | string[];
  default?: string;
  noLink?: boolean;
  noHistory?: boolean;
  forceDescription?: boolean;
}

export class Viewport {
  public name: string;
  public element: Element;
  public owningScope: Scope;
  public scope: Scope;
  public options?: IViewportOptions;

  public content: IRouteableCustomElementType;
  public nextContent: IRouteableCustomElementType;
  public parameters: string;
  public nextParameters: string;

  public instruction: INavigationInstruction;
  public nextInstruction: INavigationInstruction;

  public component: IRouteableCustomElement;
  public nextComponent: IRouteableCustomElement;

  private readonly router: Router;

  private clear: boolean;
  private elementResolve: Function;

  constructor(router: Router, name: string, element: Element, owningScope: Scope, scope: Scope, options?: IViewportOptions) {
    this.router = router;
    this.name = name;
    this.element = element;
    this.owningScope = owningScope;
    this.scope = scope;
    this.options = options;

    this.clear = false;

    this.content = null;
    this.nextContent = null;
    this.parameters = null;
    this.nextParameters = null;
    this.instruction = null;
    this.nextInstruction = null;
    this.component = null;
    this.nextComponent = null;
    this.elementResolve = null;
  }

  public setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean {
    let parameters;
    this.clear = false;
    if (typeof content === 'string') {
      if (content === this.router.separators.clear) {
        this.clear = true;
        content = null;
      } else {
        const cp = content.split(this.router.separators.parameters);
        content = cp.shift();
        parameters = cp.length ? cp.join(this.router.separators.parameters) : null;
        const resolver = this.router.container.getResolver(CustomElementResource.keyFrom(content));
        if (resolver !== null) {
          content = resolver.getFactory(this.router.container).Type as ICustomElementType;
        }
      }
    }

    this.nextContent = content as ICustomElementType;
    this.nextInstruction = instruction;
    this.nextParameters = parameters;

    if (this.content !== content || this.parameters !== parameters || !this.instruction || this.instruction.query !== instruction.query || instruction.isRefresh) {
      return true;
    }

    return false;
  }

  public setElement(element: Element, options: IViewportOptions): void {
    // First added viewport with element is always scope viewport (except for root scope)
    if (this.scope && this.scope.parent && !this.scope.viewport) {
      this.scope.viewport = this;
    }
    if (this.scope && !this.scope.element) {
      this.scope.element = element;
    }
    if (!this.element) {
      this.element = element;
      if (options && options.usedBy) {
        this.options.usedBy = options.usedBy;
      }
      if (options && options.default) {
        this.options.default = options.default;
      }
      if (options && options.noLink) {
        this.options.noLink = options.noLink;
      }
      if (options && options.noHistory) {
        this.options.noHistory = options.noHistory;
      }
      if (this.elementResolve) {
        this.elementResolve();
      }
    }
    if (!this.component && !this.nextComponent && this.options.default) {
      this.router.addProcessingViewport(this, this.options.default);
    }
  }

  public canLeave(): Promise<boolean> {
    if (!this.component) {
      return Promise.resolve(true);
    }

    const component: IRouteableCustomElement = this.component;
    if (!component.canLeave) {
      return Promise.resolve(true);
    }
    // tslint:disable-next-line:no-console
    console.log('viewport canLeave', component.canLeave(this.instruction, this.nextInstruction));

    const result = component.canLeave(this.instruction, this.nextInstruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public canEnter(): Promise<boolean> {
    if (this.clear) {
      return Promise.resolve(true);
    }

    if (!this.nextContent) {
      return Promise.resolve(false);
    }

    this.loadComponent(this.nextContent);
    if (!this.nextComponent) {
      return Promise.resolve(false);
    }

    const component: IRouteableCustomElement = this.nextComponent;
    if (!component.canEnter) {
      return Promise.resolve(true);
    }

    // tslint:disable-next-line:no-console
    console.log('viewport canEnter', component.canEnter(this.nextInstruction, this.instruction));
    const result = component.canEnter(this.nextInstruction, this.instruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public async loadContent(): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Viewport loadContent', this.name);

    if (this.component) {
      if (this.component.leave) {
        await this.component.leave(this.instruction, this.nextInstruction);
      }
      // No need to wait for next component activation
      if (!this.nextComponent) {
        this.removeComponent(this.component);
      }
    }

    if (this.nextComponent) {
      if (this.nextComponent.enter) {
        const merged = mergeParameters(this.nextParameters, this.nextInstruction.query, this.nextContent.parameters);
        this.nextInstruction.parameters = merged.parameters;
        this.nextInstruction.parameterList = merged.list;
        await this.nextComponent.enter(merged.merged, this.nextInstruction, this.instruction);
      }

      if (!this.element) {
        // TODO: Refactor this once multi level recursiveness is fixed
        await this.waitForElement();
        if (!this.element) {
          return Promise.resolve(false);
        }
      }

      // Only when next component activation is done
      if (this.component) {
        this.removeComponent(this.component);
      }
      this.addComponent(this.nextComponent);

      this.content = this.nextContent;
      this.parameters = this.nextParameters;
      this.instruction = this.nextInstruction;
      this.component = this.nextComponent;
    }

    if (this.clear) {
      this.content = this.parameters = this.component = null;
      this.instruction = this.nextInstruction;
    }

    this.nextContent = this.nextParameters = this.nextInstruction = this.nextComponent = null;

    return Promise.resolve(true);
  }

  public description(full: boolean = false): string {
    if (this.content) {
      const component = this.content.description.name;
      const newScope: string = this.scope ? this.router.separators.ownsScope : '';
      const parameters = this.parameters ? this.router.separators.parameters + this.parameters : '';
      if (full || newScope.length || this.options.forceDescription) {
        return `${component}${this.router.separators.viewport}${this.name}${newScope}${parameters}`;
      }
      const viewports = {};
      viewports[component] = component;
      const found = this.owningScope.findViewports(viewports);
      if (!found) {
        return `${component}${this.router.separators.viewport}${this.name}${newScope}${parameters}`;
      }
      return `${component}${parameters}`;
    }
  }

  public scopedDescription(full: boolean = false): string {
    const descriptions = [this.owningScope.context(full), this.description(full)];
    return descriptions.filter((value) => value && value.length).join(this.router.separators.scope);
  }

  // TODO: Deal with non-string components
  public wantComponent(component: ICustomElementType | string): boolean {
    let usedBy = this.options.usedBy || [];
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    return usedBy.indexOf(component as string) >= 0;
  }
  // TODO: Deal with non-string components
  public acceptComponent(component: ICustomElementType | string): boolean {
    if (component === '-' || component === null) {
      return true;
    }
    let usedBy = this.options.usedBy;
    if (!usedBy || !usedBy.length) {
      return true;
    }
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    if (usedBy.indexOf(component as string) >= 0) {
      return true;
    }
    if (usedBy.filter((value) => value.indexOf('*') >= 0).length) {
      return true;
    }
    return false;
  }

  public binding(flags: LifecycleFlags): void {
    if (this.component) {
      this.component.$bind(flags);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    if (this.component) {
      this.component.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    if (this.component) {
      this.component.$detach(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    if (this.component) {
      this.component.$unbind(flags);
    }
  }

  private loadComponent(component: ICustomElementType): void {
    this.nextComponent = this.router.container.get<IRouteableCustomElement>(CustomElementResource.keyFrom(component.description.name));
  }

  private addComponent(component: ICustomElement): void {
    const host: INode = this.element as INode;
    const container = this.router.container;
    const dom = container.get(IDOM);
    const projectorLocator = container.get(IProjectorLocator);
    const renderingEngine = container.get(IRenderingEngine);

    component.$hydrate(dom, projectorLocator, renderingEngine, host, null);
    component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
    component.$attach(LifecycleFlags.fromStartTask);
  }

  private removeComponent(component: ICustomElement): void {
    component.$detach(LifecycleFlags.fromStopTask);
    component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
  }

  private async waitForElement(): Promise<void> {
    if (this.element) {
      return Promise.resolve();
    }
    // tslint:disable-next-line:promise-must-complete
    return new Promise((resolve) => {
      this.elementResolve = resolve;
    });
  }
}
