import { IContainer, Reporter } from '@aurelia/kernel';
import { Controller, IController, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigatorInstruction, IRouteableComponent, RouteableComponentType, ReentryBehavior } from './interfaces';
import { mergeParameters } from './parser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export const enum ContentStatus {
  none = 0,
  created = 1,
  loaded = 2,
  initialized = 3,
  added = 4,
}

export class ViewportContent {
  public contentStatus: ContentStatus = ContentStatus.none;
  public entered: boolean = false;
  public fromCache: boolean = false;
  public fromHistory: boolean = false;
  public reentry: boolean = false;

  private taggedNodes: Element[] = [];

  public constructor(
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public content: ViewportInstruction = new ViewportInstruction(''),
    public instruction: INavigatorInstruction = {
      instruction: '',
      fullStateInstruction: '',
    },
    context: IRenderContext | IContainer | null = null
  ) {
    // If we've got a container, we're good to resolve type
    if (!this.content.isComponentType() && context !== null) {
      this.content.componentType = this.toComponentType(context);
    }
  }

  public get componentInstance(): IRouteableComponent | null {
    return this.content.componentInstance;
  }

  public equalComponent(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content);
  }

  public equalParameters(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content, true) &&
      // TODO: Review whether query is relevant
      this.instruction.query === other.instruction.query;
  }

  public reentryBehavior(): ReentryBehavior {
    return (this.content.componentInstance !== null &&
      'reentryBehavior' in this.content.componentInstance &&
      this.content.componentInstance.reentryBehavior !== void 0)
      ? this.content.componentInstance.reentryBehavior
      : ReentryBehavior.default;
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content, true);
  }

  public createComponent(context: IRenderContext | IContainer): void {
    if (this.contentStatus !== ContentStatus.none) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache && !this.fromHistory) {
      this.content.componentInstance = this.toComponentInstance(context);
    }
    this.contentStatus = ContentStatus.created;
  }
  public destroyComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatus.created) {
      return;
    }
    // Don't destroy components when stateful
    this.contentStatus = ContentStatus.none;
  }

  public canEnter(viewport: Viewport, previousInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]> {
    if (!this.content.componentInstance) {
      return Promise.resolve(false);
    }

    if (!this.content.componentInstance.canEnter) {
      return Promise.resolve(true);
    }

    const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
    const merged = mergeParameters(this.content.parametersString || '', this.instruction.query, typeParameters);
    this.instruction.parameters = merged.namedParameters;
    this.instruction.parameterList = merged.parameterList;
    const result = this.content.componentInstance.canEnter(merged.merged, this.instruction, previousInstruction);
    Reporter.write(10000, 'viewport canEnter', result);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    if (typeof result === 'string') {
      return Promise.resolve([new ViewportInstruction(result, viewport)]);
    }
    return result as Promise<ViewportInstruction[]>;
  }
  public canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean> {
    if (!this.content.componentInstance || !this.content.componentInstance.canLeave) {
      return Promise.resolve(true);
    }

    const result = this.content.componentInstance.canLeave(nextInstruction, this.instruction);
    Reporter.write(10000, 'viewport canLeave', result);

    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public async enter(previousInstruction: INavigatorInstruction): Promise<void> {
    if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.entered)) {
      return;
    }
    if (this.content.componentInstance && this.content.componentInstance.enter) {
      const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
      const merged = mergeParameters(this.content.parametersString || '', this.instruction.query, typeParameters);
      this.instruction.parameters = merged.namedParameters;
      this.instruction.parameterList = merged.parameterList;
      await this.content.componentInstance.enter(merged.merged, this.instruction, previousInstruction);
    }
    this.entered = true;
  }
  public async leave(nextInstruction: INavigatorInstruction | null): Promise<void> {
    if (this.contentStatus !== ContentStatus.added || !this.entered) {
      return;
    }
    if (this.content.componentInstance && this.content.componentInstance.leave) {
      await this.content.componentInstance.leave(nextInstruction, this.instruction);
    }
    this.entered = false;
  }

  public loadComponent(context: IRenderContext | IContainer, element: Element, viewport: Viewport): Promise<void> {
    if (this.contentStatus !== ContentStatus.created || !this.entered || !this.content.componentInstance) {
      return Promise.resolve();
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache || !this.fromHistory) {
      const host: INode = element as INode;
      const container = context;
      Controller.forCustomElement(this.content.componentInstance, container, host);
    }
    // Temporarily tag content so that it can find parent scope before viewport is attached
    const childNodes = this.content.componentInstance.$controller!.nodes!.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i] as Element;
      if (child.nodeType === 1) {
        Reflect.set(child, '$viewport', viewport);
        this.taggedNodes.push(child);
      }
    }
    this.contentStatus = ContentStatus.loaded;
    return Promise.resolve();
  }
  public unloadComponent(cache: ViewportContent[], stateful: boolean = false): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }

    this.clearTaggedNodes();

    // Don't unload components when stateful
    if (!stateful) {
      this.contentStatus = ContentStatus.created;
    } else {
      cache.push(this);
    }
  }
  public clearTaggedNodes(): void {
    for (const node of this.taggedNodes) {
      Reflect.deleteProperty(node, '$viewport');
    }
    this.taggedNodes = [];
  }

  public initializeComponent(): void {
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }
    // Don't initialize cached content or instantiated history content
    // if (!this.fromCache || !this.fromHistory) {
    ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
    // }
    this.contentStatus = ContentStatus.initialized;
  }
  public async terminateComponent(stateful: boolean = false): Promise<void> {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    // Don't terminate cached content
    // if (!stateful) {
    await ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind).wait();
    // }
    this.contentStatus = ContentStatus.loaded;
  }

  public addComponent(element: Element): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).attach(LifecycleFlags.fromStartTask);
    if (this.fromCache || this.fromHistory) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        const attr = el.getAttribute('au-element-scroll');
        if (attr) {
          const [top, left] = attr.split(',');
          el.removeAttribute('au-element-scroll');
          el.scrollTo(+left, +top);
        }
      }
    }
    this.contentStatus = ContentStatus.added;
  }
  public removeComponent(element: Element | null, stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatus.added || this.entered) {
      return;
    }
    if (stateful && element !== null) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        if (el.scrollTop > 0 || el.scrollLeft) {
          el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
        }
      }
    }
    ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).detach(LifecycleFlags.fromStopTask);
    this.contentStatus = ContentStatus.initialized;
  }

  public async freeContent(element: Element | null, nextInstruction: INavigatorInstruction | null, cache: ViewportContent[], stateful: boolean = false): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatus.added:
        await this.leave(nextInstruction);
        this.removeComponent(element, stateful);
      case ContentStatus.initialized:
        await this.terminateComponent(stateful);
      case ContentStatus.loaded:
        this.unloadComponent(cache, stateful);
      case ContentStatus.created:
        this.destroyComponent();
    }
  }

  public toComponentName(): string | null {
    return this.content.componentName;
  }
  public toComponentType(context: IRenderContext | IContainer): RouteableComponentType | null {
    if (this.content.isEmpty()) {
      return null;
    }
    return this.content.toComponentType(context);
  }
  public toComponentInstance(context: IRenderContext | IContainer): IRouteableComponent | null {
    if (this.content.isEmpty()) {
      return null;
    }
    return this.content.toComponentInstance(context);
  }
}
