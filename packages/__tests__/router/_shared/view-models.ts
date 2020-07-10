import { Writable } from '@aurelia/kernel';
import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime';
import { Params, NavigationInstruction, IRouteableComponent, ViewportInstruction } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker';
import { IHookSpec, hookSpecsMap } from './hook-spec';

export interface ITestRouteViewModel extends IRouteableComponent<HTMLElement> {
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

  canLoad(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
  enter(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): void | Promise<void>;
  canLeave(
    next: Navigation | null,
    current: Navigation,
  ): boolean | Promise<boolean>;
  leave(
    next: Navigation | null,
    current: Navigation,
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

    public readonly canLoad: IHookSpec<'canLoad'>,
    public readonly load: IHookSpec<'load'>,
    public readonly canUnload: IHookSpec<'canUnload'>,
    public readonly unload: IHookSpec<'unload'>,
  ) {}

  public static create(
    input: Partial<HookSpecs>,
  ): HookSpecs {
    return new HookSpecs(
      // TODO: use '??' instead of '||' but gotta figure out first why ts-node doesn't understand ES2020 syntax
      input.beforeBind || hookSpecsMap.beforeBind.sync,
      input.afterBind || hookSpecsMap.afterBind.sync,
      input.afterAttach || hookSpecsMap.afterAttach.sync,
      input.afterAttachChildren || hookSpecsMap.afterAttachChildren.sync,

      input.beforeDetach || hookSpecsMap.beforeDetach.sync,
      input.beforeUnbind || hookSpecsMap.beforeUnbind.sync,
      input.afterUnbind || hookSpecsMap.afterUnbind.sync,
      input.afterUnbindChildren || hookSpecsMap.afterUnbindChildren.sync,

      hookSpecsMap.dispose,

      input.canLoad || hookSpecsMap.canLoad.sync,
      input.load || hookSpecsMap.load.sync,
      input.canUnload || hookSpecsMap.canUnload.sync,
      input.unload || hookSpecsMap.unload.sync,
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

    $this.canLoad = void 0;
    $this.load = void 0;
    $this.canUnload = void 0;
    $this.unload = void 0;
  }

  public toString(exclude?: string): string {
    const strings: string[] = [];
    for (const k of hookNames) {
      const spec = this[k];
      if (spec.type !== exclude) {
        strings.push(`${spec.name}.${spec.type}`);
      }
    }
    return strings.length > 0 ? `Hooks(${strings.join(',')})` : '';
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

  'canLoad',
  'load',
  'canUnload',
  'unload',
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

  public canLoad(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]> {
    return this.specs.canEnter.invoke(
      this,
      () => {
        this.hia.canLoad.notify(this.name);
        return this.$canLoad(params, next, current);
      },
    );
  }

  public load(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): void | Promise<void> {
    return this.specs.load.invoke(
      this,
      () => {
        this.hia.load.notify(this.name);
        return this.$load(params, next, current);
      },
    );
  }

  public canLeave(
    next: Navigation | null,
    current: Navigation,
  ): boolean | Promise<boolean> {
    return this.specs.canUnload.invoke(
      this,
      () => {
        this.hia.canUnload.notify(this.name);
        return this.$canUnload(next, current);
      },
    );
  }

  public leave(
    next: Navigation | null,
    current: Navigation,
  ): void | Promise<void> {
    return this.specs.unload.invoke(
      this,
      () => {
        this.hia.unload.notify(this.name);
        return this.$unload(next, current);
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

  protected $canLoad(
    _params: Params,
    _next: Navigation,
    _current: Navigation | null,
  ): string | boolean | ViewportInstruction[] | Promise<string | boolean | ViewportInstruction[]> {
    return true;
  }

  protected $load(
    _params: Params,
    _next: Navigation,
    _current: Navigation | null,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canLeave(
    _next: Navigation | null,
    _current: Navigation,
  ): boolean | Promise<boolean> {
    return true;
  }

  protected $leave(
    _next: Navigation | null,
    _current: Navigation,
  ): void | Promise<void> {
    // do nothing
  }

  protected $dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.hia = void 0;
    $this.specs = void 0;
  }
}
