import { Constructable, IContainer, InstanceProvider, onResolve, transient } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable.js';
import { convertToRenderLocation, INode, IRenderLocation, isRenderLocation } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { HydrateElementInstruction, IInstruction } from '../../renderer.js';
import { Controller, IController, ICustomElementController, IHydratedController, ISyntheticView } from '../../templating/controller.js';
import { IRendering } from '../../templating/rendering.js';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element.js';

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

  @bindable({
    set: v => {
      if (v === 'scoped' || v === 'auto') {
        return v;
      }
      throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
    }
  })
  public scopeBehavior: 'auto' | 'scoped' = 'auto';

  /** @internal */
  public readonly $controller!: ICustomElementController<AuCompose>;

  private _p?: Promise<void> | void;
  public get pending(): Promise<void> | void {
    return this._p;
  }

  /** @internal */
  private c: ICompositionController | undefined = void 0;
  public get composition(): ICompositionController | undefined {
    return this.c;
  }

  private readonly r: IRendering;

  /** @internal */
  private readonly loc: IRenderLocation | undefined;

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
    this.loc = instruction.containerless ? convertToRenderLocation(this.host) : void 0;
    this.r = container.get(IRendering);
  }

  public attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    return this._p = onResolve(
      this.queue(new ChangeInfo(this.view, this.viewModel, this.model, initiator, void 0)),
      (context) => {
        if (this.contextFactory.isCurrent(context)) {
          this._p = void 0;
        }
      }
    );
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    const cmpstn = this.c;
    const pending = this._p;
    this.contextFactory.invalidate();
    this.c = this._p = void 0;
    return onResolve(pending, () => cmpstn?.deactivate(initiator));
  }

  /** @internal */
  protected propertyChanged(name: ChangeSource): void {
    if (name === 'model' && this.c != null) {
      // eslint-disable-next-line
      this.c.update(this.model);
      return;
    }
    this._p = onResolve(this._p, () =>
      onResolve(
        this.queue(new ChangeInfo(this.view!, this.viewModel, this.model, void 0, name)),
        (context) => {
          if (this.contextFactory.isCurrent(context)) {
            this._p = void 0;
          }
        }
      )
    );
  }

  /** @internal */
  private queue(change: ChangeInfo): CompositionContext | Promise<CompositionContext> {
    const factory = this.contextFactory;
    const compositionCtrl = this.c;
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
                  return onResolve(compositionCtrl?.deactivate(change.initiator), () => context);
                } else {
                  // the stale controller should be deactivated
                  return onResolve(
                    result.controller.deactivate(result.controller, this.$controller, LifecycleFlags.fromUnbind),
                    // todo: do we need to deactivate?
                    () => {
                      result.controller.dispose();
                      return context;
                    }
                  );
                }
              });
            }

            result.controller.dispose();
            return context;
          });
        }

        return context;
      }
    );
  }

  /** @internal */
  private compose(context: CompositionContext): MaybePromise<ICompositionController> {
    let comp: IDynamicComponentActivate<unknown>;
    let compositionHost: HTMLElement | IRenderLocation;
    let removeCompositionHost: () => void;
    // todo: when both view model and view are empty
    //       should it throw or try it best to proceed?
    //       current: proceed
    const { view, viewModel, model, initiator } = context.change;
    const { container, host, $controller, loc } = this;
    const srcDef = this.getDef(viewModel);
    const childCtn: IContainer = container.createChild();
    const parentNode = loc == null ? host.parentNode : loc.parentNode;

    if (srcDef !== null) {
      if (srcDef.containerless) {
        throw new Error('Containerless custom element is not supported by <au-compose/>');
      }
      if (loc == null) {
        compositionHost = host;
        removeCompositionHost = () => {
          // This is a normal composition, the content template is removed by deactivation process
          // but the host remains
        };
      } else {
        // todo: should the host be appended later, during the activation phase instead?
        compositionHost = parentNode!.insertBefore(this.p.document.createElement(srcDef.name), loc);
        removeCompositionHost = () => {
          compositionHost.remove();
        };
      }
      comp = this.getVm(childCtn, viewModel, compositionHost);
    } else {
      compositionHost = loc == null
        ? host
        : loc;
      comp = this.getVm(childCtn, viewModel, compositionHost);
    }
    const compose: () => ICompositionController = () => {
      // custom element based composition
      if (srcDef !== null) {
        const controller = Controller.forCustomElement(
          childCtn,
          comp,
          compositionHost as HTMLElement,
          null,
          LifecycleFlags.none,
          true,
          srcDef,
        );

        return new CompositionController(
          controller,
          () => controller.activate(initiator ?? controller, $controller, LifecycleFlags.fromBind),
          // todo: call deactivate on the component view model
          (deactachInitiator) => onResolve(
            controller.deactivate(deactachInitiator ?? controller, $controller, LifecycleFlags.fromUnbind),
            removeCompositionHost
          ),
          // casting is technically incorrect
          // but it's ignored in the caller anyway
          (model) => comp.activate?.(model) as MaybePromise<void>,
          context,
        );
      } else {
        const targetDef = CustomElementDefinition.create({
          name: CustomElement.generateName(),
          template: view,
        });
        const viewFactory = this.r.getViewFactory(targetDef, childCtn);
        const controller = Controller.forSyntheticView(
          viewFactory,
          LifecycleFlags.fromBind,
          $controller
        );
        const scope = this.scopeBehavior === 'auto'
          ? Scope.fromParent(this.parent.scope, comp)
          : Scope.create(comp);

        if (isRenderLocation(compositionHost)) {
          controller.setLocation(compositionHost);
        } else {
          controller.setHost(compositionHost);
        }

        return new CompositionController(
          controller,
          () => controller.activate(initiator ?? controller, $controller, LifecycleFlags.fromBind, scope),
          // todo: call deactivate on the component view model
          // a difference with composing custom element is that we leave render location/host alone
          // as they all share the same host/render location
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
  private getVm(container: IContainer, comp: Constructable | object | undefined, host: HTMLElement | IRenderLocation): IDynamicComponentActivate<unknown> {
    if (comp == null) {
      return new EmptyComponent();
    }
    if (typeof comp === 'object') {
      return comp;
    }

    const p = this.p;
    const isLocation = isRenderLocation(host);
    const nodeProvider = new InstanceProvider('ElementResolver', isLocation ? null : host as HTMLElement);
    container.registerResolver(INode, nodeProvider);
    container.registerResolver(p.Node, nodeProvider);
    container.registerResolver(p.Element, nodeProvider);
    container.registerResolver(p.HTMLElement, nodeProvider);
    container.registerResolver(
      IRenderLocation,
      new InstanceProvider('IRenderLocation', isLocation ? host as IRenderLocation : null)
    );

    const instance = container.invoke(comp);
    container.registerResolver(comp, new InstanceProvider('au-compose.viewModel', instance));

    return instance;
  }

  /** @internal */
  private getDef(component?: object | Constructable) {
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

  // simplify increasing the id will invalidate all previously created context
  public invalidate(): void {
    this.id++;
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
      throw new Error(`Composition has already been activated/deactivated. Id: ${this.controller.name}`);
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
