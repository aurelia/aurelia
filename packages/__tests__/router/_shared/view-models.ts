import { Writable } from '@aurelia/kernel';
import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime';
import { Params, RouteNode, NavigationInstruction, IRouteViewModel } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker';
import { IHookSpec } from './hook-spec';

export interface ITestRouteViewModel extends IRouteViewModel {
  readonly $controller: ICustomElementController<HTMLElement, this>;
  readonly name: string;

  beforeBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  afterBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  afterAttach(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  afterAttachChildren(
    initiator: IHydratedController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;

  beforeDetach(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  beforeUnbind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  afterUnbind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  afterUnbindChildren(
    initiator: IHydratedController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void>;

  canEnter(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  enter(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): void | Promise<void>;
  canLeave(
    next: RouteNode | null,
    current: RouteNode,
  ): boolean | Promise<boolean>;
  leave(
    next: RouteNode | null,
    current: RouteNode,
  ): void | Promise<void>;
}

export abstract class TestRouteViewModelBase implements ITestRouteViewModel {
  public readonly $controller!: ICustomElementController<HTMLElement, this>;
  public get name(): string {
    return this.$controller.context.definition.name;
  }

  public constructor(
    public readonly hia: IHookInvocationAggregator,

    public readonly beforeBindSpec: IHookSpec<'beforeBind'>,
    public readonly afterBindSpec: IHookSpec<'afterBind'>,
    public readonly afterAttachSpec: IHookSpec<'afterAttach'>,
    public readonly afterAttachChildrenSpec: IHookSpec<'afterAttachChildren'>,

    public readonly beforeDetachSpec: IHookSpec<'beforeDetach'>,
    public readonly beforeUnbindSpec: IHookSpec<'beforeUnbind'>,
    public readonly afterUnbindSpec: IHookSpec<'afterUnbind'>,
    public readonly afterUnbindChildrenSpec: IHookSpec<'afterUnbindChildren'>,

    public readonly canEnterSpec: IHookSpec<'canEnter'>,
    public readonly enterSpec: IHookSpec<'enter'>,
    public readonly canLeaveSpec: IHookSpec<'canLeave'>,
    public readonly leaveSpec: IHookSpec<'leave'>,
  ) {}

  public beforeBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.beforeBindSpec.invoke(
      this,
      () => {
        this.hia.beforeBind.notify(this.name);
        return this.$beforeBind(initiator, parent, flags);
      },
    );
  }

  public afterBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.afterBindSpec.invoke(
      this,
      () => {
        this.hia.afterBind.notify(this.name);
        return this.$afterBind(initiator, parent, flags);
      },
    );
  }

  public afterAttach(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.afterAttachSpec.invoke(
      this,
      () => {
        this.hia.afterAttach.notify(this.name);
        return this.$afterAttach(initiator, parent, flags);
      },
    );
  }

  public afterAttachChildren(
    initiator: IHydratedController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.afterAttachChildrenSpec.invoke(
      this,
      () => {
        this.hia.afterAttachChildren.notify(this.name);
        return this.$afterAttachChildren(initiator, flags);
      },
    );
  }

  public beforeDetach(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.beforeDetachSpec.invoke(
      this,
      () => {
        this.hia.beforeDetach.notify(this.name);
        return this.$beforeDetach(initiator, parent, flags);
      },
    );
  }

  public beforeUnbind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.beforeUnbindSpec.invoke(
      this,
      () => {
        this.hia.beforeUnbind.notify(this.name);
        return this.$beforeUnbind(initiator, parent, flags);
      },
    );
  }

  public afterUnbind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.afterUnbindSpec.invoke(
      this,
      () => {
        this.hia.afterUnbind.notify(this.name);
        return this.$afterUnbind(initiator, parent, flags);
      },
    );
  }

  public afterUnbindChildren(
    initiator: IHydratedController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.afterUnbindChildrenSpec.invoke(
      this,
      () => {
        this.hia.afterUnbindChildren.notify(this.name);
        return this.$afterUnbindChildren(initiator, flags);
      },
    );
  }

  public canEnter(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    return this.canEnterSpec.invoke(
      this,
      () => {
        this.hia.canEnter.notify(this.name);
        return this.$canEnter(params, next, current);
      },
    );
  }

  public enter(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): void | Promise<void> {
    return this.enterSpec.invoke(
      this,
      () => {
        this.hia.enter.notify(this.name);
        return this.$enter(params, next, current);
      },
    );
  }

  public canLeave(
    next: RouteNode | null,
    current: RouteNode,
  ): boolean | Promise<boolean> {
    return this.canLeaveSpec.invoke(
      this,
      () => {
        this.hia.canLeave.notify(this.name);
        return this.$canLeave(next, current);
      },
    );
  }

  public leave(
    next: RouteNode | null,
    current: RouteNode,
  ): void | Promise<void> {
    return this.leaveSpec.invoke(
      this,
      () => {
        this.hia.leave.notify(this.name);
        return this.$leave(next, current);
      },
    );
  }

  protected $beforeBind(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $afterBind(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $afterAttach(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $afterAttachChildren(
    _initiator: IHydratedController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $beforeDetach(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $beforeUnbind(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $afterUnbind(
    _initiator: IHydratedController<HTMLElement>,
    _parent: IHydratedParentController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $afterUnbindChildren(
    _initiator: IHydratedController<HTMLElement>,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canEnter(
    _params: Params,
    _next: RouteNode,
    _current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    return true;
  }

  protected $enter(
    _params: Params,
    _next: RouteNode,
    _current: RouteNode | null,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canLeave(
    _next: RouteNode | null,
    _current: RouteNode,
  ): boolean | Promise<boolean> {
    return true;
  }

  protected $leave(
    _next: RouteNode | null,
    _current: RouteNode,
  ): void | Promise<void> {
    // do nothing
  }

  public dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.hia = void 0;

    $this.beforeBindSpec = void 0;
    $this.afterBindSpec = void 0;
    $this.afterAttachSpec = void 0;
    $this.afterAttachChildrenSpec = void 0;

    $this.beforeDetachSpec = void 0;
    $this.beforeUnbindSpec = void 0;
    $this.afterUnbindSpec = void 0;
    $this.afterUnbindChildrenSpec = void 0;

    $this.canEnterSpec = void 0;
    $this.enterSpec = void 0;
    $this.canLeaveSpec = void 0;
    $this.leaveSpec = void 0;
  }
}
