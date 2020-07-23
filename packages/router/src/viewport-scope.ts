import { CustomElementType } from '@aurelia/runtime';
import { ComponentAppellation, IRoute, RouteableComponentType, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner, IScopeOwnerOptions, Scope } from './scope';
import { arrayRemove } from './utils';
import { Navigation } from './navigation';
import { IConnectionCustomElement } from './resources/viewport';
import { NavigationCoordinator } from './navigation-coordinator';
import { Runner } from './runner';

export interface IViewportScopeOptions extends IScopeOwnerOptions {
  catches?: string | string[];
  collection?: boolean;
  source?: unknown[] | null;
}

export class ViewportScope implements IScopeOwner {
  public connectedScope: Scope;

  public path: string | null = null;

  public content: ViewportInstruction | null = null;
  public nextContent: ViewportInstruction | null = null;

  public available: boolean = true;
  public sourceItem: unknown | null = null;
  public sourceItemIndex: number = -1;

  private remove: boolean = false;
  private add: boolean = false;

  public constructor(
    public name: string,
    public readonly router: IRouter,
    public connectionCE: IConnectionCustomElement | null,
    owningScope: Scope | null,
    scope: boolean,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
    public options: IViewportScopeOptions = {
      catches: [],
      source: null,
    },
  ) {
    this.connectedScope = new Scope(router, scope, owningScope, null, this);
    if (this.catches.length > 0) {
      this.content = router.createViewportInstruction(this.catches[0], this.name);
    }
  }

  public get scope(): Scope {
    return this.connectedScope.scope;
  }
  public get owningScope(): Scope {
    return this.connectedScope.owningScope!;
  }

  public get enabled(): boolean {
    return this.connectedScope.enabled;
  }
  public set enabled(enabled: boolean) {
    this.connectedScope.enabled = enabled;
  }

  public get isViewport(): boolean {
    return false;
  }
  public get isViewportScope(): boolean {
    return true;
  }

  public get isEmpty(): boolean {
    return this.content === null;
  }

  public get passThroughScope(): boolean {
    return this.rootComponentType === null && this.catches.length === 0;
  }

  public get siblings(): ViewportScope[] {
    const parent: Scope | null = this.connectedScope.parent;
    if (parent === null) {
      return [this];
    }
    return parent.enabledChildren
      .filter(child => child.isViewportScope && child.viewportScope!.name === this.name)
      .map(child => child.viewportScope!);
  }

  public get source(): unknown[] | null {
    return this.options.source || null;
  }

  public get catches(): string[] {
    let catches: string | string[] = this.options.catches || [];
    if (typeof catches === 'string') {
      catches = catches.split(',');
    }
    return catches;
  }

  public get default(): string | undefined {
    if (this.catches.length > 0) {
      return this.catches[0];
    }
  }

  public setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: Navigation): boolean {
    let viewportInstruction: ViewportInstruction;
    if (content instanceof ViewportInstruction) {
      viewportInstruction = content;
    } else {
      if (typeof content === 'string') {
        viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
      } else {
        viewportInstruction = this.router.createViewportInstruction(content);
      }
    }
    viewportInstruction.viewportScope = this;

    this.remove = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction)
      || this.router.instructionResolver.isClearAllViewportsInstruction(viewportInstruction);
    this.add = this.router.instructionResolver.isAddViewportInstruction(viewportInstruction)
      && Array.isArray(this.source);

    if (this.add) {
      viewportInstruction.componentName = null;
    }

    if (this.default !== void 0 && viewportInstruction.componentName === null) {
      viewportInstruction.componentName = this.default;
    }

    this.nextContent = viewportInstruction;

    return true;
  }

  public swap(coordinator: NavigationCoordinator): void {
    console.log('ViewportScope swap', this, coordinator);

    Runner.run(
      () => coordinator.addEntityState(this, 'couldLeave'),
      () => coordinator.addEntityState(this, 'couldEnter'),
      () => coordinator.addEntityState(this, 'entered'),
      () => coordinator.addEntityState(this, 'left'),
      () => coordinator.addEntityState(this, 'routed'),
      () => coordinator.addEntityState(this, 'swapped'),
      () => {
        this.content = !this.remove ? this.nextContent : null;
        this.nextContent = null;
        coordinator.addEntityState(this, 'completed');
      }
    );
  }

  public canLeave(): boolean | Promise<boolean> {
    return true;
  }
  public canEnter(): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    return true;
  }

  public leave(): void | Promise<void> {
    return;
  }
  public enter(): void | Promise<void> {
    return;
  }

  // public loadContent(): Promise<boolean> {
  //   this.content = !this.remove ? this.nextContent : null;
  //   this.nextContent = null;

  //   return Promise.resolve(true);
  // }

  public finalizeContentChange(): void {
    // console.log('ViewportScope finalizing', this.content);
    if (this.remove && Array.isArray(this.source)) {
      this.removeSourceItem();
    }
  }
  public abortContentChange(): Promise<void> {
    this.nextContent = null;
    if (this.add) {
      const index = this.source!.indexOf(this.sourceItem);
      this.source!.splice(index, 1);
      this.sourceItem = null;
    }
    return Promise.resolve();
  }

  public acceptSegment(segment: string): boolean {
    if (segment === null && segment === void 0 || segment.length === 0) {
      return true;
    }
    if (segment === this.router.instructionResolver.clearViewportInstruction
      || segment === this.router.instructionResolver.addViewportInstruction
      || segment === this.name) {
      return true;
    }

    if (this.catches.length === 0) {
      return true;
    }

    if (this.catches.includes(segment as string)) {
      return true;
    }
    if (this.catches.filter((value) => value.includes('*')).length) {
      return true;
    }
    return false;
  }

  public beforeBind(): void {
    const source: unknown[] = this.source || [];
    if (source.length > 0 && this.sourceItem === null) {
      this.sourceItem = this.getAvailableSourceItem();
    }
  }
  public beforeUnbind(): void {
    if (this.sourceItem !== null && this.source !== null) {
      arrayRemove(this.source!, (item: unknown) => item === this.sourceItem);
    }
    this.sourceItem = null;
  }

  public getAvailableSourceItem(): unknown | null {
    if (this.source === null) {
      return null;
    }
    const siblings = this.siblings;
    for (const item of this.source) {
      if (siblings.every(sibling => sibling.sourceItem !== item)) {
        return item;
      }
    }
    return null;
  }
  public addSourceItem(): unknown {
    const item: unknown = {};
    this.source!.push(item);
    return item;
  }
  public removeSourceItem(): void {
    this.sourceItemIndex = this.source!.indexOf(this.sourceItem);
    if (this.sourceItemIndex >= 0) {
      this.source!.splice(this.sourceItemIndex, 1);
    }
  }

  public getRoutes(): IRoute[] | null {
    if (this.rootComponentType !== null) {
      return (this.rootComponentType as RouteableComponentType & { routes: IRoute[] }).routes;
    }
    return null;
  }
}
