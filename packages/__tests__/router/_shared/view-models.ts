import { Writable } from '@aurelia/kernel';
import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime';
import { Params, RouteNode, NavigationInstruction, IRouteViewModel } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker';
import { IHookSpec, hookSpecs } from './hook-spec';

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

export class HookSpecs {
  public static get DEFAULT(): HookSpecs {
    return HookSpecs.create({});
  }

  private constructor(
    public readonly beforeBind: IHookSpec<'beforeBind'>,
    public readonly afterBind: IHookSpec<'afterBind'>,
    public readonly afterAttach: IHookSpec<'afterAttach'>,
    public readonly afterAttachChildren: IHookSpec<'afterAttachChildren'>,

    public readonly beforeDetach: IHookSpec<'beforeDetach'>,
    public readonly beforeUnbind: IHookSpec<'beforeUnbind'>,
    public readonly afterUnbind: IHookSpec<'afterUnbind'>,
    public readonly afterUnbindChildren: IHookSpec<'afterUnbindChildren'>,

    public readonly $dispose: IHookSpec<'dispose'>,

    public readonly canEnter: IHookSpec<'canEnter'>,
    public readonly enter: IHookSpec<'enter'>,
    public readonly canLeave: IHookSpec<'canLeave'>,
    public readonly leave: IHookSpec<'leave'>,
  ) {}

  public static create(
    input: Partial<HookSpecs>,
  ): HookSpecs {
    return new HookSpecs(
      // TODO: use '??' instead of '||' but gotta figure out first why ts-node doesn't understand ES2020 syntax
      input.beforeBind || hookSpecs.beforeBind.sync,
      input.afterBind || hookSpecs.afterBind.sync,
      input.afterAttach || hookSpecs.afterAttach.sync,
      input.afterAttachChildren || hookSpecs.afterAttachChildren.sync,

      input.beforeDetach || hookSpecs.beforeDetach.sync,
      input.beforeUnbind || hookSpecs.beforeUnbind.sync,
      input.afterUnbind || hookSpecs.afterUnbind.sync,
      input.afterUnbindChildren || hookSpecs.afterUnbindChildren.sync,

      hookSpecs.dispose,

      input.canEnter || hookSpecs.canEnter.sync,
      input.enter || hookSpecs.enter.sync,
      input.canLeave || hookSpecs.canLeave.sync,
      input.leave || hookSpecs.leave.sync,
    );
  }

  public dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.beforeBind = void 0;
    $this.afterBind = void 0;
    $this.afterAttach = void 0;
    $this.afterAttachChildren = void 0;

    $this.beforeDetach = void 0;
    $this.beforeUnbind = void 0;
    $this.afterUnbind = void 0;
    $this.afterUnbindChildren = void 0;

    $this.$dispose = void 0;

    $this.canEnter = void 0;
    $this.enter = void 0;
    $this.canLeave = void 0;
    $this.leave = void 0;
  }

  public toString(): string {
    const strings: string[] = [];
    for (const k of hookNames) {
      const spec = this[k];
      if (spec !== hookSpecs[k].sync) {
        strings.push(`${spec.name}.${spec.type}`);
      }
    }
    return `Hooks(${strings.join(',')})`;
  }
}

const hookNames = [
  'beforeBind',
  'afterBind',
  'afterAttach',
  'afterAttachChildren',

  'beforeDetach',
  'beforeUnbind',
  'afterUnbind',
  'afterUnbindChildren',

  'canEnter',
  'enter',
  'canLeave',
  'leave',
] as const;

export abstract class TestRouteViewModelBase implements ITestRouteViewModel {
  public readonly $controller!: ICustomElementController<HTMLElement, this>;
  public get name(): string {
    return this.$controller.context.definition.name;
  }

  public constructor(
    public readonly hia: IHookInvocationAggregator,

    public readonly specs: HookSpecs = HookSpecs.DEFAULT,
  ) {}

  public beforeBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.specs.beforeBind.invoke(
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
    return this.specs.afterBind.invoke(
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
    return this.specs.afterAttach.invoke(
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
    return this.specs.afterAttachChildren.invoke(
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
    return this.specs.beforeDetach.invoke(
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
    return this.specs.beforeUnbind.invoke(
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
    return this.specs.afterUnbind.invoke(
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
    return this.specs.afterUnbindChildren.invoke(
      this,
      () => {
        this.hia.afterUnbindChildren.notify(this.name);
        return this.$afterUnbindChildren(initiator, flags);
      },
    );
  }

  public dispose(): void {
    this.specs.$dispose.invoke(
      this,
      () => {
        this.hia.$$dispose.notify(this.name);
        this.$dispose();
      },
    );
  }

  public canEnter(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    return this.specs.canEnter.invoke(
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
    return this.specs.enter.invoke(
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
    return this.specs.canLeave.invoke(
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
    return this.specs.leave.invoke(
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

  protected $dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.hia = void 0;
    $this.specs = void 0;
  }
}
