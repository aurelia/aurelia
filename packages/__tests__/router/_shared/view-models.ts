import { Writable } from '@aurelia/kernel';
import { LifecycleFlags, ICustomElementController, IHydratedController, IHydratedParentController } from '@aurelia/runtime-html';
import { Parameters, IRouteableComponent, LoadInstruction, Navigation, Viewport, RoutingInstruction } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { IHookSpec, hookSpecsMap } from './hook-spec.js';

export interface ITestRouteViewModel extends IRouteableComponent {
  readonly $controller: ICustomElementController<this>;
  readonly name: string;
  viewport: Viewport;

  binding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
  bound(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
  attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
  attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;

  detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
  unbinding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;

  canLoad(
    params: Parameters,
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  loading(
    params: Parameters,
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): void | Promise<void>;
  canUnload(
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): boolean | Promise<boolean>;
  unloading(
    instruction: RoutingInstruction,
    navigation: Navigation,
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
    public readonly loading: IHookSpec<'loading'>,
    public readonly canUnload: IHookSpec<'canUnload'>,
    public readonly unloading: IHookSpec<'unloading'>,
  ) { }

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
      input.loading || hookSpecsMap.loading.sync,
      input.canUnload || hookSpecsMap.canUnload.sync,
      input.unloading || hookSpecsMap.unloading.sync,
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
    $this.loading = void 0;
    $this.canUnload = void 0;
    $this.unloading = void 0;
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
  'loading',
  'canUnload',
  'unloading',
] as const;

export abstract class TestRouteViewModelBase implements ITestRouteViewModel {
  public readonly $controller!: ICustomElementController<this>;
  public viewport: Viewport;
  public get name(): string {
    return this.$controller.definition.name;
  }

  public constructor(
    public readonly hia: IHookInvocationAggregator,

    public readonly specs: HookSpecs = HookSpecs.DEFAULT,
  ) { }

  public binding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.binding.notify(`${this.viewport?.name}:${this.name}`);
    // this.hia.binding.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.binding.invoke(
      this,
      () => {
        // this.hia.binding.notify(`${this.viewport?.name}.${this.name}`);
        return this.$binding(initiator, parent, flags);
      },
      this.hia.binding,
    );
  }

  public bound(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.bound.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.bound.invoke(
      this,
      () => {
        // this.hia.bound.notify(`${this.viewport?.name}.${this.name}`);
        return this.$bound(initiator, parent, flags);
      },
      this.hia.bound,
    );
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.attaching.notify(`${this.viewport?.name}:${this.name}`);
    // this.hia.attaching.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.attaching.invoke(
      this,
      () => {
        // this.hia.attaching.notify(`${this.viewport?.name}.${this.name}`);
        return this.$attaching(initiator, parent, flags);
      },
      this.hia.attaching,
    );
  }

  public attached(
    initiator: IHydratedController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.attached.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.attached.invoke(
      this,
      () => {
        // this.hia.attached.notify(`${this.viewport?.name}.${this.name}`);
        return this.$attached(initiator, flags);
      },
      this.hia.attached,
    );
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // this.hia.detaching.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.detaching.invoke(
      this,
      () => {
        // this.hia.detaching.notify(`${this.viewport?.name}.${this.name}`);
        return this.$detaching(initiator, parent, flags);
      },
      this.hia.detaching,
    );
  }

  public unbinding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    // console.log(`unbinding ${this.name} ${this.$controller.host.outerHTML}`);
    // this.hia.unbinding.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.unbinding.invoke(
      this,
      () => {
        // this.hia.unbinding.notify(`${this.viewport?.name}.${this.name}`);
        return this.$unbinding(initiator, parent, flags);
      },
      this.hia.unbinding,
    );
  }

  public dispose(): void {
    // this.hia.$$dispose.notify(`${this.viewport?.name}.${this.name}`);
    this.specs.$dispose.invoke(
      this,
      () => {
        // this.hia.$$dispose.notify(`${this.viewport?.name}.${this.name}`);
        this.$dispose();
      },
      this.hia.$$dispose,
    );
  }

  public canLoad(
    params: Parameters,
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    this.viewport = instruction.viewport.instance as Viewport;
    // console.log('TestViewModel canLoad', this.name);
    // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.canLoad.invoke(
      this,
      () => {
        // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'enter');
        // return onResolve(this.$canLoad(params, next, current), () => {
        // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
        // }) as any;
        return this.$canLoad(params, instruction, navigation);
        // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`);
        // const result = this.$canLoad(params, next, current);
        // if (result instanceof Promise) {
        //   return result.then(() => {
        //     this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
        //   });
        // }
        // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
        // return result;
      },
      this.hia.canLoad,
    );
  }

  public loading(
    params: Parameters,
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): void | Promise<void> {
    this.viewport = instruction.viewport.instance as Viewport;
    // console.log('TestViewModel loading', this.name);
    // this.hia.loading.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.loading.invoke(
      this,
      () => {
        // this.hia.loading.notify(`${this.viewport?.name}.${this.name}`);
        return this.$loading(params, instruction, navigation);
      },
      this.hia.loading,
    );
  }

  public canUnload(
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): boolean | Promise<boolean> {
    this.viewport = instruction.viewport.instance as Viewport;
    // console.log('TestViewModel canUnload', this);
    // this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.canUnload.invoke(
      this,
      () => {
        return this.$canUnload(instruction, navigation);
        // this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`, 'enter');
        // return onResolve(this.$canUnload(instruction, navigation), () => {
        //   this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`, 'leave');
        // }) as any;
      },
      this.hia.canUnload,
    );
  }

  public unloading(
    instruction: RoutingInstruction,
    navigation: Navigation,
  ): void | Promise<void> {
    this.viewport = instruction.viewport.instance as Viewport;
    // console.log('TestViewModel unloading', this.name);
    // this.hia.unloading.notify(`${this.viewport?.name}.${this.name}`);
    return this.specs.unloading.invoke(
      this,
      () => {
        // this.hia.unloading.notify(`${this.viewport?.name}.${this.name}`);
        return this.$unloading(instruction, navigation);
      },
      this.hia.unloading,
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
    _params: Parameters,
    _instruction: RoutingInstruction,
    _navigation: Navigation,
  ): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    return true;
  }

  protected $loading(
    _params: Parameters,
    _instruction: RoutingInstruction,
    _navigation: Navigation,
  ): void | Promise<void> {
    // do nothing
  }

  protected $canUnload(
    _instruction: RoutingInstruction,
    _navigation: Navigation,
  ): boolean | Promise<boolean> {
    return true;
  }

  protected $unloading(
    _instruction: RoutingInstruction,
    _navigation: Navigation,
  ): void | Promise<void> {
    // do nothing
  }

  protected $dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.hia = void 0;
    $this.specs = void 0;
  }
}
