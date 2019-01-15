import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, ICustomElementType, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { mergeParameters } from './parser';
import { Router } from './router';
import { Scope } from './scope';
import { IRouteableCustomElement, IViewportOptions } from './viewport';

export interface IRouteableCustomElementType extends ICustomElementType {
  parameters?: string[];
}

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean|Promise<boolean>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void|Promise<void>;
  canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean|Promise<boolean>;
  leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void|Promise<void>;
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
  public context: IRenderContext;
  public owningScope: Scope;
  public scope: Scope;
  public options?: IViewportOptions;

  public content: IRouteableCustomElementType;
  public nextContent: IRouteableCustomElementType | string;
  public parameters: string;
  public nextParameters: string;

  public instruction: INavigationInstruction;
  public nextInstruction: INavigationInstruction;

  public component: IRouteableCustomElement;
  public nextComponent: IRouteableCustomElement;

  private readonly router: Router;

  private clear: boolean;
  private elementResolve?: ((value?: void | PromiseLike<void>) => void) | null;

  private previousViewportState?: Viewport;
  private entered: boolean;

  constructor(router: Router, name: string, element: Element, context: IRenderContext, owningScope: Scope, scope: Scope, options?: IViewportOptions) {
    this.router = router;
    this.name = name;
    this.element = element;
    this.context = context;
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
    this.previousViewportState = null;
    this.entered = false;
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
        // If we've got a container, we're good to resolve type
        if (this.context) {
          content = this.componentType(content);
        }
      }
    }

    // Can be a (resolved) type or a string (to be resolved later)
    this.nextContent = content;
    this.nextInstruction = instruction;
    this.nextParameters = parameters;
    this.entered = false;

    if ((typeof content === 'string' && this.componentName(this.content) !== content) ||
      (typeof content !== 'string' && this.content !== content) ||
      this.parameters !== parameters ||
      !this.instruction || this.instruction.query !== instruction.query ||
      instruction.isRefresh) {
      return true;
    }

    return false;
  }

  public setElement(element: Element, context: IRenderContext, options: IViewportOptions): void {
    // First added viewport with element is always scope viewport (except for root scope)
    if (this.scope && this.scope.parent && !this.scope.viewport) {
      this.scope.viewport = this;
    }
    if (this.scope && !this.scope.element) {
      this.scope.element = element;
    }
    if (this.element !== element) {
      // TODO: Restore this state on navigation cancel
      this.previousViewportState = { ...this };
      this.clearState();
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
    if (this.context !== context) {
      this.context = context;
    }

    if (!this.component && !this.nextComponent && this.options.default) {
      this.router.addProcessingViewport(this, this.options.default);
    }
  }

  // TODO: Will probably end up changing stuff due to the remove (hence the name)
  public remove(element: Element, context: IRenderContext): boolean {
    return this.element === element && this.context === context;
  }

  public async canLeave(): Promise<boolean> {
    if (!this.component) {
      return true;
    }

    const component: IRouteableCustomElement = this.component;
    if (!component.canLeave) {
      return true;
    }
    // tslint:disable-next-line:no-console
    console.log('viewport canLeave', component.canLeave(this.instruction, this.nextInstruction));

    const result = component.canLeave(this.instruction, this.nextInstruction);
    if (typeof result === 'boolean') {
      return result;
    }
    return result;
  }

  public async canEnter(): Promise<boolean> {
    if (this.clear) {
      return true;
    }

    if (!this.nextContent) {
      return false;
    }

    await this.loadComponent(this.nextContent);
    if (!this.nextComponent) {
      return false;
    }

    const component: IRouteableCustomElement = this.nextComponent;
    if (!component.canEnter) {
      return true;
    }

    const result = component.canEnter(this.nextInstruction, this.instruction);
    // tslint:disable-next-line:no-console
    console.log('viewport canEnter', result);
    if (typeof result === 'boolean') {
      return result;
    }
    return result;
  }

  public async enter(): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Viewport enter', this.name);

    if (this.clear) {
      return true;
    }

    if (!this.nextComponent) {
      return false;
    }

    if (this.nextComponent.enter) {
      const merged = mergeParameters(this.nextParameters, this.nextInstruction.query, (this.nextContent as IRouteableCustomElementType).parameters);
      this.nextInstruction.parameters = merged.namedParameters;
      this.nextInstruction.parameterList = merged.parameterList;
      await this.nextComponent.enter(merged.merged, this.nextInstruction, this.instruction);
      this.entered = false;
    }
    this.initializeComponent(this.nextComponent);
    return true;
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
        this.terminateComponent(this.component);
        this.unloadComponent();
      }
    }

    if (this.nextComponent) {
      // Only when next component activation is done
      if (this.component) {
        this.removeComponent(this.component);
        this.terminateComponent(this.component);
        this.unloadComponent();
      }
      this.addComponent(this.nextComponent);

      this.content = this.nextContent as IRouteableCustomElementType;
      this.parameters = this.nextParameters;
      this.instruction = this.nextInstruction;
      this.component = this.nextComponent;
    }

    if (this.clear) {
      this.content = this.parameters = this.component = null;
      this.instruction = this.nextInstruction;
    }

    this.nextContent = this.nextParameters = this.nextInstruction = this.nextComponent = null;

    return true;
  }

  public finalizeContentChange(): void {
    this.previousViewportState = null;
  }
  // TODO: Call this on cancel
  public async restorePreviousContent(): Promise<void> {
    if (this.entered) {
      await this.nextComponent.leave();
    }
    if (this.previousViewportState) {
      Object.assign(this, this.previousViewportState);
    }
  }

  public description(full: boolean = false): string {
    if (this.content) {
      const component = this.componentName(this.content);
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
    const descriptions = [this.owningScope.scopeContext(full), this.description(full)];
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

  public componentName(component: IRouteableCustomElementType | string): string {
    if (component === null) {
      return null;
    } else if (typeof component === 'string') {
      return component;
    } else {
      return component.description.name;
    }
  }
  public componentType(component: IRouteableCustomElementType | string): IRouteableCustomElementType {
    if (component === null) {
      return null;
    } else if (typeof component !== 'string') {
      return component;
    } else {
      const container = this.context || this.router.container;
      const resolver = container.get(IContainer).getResolver(CustomElementResource.keyFrom(component));
      if (resolver !== null) {
        return resolver.getFactory(container.get(IContainer)).Type as IRouteableCustomElementType;
      }
      return null;
    }
  }
  public componentInstance(component: IRouteableCustomElementType | string): IRouteableCustomElement {
    if (component === null) {
      return null;
    }
    // TODO: Remove once "local registration is fixed"
    component = this.componentName(component);
    const container = this.context || this.router.container;
    if (typeof component !== 'string') {
      return container.get(IContainer).get<IRouteableCustomElement>(component);
    } else {
      return container.get(IContainer).get<IRouteableCustomElement>(CustomElementResource.keyFrom(component));
    }
  }

  private clearState(): void {
    this.options = {};

    this.content = null;
    this.parameters = null;
    this.instruction = null;
    this.component = null;
  }

  private async loadComponent(component: ICustomElementType | string): Promise<void> {
    await this.waitForElement();

    this.nextComponent = this.componentInstance(component);

    const host: INode = this.element as INode;
    const container = this.context || this.router.container;

    // TODO: get proxyStrategy settings from the template definition
    this.nextComponent.$hydrate(LifecycleFlags.none, container, host);
  }
  private unloadComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
  }

  private initializeComponent(component: ICustomElement): void {
    component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
  }
  private terminateComponent(component: ICustomElement): void {
    component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
  }

  private addComponent(component: ICustomElement): void {
    component.$attach(LifecycleFlags.fromStartTask);
  }

  private removeComponent(component: ICustomElement): void {
    component.$detach(LifecycleFlags.fromStopTask);
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
