import { IContainer, Reporter } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigatorInstruction } from './navigator';
import { IRouter } from './router';
import { Scope } from './scope';
import { IViewportOptions } from './viewport';
import { ReentryBehavior, ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';

export interface IViewportOptions {
  scope?: boolean;
  usedBy?: string | string[];
  default?: string;
  noLink?: boolean;
  noHistory?: boolean;
  stateful?: boolean;
  forceDescription?: boolean;
}

export class Viewport {
  public name: string;
  public element: Element;
  public context: IRenderContext | IContainer;
  public owningScope: Scope;
  public scope: Scope;
  public options?: IViewportOptions;

  public content: ViewportContent;
  public nextContent: ViewportContent;

  public enabled: boolean;

  private readonly router: IRouter;

  private clear: boolean;
  private elementResolve?: ((value?: void | PromiseLike<void>) => void) | null;

  private previousViewportState?: Viewport;

  private cache: ViewportContent[];

  constructor(router: IRouter, name: string, element: Element, context: IRenderContext | IContainer, owningScope: Scope, scope: Scope, options?: IViewportOptions) {
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
    this.cache = [];
    this.enabled = true;
  }

  public setNextContent(content: Partial<ICustomElementType> | string, instruction: INavigatorInstruction): boolean {
    let parameters;
    this.clear = false;
    if (typeof content === 'string') {
      if (content === this.router.instructionResolver.clearViewportInstruction) {
        this.clear = true;
        content = null;
      } else {
        const viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
        content = viewportInstruction.componentName;
        parameters = viewportInstruction.parametersString;
      }
    }

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(content, parameters, instruction, this.context);
    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => this.nextContent.isCacheEqual(item));
      if (cached) {
        this.nextContent = cached;
        this.nextContent.fromCache = true;
      } else {
        this.cache.push(this.nextContent);
      }
    }

    // ReentryBehavior 'refresh' takes precedence
    if (!this.content.equalComponent(this.nextContent) ||
      instruction.navigation.refresh ||
      this.content.reentryBehavior() === ReentryBehavior.refresh) {
      return true;
    }

    // Explicitly don't allow navigation back to the same component again
    if (this.content.reentryBehavior() === ReentryBehavior.disallow) {
      return;
    }

    // ReentryBehavior is now 'enter' or 'default'

    if (!this.content.equalParameters(this.nextContent) ||
      this.content.reentryBehavior() === ReentryBehavior.enter) {
      this.content.reentry = true;

      this.nextContent.content = this.content.content;
      this.nextContent.component = this.content.component;
      this.nextContent.contentStatus = this.content.contentStatus;
      this.nextContent.reentry = this.content.reentry;
      return true;
    }

    return false;
  }

  public setElement(element: Element, context: IRenderContext | IContainer, options: IViewportOptions): void {
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
    if (context) {
      context['viewportName'] = this.name;
    }
    if (this.context !== context) {
      this.context = context;
    }

    if (!this.content.component && (!this.nextContent || !this.nextContent.component) && this.options.default) {
      this.router.addProcessingViewport(this.options.default, this, false);
    }
  }

  public remove(element: Element, context: IRenderContext | IContainer): boolean {
    if (this.element === element && this.context === context) {
      if (this.content.component) {
        this.content.freeContent(this.element, (this.nextContent ? this.nextContent.instruction : null), this.options.stateful).catch(error => { throw error; });
      }
      return true;
    }
    return false;
  }

  public async canLeave(): Promise<boolean> {
    return this.content.canLeave(this.nextContent.instruction);
  }

  public async canEnter(): Promise<boolean | ViewportInstruction[]> {
    if (this.clear) {
      return true;
    }

    if (!this.nextContent.content) {
      return false;
    }

    await this.waitForElement();

    this.nextContent.createComponent(this.context);

    return this.nextContent.canEnter(this, this.content.instruction);
  }

  public async enter(): Promise<boolean> {
    Reporter.write(10000, 'Viewport enter', this.name);

    if (this.clear) {
      return true;
    }

    if (!this.nextContent || !this.nextContent.component) {
      return false;
    }

    await this.nextContent.enter(this.content.instruction);
    await this.nextContent.loadComponent(this.context, this.element);
    this.nextContent.initializeComponent();
    return true;
  }

  public async loadContent(): Promise<boolean> {
    Reporter.write(10000, 'Viewport loadContent', this.name);

    // No need to wait for next component activation
    if (this.content.component && !this.nextContent.component) {
      await this.content.leave(this.nextContent.instruction);
      this.content.removeComponent(this.element, this.options.stateful);
      this.content.terminateComponent(this.options.stateful);
      this.content.unloadComponent();
      this.content.destroyComponent();
    }

    if (this.nextContent.component) {
      this.nextContent.addComponent(this.element);

      // Only when next component activation is done
      if (this.content.component) {
        await this.content.leave(this.nextContent.instruction);
        if (!this.content.reentry) {
          this.content.removeComponent(this.element, this.options.stateful);
          this.content.terminateComponent(this.options.stateful);
          this.content.unloadComponent();
          this.content.destroyComponent();
        }
      }

      this.content = this.nextContent;
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(null, null, this.nextContent.instruction);
    }

    this.nextContent = null;

    return true;
  }

  public finalizeContentChange(): void {
    this.previousViewportState = null;
  }
  public async abortContentChange(): Promise<void> {
    await this.nextContent.freeContent(this.element, (this.nextContent ? this.nextContent.instruction : null), this.options.stateful);
    if (this.previousViewportState) {
      Object.assign(this, this.previousViewportState);
    }
  }

  public description(full: boolean = false): string {
    if (this.content.content) {
      const component = this.content.componentName();
      if (full || this.options.forceDescription) {
        return this.router.instructionResolver.stringifyViewportInstruction(
          new ViewportInstruction(component, this, this.content.parameters, this.scope !== null)
        );
      }
      const found = this.owningScope.findViewports([new ViewportInstruction(component)]);
      if (!found || !found.viewportInstructions || !found.viewportInstructions.length) {
        return this.router.instructionResolver.stringifyViewportInstruction(
          new ViewportInstruction(component, this, this.content.parameters, this.scope !== null)
        );
      }
      return this.router.instructionResolver.stringifyViewportInstruction(
        new ViewportInstruction(component, null, this.content.parameters, this.scope !== null)
      );
    }
  }

  public scopedDescription(full: boolean = false): string {
    const descriptions = [this.owningScope.scopeContext(full), this.description(full)];
    return this.router.instructionResolver.stringifyScopedViewportInstruction(descriptions.filter((value) => value && value.length));
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
      this.content.initializeComponent();
    }
  }

  public attaching(flags: LifecycleFlags): void {
    Reporter.write(10000, 'ATTACHING viewport', this.name, this.content, this.nextContent);
    this.enabled = true;
    if (this.content.component) {
      this.content.addComponent(this.element);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    Reporter.write(10000, 'DETACHING viewport', this.name);
    if (this.content.component) {
      this.content.removeComponent(this.element, this.options.stateful);
    }
    this.enabled = false;
  }

  public unbinding(flags: LifecycleFlags): void {
    if (this.content.component) {
      this.content.terminateComponent(this.options.stateful);
    }
  }

  private clearState(): void {
    this.options = {};

    this.content = new ViewportContent();
    this.cache = [];
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
