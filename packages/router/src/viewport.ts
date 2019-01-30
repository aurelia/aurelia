import { ICustomElement, ICustomElementType, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { mergeParameters } from './parser';
import { IComponentViewportParameters, Router } from './router';
import { Scope } from './scope';
import { IRouteableCustomElement, IViewportOptions } from './viewport';
import { ViewportContent } from './viewport-content';

export interface IRouteableCustomElementType extends ICustomElementType {
  parameters?: string[];
}

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | IComponentViewportParameters[] | Promise<boolean | string | IComponentViewportParameters[]>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
  canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
  leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}

export interface IViewportOptions {
  scope?: boolean;
  usedBy?: string | string[];
  default?: string;
  noLink?: boolean;
  noHistory?: boolean;
  stateful?: boolean;
  forceDescription?: boolean;
}

const enum NavigationStatuses {
  none = 0,
  loaded = 1,
  initialized = 2,
  entered = 3,
  added = 4,
}

export class Viewport {
  public name: string;
  public element: Element;
  public context: IRenderContext;
  public owningScope: Scope;
  public scope: Scope;
  public options?: IViewportOptions;

  public content: ViewportContent;
  public nextContent: ViewportContent;

  private readonly router: Router;

  private clear: boolean;
  private elementResolve?: ((value?: void | PromiseLike<void>) => void) | null;

  private previousViewportState?: Viewport;
  private navigationStatus: NavigationStatuses;

  private cache: ViewportContent[];
  private fromCache: boolean;

  constructor(router: Router, name: string, element: Element, context: IRenderContext, owningScope: Scope, scope: Scope, options?: IViewportOptions) {
    this.router = router;
    this.name = name;
    this.element = element;
    this.context = context;
    this.owningScope = owningScope;
    this.scope = scope;
    this.options = options;

    this.clear = false;

    this.content = new ViewportContent();
    this.nextContent = null;
    this.elementResolve = null;
    this.previousViewportState = null;
    this.navigationStatus = NavigationStatuses.none;
    this.cache = [];
    this.fromCache = false;
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
      }
    }

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(content, parameters, instruction, this.context);
    this.fromCache = false;
    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => this.nextContent.isCacheEqual(item));
      if (cached) {
        this.nextContent = cached;
        this.fromCache = true;
      } else {
        this.cache.push(this.nextContent);
      }
    }
    this.navigationStatus = NavigationStatuses.none;

    return this.content.isChange(this.nextContent) || instruction.isRefresh;
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
      if (options && options.stateful) {
        this.options.stateful = options.stateful;
      }
      if (this.elementResolve) {
        this.elementResolve();
      }
    }
    if (this.context !== context) {
      this.context = context;
    }

    if (!this.content.component && (!this.nextContent || !this.nextContent.component) && this.options.default) {
      this.router.addProcessingViewport(this.options.default, this);
    }
  }

  // TODO: Will probably end up changing stuff due to the remove (hence the name)
  public remove(element: Element, context: IRenderContext): boolean {
    return this.element === element && this.context === context;
  }

  public async canLeave(): Promise<boolean> {
    if (!this.content.component) {
      return true;
    }

    const component: IRouteableCustomElement = this.content.component;
    if (!component.canLeave) {
      return true;
    }
    // tslint:disable-next-line:no-console
    console.log('viewport canLeave', component.canLeave(this.content.instruction, this.nextContent.instruction));

    return component.canLeave(this.content.instruction, this.nextContent.instruction);
  }

  public async canEnter(): Promise<boolean | IComponentViewportParameters[]> {
    if (this.clear) {
      return true;
    }

    if (!this.nextContent.content) {
      return false;
    }

    if (this.fromCache) {
      return true;
    }

    await this.loadComponent(this.nextContent.content);
    if (!this.nextContent.component) {
      return false;
    }

    const component: IRouteableCustomElement = this.nextContent.component;
    if (!component.canEnter) {
      return true;
    }

    const result = component.canEnter(this.nextContent.instruction, this.content.instruction);
    // tslint:disable-next-line:no-console
    console.log('viewport canEnter', result);
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'string') {
      return [{ component: result, viewport: this }];
    }
    return result as Promise<IComponentViewportParameters[]>;
  }

  public async enter(): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Viewport enter', this.name);

    if (this.clear) {
      return true;
    }

    if (!this.nextContent.component) {
      return false;
    }

    if (this.fromCache) {
      return true;
    }

    if (this.nextContent.component.enter) {
      const merged = mergeParameters(this.nextContent.parameters, this.nextContent.instruction.query, (this.nextContent.content as IRouteableCustomElementType).parameters);
      this.nextContent.instruction.parameters = merged.namedParameters;
      this.nextContent.instruction.parameterList = merged.parameterList;
      await this.nextContent.component.enter(merged.merged, this.nextContent.instruction, this.content.instruction);
      this.navigationStatus = NavigationStatuses.entered;
    }
    this.initializeComponent(this.nextContent.component);
    return true;
  }

  public async loadContent(): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Viewport loadContent', this.name);

    if (this.content.component) {
      if (this.content.component.leave) {
        await this.content.component.leave(this.content.instruction, this.nextContent.instruction);
      }
      // No need to wait for next component activation
      if (!this.nextContent.component) {
        this.removeComponent(this.content.component);
        this.terminateComponent(this.content.component);
        this.unloadComponent();
      }
    }

    if (this.nextContent.component) {
      // Only when next component activation is done
      if (this.content.component) {
        this.removeComponent(this.content.component);
        this.terminateComponent(this.content.component);
        this.unloadComponent();
      }
      this.addComponent(this.nextContent.component);

      this.content = this.nextContent;
    }

    if (this.clear) {
      this.content = new ViewportContent(null, null, this.nextContent.instruction);
    }

    this.nextContent = null;

    return true;
  }

  public finalizeContentChange(): void {
    this.previousViewportState = null;
    this.navigationStatus = NavigationStatuses.none;
  }
  public async abortContentChange(): Promise<void> {
    switch (this.navigationStatus) {
      case NavigationStatuses.added:
        this.removeComponent(this.nextContent.component);
      case NavigationStatuses.entered:
        await this.nextContent.component.leave();
      case NavigationStatuses.initialized:
        this.terminateComponent(this.nextContent.component);
      case NavigationStatuses.loaded:
        this.unloadComponent();
    }
    if (this.previousViewportState) {
      Object.assign(this, this.previousViewportState);
    }
    this.navigationStatus = NavigationStatuses.none;
  }

  public description(full: boolean = false): string {
    if (this.content.content) {
      const component = this.content.componentName();
      const newScope: string = this.scope ? this.router.separators.ownsScope : '';
      const parameters = this.content.parameters ? this.router.separators.parameters + this.content.parameters : '';
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
    if (this.content.component) {
      this.content.component.$bind(flags);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    if (this.content.component) {
      this.content.component.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    if (this.content.component) {
      this.content.component.$detach(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    if (this.content.component) {
      this.content.component.$unbind(flags);
    }
  }

  private clearState(): void {
    this.options = {};

    this.content = new ViewportContent();
  }

  private async loadComponent(component: ICustomElementType | string): Promise<void> {
    // Don't load cached content
    if (!this.fromCache) {
      await this.waitForElement();

      this.nextContent.component = this.nextContent.componentInstance(this.context);

      const host: INode = this.element as INode;
      const container = this.context || this.router.container;

      // TODO: get useProxies settings from the template definition
      this.nextContent.component.$hydrate(LifecycleFlags.none, container, host);
    }
    this.navigationStatus = NavigationStatuses.loaded;
  }
  private unloadComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
    // Don't unload components when stateful
  }

  private initializeComponent(component: ICustomElement): void {
    // Don't initialize cached content
    if (!this.fromCache) {
      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
    }
    this.navigationStatus = NavigationStatuses.initialized;
  }
  private terminateComponent(component: ICustomElement): void {
    // Don't terminate cached content
    if (!this.options.stateful) {
      component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }
  }

  private addComponent(component: ICustomElement): void {
    component.$attach(LifecycleFlags.fromStartTask);
    if (this.fromCache) {
      const elements = Array.from(this.element.getElementsByTagName('*'));
      for (let element of elements) {
        if (element.hasAttribute('au-element-scroll')) {
          const [top, left] = element.getAttribute('au-element-scroll').split(',');
          element.removeAttribute('au-element-scroll');
          element.scrollTo(+left, +top);
        }
      }
    }
    this.navigationStatus = NavigationStatuses.added;
  }
  private removeComponent(component: ICustomElement): void {
    if (this.options.stateful) {
      const elements = Array.from(this.element.getElementsByTagName('*'));
      for (const element of elements) {
        if (element.scrollTop > 0 || element.scrollLeft) {
          element.setAttribute('au-element-scroll', `${element.scrollTop},${element.scrollLeft}`);
        }
      }
    }
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
