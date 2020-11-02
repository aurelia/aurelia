import { Writable } from '@aurelia/kernel';
import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime-html';
import { Params, IRouteableComponent, NavigationInstruction, Navigation, Viewport } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker';
import { IHookSpec, hookSpecsMap } from './hook-spec';

export interface ITestRouteViewModel extends IRouteableComponent {
  readonly $controller: ICustomElementController<this>;
  readonly name: string;

  binding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  bound(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  attached(
    initiator: IHydratedController,
    flags: LifecycleFlags,
  ): void | Promise<void>;

  detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void>;
  unbinding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void>;

  canLoad(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  load(
    params: Params,
    viewport: Viewport,
    next: Navigation,
    current: Navigation | null,
  ): void | Promise<void>;
  canUnload(
    next: Navigation | null,
    current: Navigation,
  ): boolean | Promise<boolean>;
  unload(
    next: Navigation | null,
    current: Navigation,
  ): void | Promise<void>;
}

export class HookSpecs {
  public static get DEFAULT(): HookSpecs {
    return HookSpecs.create({});
  }

  private constructor(
    public readonly binding: IHookSpec<'binding'>,
    public readonly bound: IHookSpec<'bound'>,
    public readonly attaching: IHookSpec<'attaching'>,
    public readonly attached: IHookSpec<'attached'>,

    public readonly detaching: IHookSpec<'detaching'>,
    public readonly unbinding: IHookSpec<'unbinding'>,

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
      input.binding || hookSpecsMap.binding.sync,
      input.bound || hookSpecsMap.bound.sync,
      input.attaching || hookSpecsMap.attaching.sync,
      input.attached || hookSpecsMap.attached.sync,

      input.detaching || hookSpecsMap.detaching.sync,
      input.unbinding || hookSpecsMap.unbinding.sync,

      hookSpecsMap.dispose,

      input.canLoad || hookSpecsMap.canLoad.sync,
      input.load || hookSpecsMap.load.sync,
      input.canUnload || hookSpecsMap.canUnload.sync,
      input.unload || hookSpecsMap.unload.sync,
    );
  }

  public dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.binding = void 0;
    $this.bound = void 0;
    $this.attaching = void 0;
    $this.attached = void 0;

    $this.detaching = void 0;
    $this.unbinding = void 0;

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
  'binding',
  'bound',
  'attaching',
  'attached',

  'detaching',
  'unbinding',

  'canLoad',
  'load',
  'canUnload',
  'unload',
] as const;

export abstract class TestRouteViewModelBase implements ITestRouteViewModel {
  public readonly $controller!: ICustomElementController<this>;
  public viewport: Viewport;
  public get name(): string {
    return this.$controller.context.definition.name;
  }

  public constructor(
    public readonly hia: IHookInvocationAggregator,

    public readonly specs: HookSpecs = HookSpecs.DEFAULT,
  ) {}

  public binding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.binding.notify(`${this.viewport?.name}:${this.name}`);
    this.hia.binding.notify(this.name);
    return this.specs.binding.invoke(
      this,
      () => {
        // this.hia.binding.notify(this.name);
        return this.$binding(initiator, parent, flags);
      },
    );
  }

  public bound(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hia.bound.notify(this.name);
    return this.specs.bound.invoke(
      this,
      () => {
        // this.hia.bound.notify(this.name);
        return this.$bound(initiator, parent, flags);
      },
    );
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.attaching.notify(`${this.viewport?.name}:${this.name}`);
    this.hia.attaching.notify(this.name);
    return this.specs.attaching.invoke(
      this,
      () => {
        // this.hia.attaching.notify(this.name);
        return this.$attaching(initiator, parent, flags);
      },
    );
  }

  public attached(
    initiator: IHydratedController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hia.attached.notify(this.name);
    return this.specs.attached.invoke(
      this,
      () => {
        // this.hia.attached.notify(this.name);
        return this.$attached(initiator, flags);
      },
    );
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hia.detaching.notify(this.name);
    return this.specs.detaching.invoke(
      this,
      () => {
        // this.hia.detaching.notify(this.name);
        return this.$detaching(initiator, parent, flags);
      },
    );
  }

  public unbinding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // console.log(`unbinding ${this.name} ${this.$controller.host.outerHTML}`);
    this.hia.unbinding.notify(this.name);
    return this.specs.unbinding.invoke(
      this,
      () => {
        // this.hia.unbinding.notify(this.name);
        return this.$unbinding(initiator, parent, flags);
      },
    );
  }

  public dispose(): void {
    this.hia.$$dispose.notify(this.name);
    this.specs.$dispose.invoke(
      this,
      () => {
        // this.hia.$$dispose.notify(this.name);
        this.$dispose();
      },
    );
  }

  public canLoad(
    params: Params,
    next: Navigation,
    current: Navigation | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    // console.log('TestViewModel canLoad', this.name);
    this.hia.canLoad.notify(this.name);
    return this.specs.canLoad.invoke(
      this,
      () => {
        // this.hia.canLoad.notify(this.name);
        return this.$canLoad(params, next, current);
      },
    );
  }

  public load(
    params: Params,
    viewport: Viewport,
    next: Navigation,
    current: Navigation | null,
  ): void | Promise<void> {
    this.viewport = viewport;
    // console.log('TestViewModel load', this.name);
    this.hia.load.notify(this.name);
    return this.specs.load.invoke(
      this,
      () => {
        // this.hia.load.notify(this.name);
        return this.$load(params, next, current);
      },
    );
  }

  public canUnload(
    next: Navigation | null,
    current: Navigation,
  ): boolean | Promise<boolean> {
    // console.log('TestViewModel canUnload', this);
    this.hia.canUnload.notify(this.name);
    return this.specs.canUnload.invoke(
      this,
      () => {
        // this.hia.canUnload.notify(this.name);
        return this.$canUnload(next, current);
      },
    );
  }

  public unload(
    next: Navigation | null,
    current: Navigation,
  ): void | Promise<void> {
    // console.log('TestViewModel unload', this.name);
    this.hia.unload.notify(this.name);
    return this.specs.unload.invoke(
      this,
      () => {
        // this.hia.unload.notify(this.name);
        return this.$unload(next, current);
      },
    );
  }

  protected $binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $bound(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $attaching(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $attached(
    _initiator: IHydratedController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $detaching(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $unbinding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canLoad(
    _params: Params,
    _next: Navigation,
    _current: Navigation | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    return true;
  }

  protected $load(
    _params: Params,
    _next: Navigation,
    _current: Navigation | null,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canUnload(
    _next: Navigation | null,
    _current: Navigation,
  ): boolean | Promise<boolean> {
    return true;
  }

  protected $unload(
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
