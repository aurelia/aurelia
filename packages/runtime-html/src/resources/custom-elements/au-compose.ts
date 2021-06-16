import { Constructable, IContainer, InstanceProvider, ITask, onResolve, transient } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable.js';
import { INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { HydrateElementInstruction, IInstruction } from '../../renderer.js';
import { Controller, IController, ICustomElementController, IHydratedController, ISyntheticView } from '../../templating/controller.js';
import { getRenderContext } from '../../templating/render-context.js';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element.js';

// plan:
// 0. <au-component/> is containerless
//    this probably won't work, since it prohibits the use of shadow dom + slot naturally
//    this probably will still allows au-slot
// 1. create host element corresponding to the composed component view model
//    if there's no view model def, then creates a div
//    if there's no view model at all, then creates a div
//    this probably has issue related to containerless, since it's sometimes desirable

/**
 * An optional interface describing the dialog activate convention.
 */
export interface IDynamicComponentActivate<T> {
  /**
   * Implement this hook if you want to perform custom logic just before the component is is composed.
   * The returned value is not used.
   */
  activate?(model?: T): unknown | Promise<unknown>;
}

type MaybePromise<T> = T | Promise<T>;
type ChangeSource = 'view' | 'viewModel' | 'model' | 'scopeBehavior';

// Desired usage:
// <au-component view.bind="Promise<string>" view-model.bind="" model.bind="" />
// <au-component view.bind="<string>" model.bind="" />
//

@customElement('au-compose')
export class AuCompose {

  /** @internal */
  protected static get inject() {
    return [IContainer, IController, INode, IPlatform, IInstruction, transient(CompositionContextFactory)];
  }

  /* determine what template used to compose the component */
  @bindable
  public view?: string | Promise<string>;

  /* determine the view model instance used to compose the component */
  @bindable
  public viewModel?: Constructable | object | Promise<Constructable | object>;

  /* the model used to pass to activate lifecycle of the component */
  @bindable
  public model?: unknown;

  @bindable({ set: v => {
    if (v === 'scoped' || v === 'auto') {
      return v;
    }
    throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
  }})
  public scopeBehavior: 'auto' | 'scoped' = 'auto';

  /** @internal */
  public readonly $controller!: ICustomElementController<AuCompose>;

  /** @internal */
  private task: ITask | null = null;

  /** @internal */
  private c: ICompositionController | undefined = void 0;
  public get composition(): ICompositionController | undefined {
    return this.c;
  }

  public constructor(
    private readonly container: IContainer,
    private readonly parent: ISyntheticView | ICustomElementController,
    private readonly host: HTMLElement,
    private readonly p: IPlatform,
    // todo: use this to retrieve au-slot instruction
    //        for later enhancement related to <au-slot/> + compose
    private readonly instruction: HydrateElementInstruction,
    private readonly contextFactory: CompositionContextFactory,
  ) {
  }

  public attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    return this.queue(new ChangeInfo(this.view, this.viewModel, this.model, initiator, void 0));
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    this.task?.cancel();
    this.task = null;
    const cmpstn = this.c;
    if (cmpstn != null) {
      this.c = void 0;
      return cmpstn.deactivate(initiator);
    }
  }

  /** @internal */
  protected propertyChanged(name: ChangeSource): void {
    const task = this.task;
    this.task = this.p.domWriteQueue.queueTask(() => {
      return onResolve(this.queue(new ChangeInfo(this.view!, this.viewModel, this.model, void 0, name)), () => {
        this.task = null;
      });
    });
    task?.cancel();
  }

  /** @internal */
  private queue(change: ChangeInfo): void | Promise<void> {
    const factory = this.contextFactory;
    const currentComposition = this.c;
    if (change.src === 'model' && currentComposition != null) {
      return currentComposition.update(change.model);
    }
    // todo: handle consequitive changes that create multiple queues
    return onResolve(
      factory.create(change),
      context => {
        // Don't compose [stale] view/view model
        // by always ensuring that the composition context is the latest one
        if (factory.isCurrent(context)) {
          return onResolve(this.compose(context), (result) => {
            // Don't activate [stale] controller
            // by always ensuring that the composition context is the latest one
            if (factory.isCurrent(context)) {
              return onResolve(result.activate(), () => {
                // Don't conclude the [stale] composition
                // by always ensuring that the composition context is the latest one
                if (factory.isCurrent(context)) {
                  // after activation, if the composition context is still the most recent one
                  // then the job is done
                  this.c = result;
                  return currentComposition?.deactivate(change.initiator);
                } else {
                  // the stale controller should be deactivated
                  return onResolve(
                    result.controller.deactivate(result.controller, this.$controller, LifecycleFlags.fromUnbind),
                    // todo: do we need to deactivate?
                    () => result.controller.dispose()
                  );
                }
              });
            } else {
              result.controller.dispose();
            }
          });
        }
      }
    );
  }

  /** @internal */
  private compose(context: CompositionContext): MaybePromise<ICompositionController> {
    // todo: when both view model and view are empty
    //       should it throw or try it best to proceed?
    //       current: proceed
    const { view, viewModel, model, initiator } = context.change;
    const { container, host, $controller, contextFactory } = this;
    const comp = this.getOrCreateVm(container, viewModel, host);
    const compose: () => ICompositionController = () => {
      const srcDef = this.getDefinition(comp);
      // custom element based composition
      if (srcDef !== null) {
        const targetDef = CustomElementDefinition.create(
          srcDef ?? { name: CustomElement.generateName(), template: view }
        );
        const controller = Controller.forCustomElement(
          null,
          container,
          comp,
          host,
          null,
          LifecycleFlags.none,
          true,
          targetDef,
        );

        return new CompositionController(
          controller,
          () => controller.activate(initiator ?? controller, $controller, LifecycleFlags.fromBind),
          // todo: call deactivate on the component view model
          (deactachInitiator) => controller.deactivate(deactachInitiator ?? controller, $controller, LifecycleFlags.fromUnbind),
          // casting is technically incorrect
          // but it's ignored in the caller anyway
          (model) => comp.activate?.(model) as MaybePromise<void>,
          context,
        );
      } else {
        const targetDef = CustomElementDefinition.create({
          name: CustomElement.generateName(),
          template: view
        });
        const renderContext = getRenderContext(targetDef, container);
        const viewFactory = renderContext.getViewFactory();
        const controller = Controller.forSyntheticView(
          contextFactory.isFirst(context) ? $controller.root : null,
          renderContext,
          viewFactory,
          LifecycleFlags.fromBind,
          $controller
        );
        const scope = this.scopeBehavior === 'auto'
          ? Scope.fromParent(this.parent.scope, comp)
          : Scope.create(comp);

        controller.setHost(host);

        return new CompositionController(
          controller,
          () => controller.activate(initiator ?? controller, $controller, LifecycleFlags.fromBind, scope, null),
          // todo: call deactivate on the component view model
          (detachInitiator) => controller.deactivate(detachInitiator ?? controller, $controller, LifecycleFlags.fromUnbind),
          // casting is technically incorrect
          // but it's ignored in the caller anyway
          (model) => comp.activate?.(model) as MaybePromise<void>,
          context,
        );
      }
    };
    if ('activate' in comp) {
      // todo: try catch
      // req:  ensure synchronosity of compositions that dont employ promise
      return onResolve(comp.activate!(model), () => compose());
    } else {
      return compose();
    }
  }

  /** @internal */
  private getOrCreateVm(container: IContainer, comp: Constructable | object | undefined, host: HTMLElement): IDynamicComponentActivate<unknown> {
    if (comp == null) {
      return new EmptyComponent();
    }
    if (typeof comp === 'object') {
      return comp;
    }

    const p = this.p;
    const ep = new InstanceProvider('ElementResolver');

    ep.prepare(host);
    container.registerResolver(INode, ep);
    container.registerResolver(p.Node, ep);
    container.registerResolver(p.Element, ep);
    container.registerResolver(p.HTMLElement, ep);

    return container.invoke(comp);
  }

  /** @internal */
  private getDefinition(component?: object | Constructable) {
    const Ctor = (typeof component === 'function'
      ? component
      : component?.constructor) as Constructable;
    return CustomElement.isType(Ctor)
      ? CustomElement.getDefinition(Ctor)
      : null;
  }
}

class EmptyComponent { }

export interface ICompositionController {
  readonly controller: IHydratedController;
  readonly context: CompositionContext;
  activate(): void | Promise<void>;
  // deactivation is done differently, compared to activation
  // when the `<au-component/>` is deactivated, initiator will be an ancestor controller
  //
  // while when the value of the @bindables changes, initiator should be
  // the controller wrapped in this composition controller
  deactivate(detachInitator?: IHydratedController): void | Promise<void>;
  update(model: unknown): void | Promise<void>;
}

class CompositionContextFactory {
  private id = 0;

  public isFirst(context: CompositionContext): boolean {
    return context.id === 0;
  }

  public isCurrent(context: CompositionContext): boolean {
    return context.id === this.id - 1;
  }

  public create(changes: ChangeInfo): MaybePromise<CompositionContext> {
    return onResolve(changes.load(), (loaded) => new CompositionContext(this.id++, loaded));
  }
}

class ChangeInfo {
  public constructor(
    public readonly view: MaybePromise<string> | undefined,
    public readonly viewModel: MaybePromise<Constructable | object> | undefined,
    public readonly model: unknown | undefined,
    public readonly initiator: IHydratedController | undefined,
    public readonly src: ChangeSource | undefined,
  ) { }

  public load(): MaybePromise<LoadedChangeInfo> {
    if (this.view instanceof Promise || this.viewModel instanceof Promise) {
      return Promise
        .all([this.view, this.viewModel])
        .then(([view, viewModel]) => {
          return new LoadedChangeInfo(view, viewModel, this.model, this.initiator, this.src);
        });
    } else {
      return new LoadedChangeInfo(this.view, this.viewModel, this.model, this.initiator, this.src);
    }
  }
}

class LoadedChangeInfo {
  public constructor(
    public readonly view: string | undefined,
    public readonly viewModel: Constructable | object | undefined,
    public readonly model: unknown | undefined,
    public readonly initiator: IHydratedController | undefined,
    public readonly src: ChangeSource | undefined,
  ) { }
}

class CompositionContext {
  public constructor(
    public readonly id: number,
    public readonly change: LoadedChangeInfo,
  ) { }
}

class CompositionController implements ICompositionController {
  private state: /* stopped */-1 | /* initial */0 | /* started */1 = 0;

  public constructor(
    public readonly controller: ISyntheticView | ICustomElementController,
    private readonly start: () => void | Promise<void>,
    private readonly stop: (detachInitator?: IHydratedController) => void | Promise<void>,
    public readonly update: (model: unknown) => void | Promise<void>,
    public readonly context: CompositionContext,
  ) {

  }

  public activate() {
    if (this.state !== 0) {
      throw new Error(`Composition has already been activated/deactivated. Id: ${this.controller.id}`);
    }
    this.state = 1;
    return this.start();
  }

  public deactivate(detachInitator?: IHydratedController) {
    switch (this.state) {
      case 1:
        this.state = -1;
        return this.stop(detachInitator);
      case -1:
        throw new Error('Composition has already been deactivated.');
      default:
        this.state = -1;
    }
  }
}
