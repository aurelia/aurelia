import { IContainer, Reporter } from '@aurelia/kernel';
import { IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, ReentryBehavior } from './interfaces';
import { INavigatorFlags } from './navigator';
import { IRouter } from './router';
import { Scope } from './scope';
import { IViewportOptions } from './viewport';
import { ViewportContent } from './viewport-content';
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
  public content: ViewportContent;
  public nextContent: ViewportContent | null = null;

  public enabled: boolean = true;

  public parent: Viewport | null = null;
  public children: Viewport[] = [];

  private clear: boolean = false;
  private elementResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;

  private previousViewportState: Viewport | null = null;

  private cache: ViewportContent[] = [];

  constructor(
    public readonly router: IRouter,
    public name: string,
    public element: Element | null,
    public context: IRenderContext | IContainer | null,
    public owningScope: Scope,
    public scope: Scope | null,
    public options: IViewportOptions = {}
  ) {
    this.content = new ViewportContent();
  }

  public setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: INavigatorInstruction): boolean {
    let viewportInstruction: ViewportInstruction;
    if (content instanceof ViewportInstruction) {
      viewportInstruction = content;
    } else {
      if (typeof content === 'string') {
        viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
      } else {
        viewportInstruction = new ViewportInstruction(content);
      }
    }
    viewportInstruction.setViewport(this);
    this.clear = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction);

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(!this.clear ? viewportInstruction : void 0, instruction, this.context);

    this.nextContent.fromHistory = this.nextContent.componentInstance && instruction.navigation
      ? !!instruction.navigation.back || !!instruction.navigation.forward
      : false;

    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => (this.nextContent as ViewportContent).isCacheEqual(item));
      if (cached) {
        this.nextContent = cached;
        this.nextContent.fromCache = true;
      } else {
        this.cache.push(this.nextContent);
      }
    }

    // ReentryBehavior 'refresh' takes precedence
    if (!this.content.equalComponent(this.nextContent) ||
      (instruction.navigation as INavigatorFlags).refresh ||
      this.content.reentryBehavior() === ReentryBehavior.refresh) {
      return true;
    }

    // Explicitly don't allow navigation back to the same component again
    if (this.content.reentryBehavior() === ReentryBehavior.disallow) {
      return false;
    }

    // ReentryBehavior is now 'enter' or 'default'

    if (!this.content.equalParameters(this.nextContent) ||
      this.content.reentryBehavior() === ReentryBehavior.enter) {
      this.content.reentry = true;

      this.nextContent.content.setComponent(this.content.componentInstance!);
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
    // TODO: Might not need this? Figure it out
    // if (context) {
    //   context['viewportName'] = this.name;
    // }
    if (this.context !== context) {
      this.context = context;
    }

    if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
      const instructions = this.router.instructionResolver.parseViewportInstructions(this.options.default);
      for (const instruction of instructions) {
        instruction.setViewport(this);
      }
      this.router.goto(instructions, { append: true });
      // this.router.addProcessingViewport(this.options.default, this, false);
    }
  }

  public remove(element: Element | null, context: IRenderContext | IContainer | null): boolean {
    if (this.element === element && this.context === context) {
      if (this.content.componentInstance) {
        this.content.freeContent(this.element as Element, (this.nextContent ? this.nextContent.instruction : null), this.router.options.statefulHistory || this.options.stateful).catch(error => { throw error; });
      }
      return true;
    }
    return false;
  }

  public async canLeave(): Promise<boolean> {
    const results = await Promise.all(this.children.map((child) => child.canLeave()));
    if (results.some(result => result === false)) {
      return false;
    }
    return this.content.canLeave(this.nextContent ? this.nextContent.instruction : null);
  }

  public async canEnter(): Promise<boolean | ViewportInstruction[]> {
    if (this.clear) {
      return true;
    }

    if (!(this.nextContent as ViewportContent).content) {
      return false;
    }

    await this.waitForElement();

    (this.nextContent as ViewportContent).createComponent(this.context as IRenderContext);

    return (this.nextContent as ViewportContent).canEnter(this, this.content.instruction);
  }

  public async enter(): Promise<boolean> {
    Reporter.write(10000, 'Viewport enter', this.name);

    if (this.clear) {
      return true;
    }

    if (!this.nextContent || !this.nextContent.componentInstance) {
      return false;
    }

    await this.nextContent.enter(this.content.instruction);
    await this.nextContent.loadComponent(this.context as IRenderContext, this.element as Element, this);
    this.nextContent.initializeComponent();
    return true;
  }

  public async loadContent(): Promise<boolean> {
    Reporter.write(10000, 'Viewport loadContent', this.name);

    // No need to wait for next component activation
    if (this.content.componentInstance && !(this.nextContent as ViewportContent).componentInstance) {
      await this.content.leave((this.nextContent as ViewportContent).instruction);
      this.unloadContent();
    }

    if ((this.nextContent as ViewportContent).componentInstance) {
      if (this.content.componentInstance !== (this.nextContent as ViewportContent).componentInstance) {
        (this.nextContent as ViewportContent).addComponent(this.element as Element);
      }
      // Only when next component activation is done
      if (this.content.componentInstance) {
        await this.content.leave((this.nextContent as ViewportContent).instruction);
        if (!this.content.reentry && this.content.componentInstance !== (this.nextContent as ViewportContent).componentInstance) {
          this.unloadContent();
        }
      }

      this.content = (this.nextContent as ViewportContent);
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(void 0, (this.nextContent as ViewportContent).instruction);
    }

    this.nextContent = null;

    return true;
  }

  public clearTaggedNodes(): void {
    if (this.content) {
      this.content.clearTaggedNodes();
    }
    if (this.nextContent) {
      this.nextContent.clearTaggedNodes();
    }
  }

  public finalizeContentChange(): void {
    this.previousViewportState = null;
  }
  public async abortContentChange(): Promise<void> {
    await (this.nextContent as ViewportContent).freeContent(this.element as Element, (this.nextContent as ViewportContent).instruction, this.router.options.statefulHistory || this.options.stateful);
    if (this.previousViewportState) {
      Object.assign(this, this.previousViewportState);
    }
  }

  // public description(full: boolean = false): string {
  //   if (this.content.content) {
  //     const component = this.content.toComponentName() as string;
  //     if (full || this.options.forceDescription) {
  //       return this.router.instructionResolver.stringifyViewportInstruction(this.content.content);
  //     }
  //     const found = this.owningScope.findViewports([new ViewportInstruction(component)]);
  //     if (!found || !found.foundViewports || !found.foundViewports.length) {
  //       return this.router.instructionResolver.stringifyViewportInstruction(this.content.content);
  //     }
  //     return this.router.instructionResolver.stringifyViewportInstruction(this.content.content, true);
  //   }
  //   return '';
  // }

  // public scopedDescription(full: boolean = false): string {
  //   const descriptions = [this.owningScope.scopeContext(full), this.description(full)];
  //   return this.router.instructionResolver.stringifyScopedViewportInstructions(descriptions.filter((value) => value && value.length));
  // }

  // TODO: Deal with non-string components
  public wantComponent(component: ComponentAppellation): boolean {
    let usedBy = this.options.usedBy || [];
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    return usedBy.indexOf(component as string) >= 0;
  }
  // TODO: Deal with non-string components
  public acceptComponent(component: ComponentAppellation): boolean {
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
    if (this.content.componentInstance) {
      this.content.initializeComponent();
    }
  }

  public attaching(flags: LifecycleFlags): void {
    Reporter.write(10000, 'ATTACHING viewport', this.name, this.content, this.nextContent);
    this.enabled = true;
    if (this.content.componentInstance) {
      // Only acts if not already entered
      this.content.enter(this.content.instruction);
      this.content.addComponent(this.element as Element);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    Reporter.write(10000, 'DETACHING viewport', this.name);
    if (this.content.componentInstance) {
      // Only acts if not already left
      this.content.leave(this.content.instruction);
      this.content.removeComponent(this.element as Element, this.router.options.statefulHistory || this.options.stateful);
    }
    this.enabled = false;
  }

  public unbinding(flags: LifecycleFlags): void {
    if (this.content.componentInstance) {
      this.content.terminateComponent(this.router.options.statefulHistory || this.options.stateful);
    }
  }

  public addChild(viewport: Viewport): void {
    if (!this.children.some(vp => vp === viewport)) {
      this.children.push(viewport);
      viewport.parent = this;
    }
  }

  public removeChild(viewport: Viewport): void {
    const index = this.children.indexOf(viewport);
    if (index >= 0) {
      this.children.splice(index, 1);
      viewport.parent = null;
    }
  }

  private unloadContent(): void {
    this.content.removeComponent(this.element as Element, this.router.options.statefulHistory || this.options.stateful);
    this.content.terminateComponent(this.router.options.statefulHistory || this.options.stateful);
    this.content.unloadComponent();
    this.content.destroyComponent();
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
    return new Promise((resolve) => {
      this.elementResolve = resolve;
    });
  }
}
