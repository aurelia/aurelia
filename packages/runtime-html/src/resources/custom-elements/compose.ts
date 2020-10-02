import {
  Constructable,
  nextId,
  PLATFORM,
  onResolve,
} from '@aurelia/kernel';
import {
  BindingMode,
  IDOM,
  IHydrateElementInstruction,
  INode,
  ITargetedInstruction,
  IViewFactory,
  LifecycleFlags,
  TargetedInstruction,
  CustomElementDefinition,
  bindable,
  customElement,
  MountStrategy,
  getRenderContext,
  ICustomElementController,
  ISyntheticView,
  ICustomElementViewModel,
  IHydratedController,
  IHydratedParentController,
  ControllerVisitor,
} from '@aurelia/runtime';
import {
  createElement,
  RenderPlan,
} from '../../create-element';

export type Component<T extends INode = Node> = IViewFactory<T> | ISyntheticView<T> | RenderPlan<T> | Constructable | CustomElementDefinition;
export type MaybeComponentPromise<T> = Component<T> | Promise<Component<T>> | undefined;

function toLookup(
  acc: Record<string, TargetedInstruction>,
  item: ITargetedInstruction & { to?: string },
): Record<string, TargetedInstruction> {
  const to = item.to;
  if (to !== void 0 && to !== 'component' && to !== 'composing') {
    acc[to] = item as TargetedInstruction;
  }

  return acc;
}

@customElement({ name: 'au-compose', template: null, containerless: true })
export class Compose<T extends INode = Node> implements ICustomElementViewModel<T> {
  public readonly id: number = nextId('au$component');

  @bindable public component?: MaybeComponentPromise<T> = void 0;
  @bindable({ mode: BindingMode.fromView }) public composing: boolean = false;

  public view?: ISyntheticView<T> = void 0;

  private readonly properties: Record<string, TargetedInstruction>;

  private lastComponent?: MaybeComponentPromise<T> = void 0;

  public readonly $controller!: ICustomElementController<T, this>; // This is set by the controller after this instance is constructed

  public constructor(
    @IDOM private readonly dom: IDOM<T>,
    @ITargetedInstruction instruction: IHydrateElementInstruction,
  ) {
    this.properties = instruction.instructions.reduce(toLookup, {});
  }

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { component, view } = this;
    if (view === void 0 || this.lastComponent !== component) {
      this.lastComponent = component;
      this.composing = true;

      return this.compose(void 0, component, initiator, flags);
    }

    return this.compose(view, component, initiator, flags);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.deactivate(this.view, initiator, flags);
  }

  public subjectChanged(
    newValue: Component<T> | Promise<Component<T>>,
    previousValue: Component<T> | Promise<Component<T>>,
    flags: LifecycleFlags,
  ): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    if (this.lastComponent === newValue) {
      return;
    }

    this.lastComponent = newValue;
    this.composing = true;

    flags |= $controller.flags;
    const ret = onResolve(
      this.deactivate(this.view, null, flags),
      () => {
        // TODO(fkleuver): handle & test race condition
        return this.compose(void 0, newValue, null, flags);
      },
    );
    if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
  }

  private compose(
    view: ISyntheticView<T> | undefined | Promise<ISyntheticView<T> | undefined>,
    component: MaybeComponentPromise<T>,
    initiator: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return onResolve(
      view === void 0
      ? onResolve(component, resolvedComponent => {
        return this.resolveView(resolvedComponent, flags);
      })
      : view,
      resolvedView => {
        return this.activate(resolvedView, initiator, flags);
      },
    );
  }

  private deactivate(
    view: ISyntheticView<T> | undefined,
    initiator: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return view?.deactivate(initiator ?? view, this.$controller, flags);
  }

  private activate(
    view: ISyntheticView<T> | undefined,
    initiator: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return onResolve(
      view?.activate(initiator ?? view, $controller, flags, $controller.scope, $controller.part),
      () => {
        this.composing = false;
      },
    );
  }

  private resolveView(component: Component<T> | undefined, flags: LifecycleFlags): ISyntheticView<T> | undefined {
    const view = this.provideViewFor(component, flags);

    if (view) {
      view.setLocation(this.$controller.projector!.host, MountStrategy.insertBefore);
      view.lockScope(this.$controller.scope);
      return view;
    }

    return void 0;
  }

  private provideViewFor(component: Component<T> | undefined, flags: LifecycleFlags): ISyntheticView<T> | undefined {
    if (!component) {
      return void 0;
    }

    if (isController(component)) { // IController
      return component;
    }

    if ('createView' in component) { // RenderPlan
      return component.createView(this.$controller.context!);
    }

    if ('create' in component) { // IViewFactory
      return component.create(flags);
    }

    if ('template' in component) { // Raw Template Definition
      const definition = CustomElementDefinition.getOrCreate(component);
      return getRenderContext<T>(definition, this.$controller.context!, void 0).getViewFactory().create(flags);
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.dom,
      component,
      this.properties,
      this.$controller.projector === void 0
        ? PLATFORM.emptyArray
        : this.$controller.projector.children
    ).createView(this.$controller.context!);
  }

  public onCancel(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void {
    this.view?.cancel(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

function isController<T extends INode = INode>(component: Component<T>): component is ISyntheticView<T> {
  return 'lockScope' in component;
}
