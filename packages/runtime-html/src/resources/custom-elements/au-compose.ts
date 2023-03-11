import { Constructable, IContainer, InstanceProvider, onResolve, transient } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable';
import { INode, IRenderLocation, isRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { HydrateElementInstruction, IInstruction } from '../../renderer';
import { Controller, IController, ICustomElementController, IHydratedController, ISyntheticView } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { createError, isFunction, isPromise } from '../../utilities';
import { registerResolver } from '../../utilities-di';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element';

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
type ChangeSource = keyof Pick<AuCompose, 'template' | 'component' | 'model' | 'scopeBehavior'>;

// Desired usage:
// <au-component template.bind="Promise<string>" component.bind="" model.bind="" />
// <au-component template.bind="<string>" model.bind="" />
//
export class AuCompose {

  /** @internal */
  protected static get inject() {
    return [IContainer, IController, INode, IRenderLocation, IPlatform, IInstruction, transient(CompositionContextFactory)];
  }

  /* determine what template used to compose the component */
  @bindable
  public template?: string | Promise<string>;

  /* determine the component instance used to compose the component */
  @bindable
  public component?: Constructable | object | Promise<Constructable | object>;

  /* the model used to pass to activate lifecycle of the component */
  @bindable
  public model?: unknown;

  /**
   * Control scoping behavior of the view created by the au-compose.
   * This only affects template-only composition. Does not have effects on custom element composition.
   *
   * auto = inherit parent scope
   * scoped = do not inherit parent scope
   */
  @bindable({
    set: v => {
      if (v === 'scoped' || v === 'auto') {
        return v;
      }
      if (__DEV__)
        throw createError(`AUR0805: Invalid scope behavior config. Only "scoped" or "auto" allowed.`);
      else
        throw createError(`AUR0805`);
    }
  })
  public scopeBehavior: 'auto' | 'scoped' = 'auto';

  /** @internal */
  public readonly $controller!: ICustomElementController<AuCompose>;

  /** @internal */
  private _pending?: Promise<void> | void;
  public get pending(): Promise<void> | void {
    return this._pending;
  }

  /** @internal */
  private _composition: ICompositionController | undefined = void 0;
  public get composition(): ICompositionController | undefined {
    return this._composition;
  }

  /** @internal */ private readonly _rendering: IRendering;
  /** @internal */ private readonly _instruction: HydrateElementInstruction;
  /** @internal */ private readonly _contextFactory: CompositionContextFactory;

  public constructor(
    /** @internal */ private readonly _container: IContainer,
    /** @internal */ private readonly parent: ISyntheticView | ICustomElementController,
    /** @internal */ private readonly host: HTMLElement,
    /** @internal */ private readonly _location: IRenderLocation,
    /** @internal */ private readonly _platform: IPlatform,
    // todo: use this to retrieve au-slot instruction
    //        for later enhancement related to <au-slot/> + compose
    instruction: HydrateElementInstruction,
    contextFactory: CompositionContextFactory,
  ) {
    this._rendering = _container.get(IRendering);
    this._instruction = instruction;
    this._contextFactory = contextFactory;
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    return this._pending = onResolve(
      this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), initiator),
      (context) => {
        if (this._contextFactory.isCurrent(context)) {
          this._pending = void 0;
        }
      }
    );
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    const cmpstn = this._composition;
    const pending = this._pending;
    this._contextFactory.invalidate();
    this._composition = this._pending = void 0;
    return onResolve(pending, () => cmpstn?.deactivate(initiator));
  }

  /** @internal */
  protected propertyChanged(name: ChangeSource): void {
    if (name === 'model' && this._composition != null) {
      // eslint-disable-next-line
      this._composition.update(this.model);
      return;
    }
    this._pending = onResolve(this._pending, () =>
      onResolve(
        this.queue(new ChangeInfo(this.template, this.component, this.model, name), void 0),
        (context) => {
          if (this._contextFactory.isCurrent(context)) {
            this._pending = void 0;
          }
        }
      )
    );
  }

  /** @internal */
  private queue(change: ChangeInfo, initiator: IHydratedController | undefined): CompositionContext | Promise<CompositionContext> {
    const factory = this._contextFactory;
    const compositionCtrl = this._composition;
    // todo: handle consequitive changes that create multiple queues
    return onResolve(
      factory.create(change),
      context => {
        // Don't compose [stale] template/component
        // by always ensuring that the composition context is the latest one
        if (factory.isCurrent(context)) {
          return onResolve(this.compose(context), (result) => {
            // Don't activate [stale] controller
            // by always ensuring that the composition context is the latest one
            if (factory.isCurrent(context)) {
              return onResolve(result.activate(initiator), () => {
                // Don't conclude the [stale] composition
                // by always ensuring that the composition context is the latest one
                if (factory.isCurrent(context)) {
                  // after activation, if the composition context is still the most recent one
                  // then the job is done
                  this._composition = result;
                  return onResolve(compositionCtrl?.deactivate(initiator), () => context);
                } else {
                  // the stale controller should be deactivated
                  return onResolve(
                    result.controller.deactivate(result.controller, this.$controller),
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
    // todo: when both component and template are empty
    //       should it throw or try it best to proceed?
    //       current: proceed
    const { _template: template, _component: component, _model: model } = context.change;
    const { _container: container, host, $controller, _location: loc } = this;
    const vmDef = this.getDef(component);
    const childCtn: IContainer = container.createChild();
    const parentNode = loc == null ? host.parentNode : loc.parentNode;

    if (vmDef !== null) {
      if (vmDef.containerless) {
        if (__DEV__)
          throw createError(`AUR0806: Containerless custom element is not supported by <au-compose/>`);
        else
          throw createError(`AUR0806`);
      }
      if (loc == null) {
        compositionHost = host;
        removeCompositionHost = () => {
          // This is a normal composition, the content template is removed by deactivation process
          // but the host remains
        };
      } else {
        // todo: should the host be appended later, during the activation phase instead?
        compositionHost = parentNode!.insertBefore(this._platform.document.createElement(vmDef.name), loc);
        removeCompositionHost = () => {
          compositionHost.remove();
        };
      }
      comp = this._getComp(childCtn, component, compositionHost);
    } else {
      compositionHost = loc == null
        ? host
        : loc;
      comp = this._getComp(childCtn, component, compositionHost);
    }
    const compose: () => ICompositionController = () => {
      // custom element based composition
      if (vmDef !== null) {
        const controller = Controller.$el(
          childCtn,
          comp,
          compositionHost as HTMLElement,
          { projections: this._instruction.projections },
          vmDef,
        );

        return new CompositionController(
          controller,
          (attachInitiator) => controller.activate(attachInitiator ?? controller, $controller, $controller.scope.parent!),
          // todo: call deactivate on the component component
          (deactachInitiator) => onResolve(
            controller.deactivate(deactachInitiator ?? controller, $controller),
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
          template: template,
        });
        const viewFactory = this._rendering.getViewFactory(targetDef, childCtn);
        const controller = Controller.$view(
          viewFactory,
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
          (attachInitiator) => controller.activate(attachInitiator ?? controller, $controller, scope),
          // todo: call deactivate on the component
          // a difference with composing custom element is that we leave render location/host alone
          // as they all share the same host/render location
          (detachInitiator) => controller.deactivate(detachInitiator ?? controller, $controller),
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
  private _getComp(container: IContainer, comp: Constructable | object | undefined, host: HTMLElement | IRenderLocation): IDynamicComponentActivate<unknown> {
    if (comp == null) {
      return new EmptyComponent();
    }
    if (typeof comp === 'object') {
      return comp;
    }

    const p = this._platform;
    const isLocation = isRenderLocation(host);
    registerResolver(
      container,
      p.Element,
      registerResolver(
        container,
        INode,
        new InstanceProvider('ElementResolver', isLocation ? null : host)
      )
    );
    registerResolver(
      container,
      IRenderLocation,
      new InstanceProvider('IRenderLocation', isLocation ? host : null)
    );

    const instance = container.invoke(comp);
    registerResolver(container, comp, new InstanceProvider('au-compose.component', instance));

    return instance;
  }

  /** @internal */
  private getDef(component?: object | Constructable) {
    const Ctor = (isFunction(component)
      ? component
      : component?.constructor) as Constructable;
    return CustomElement.isType(Ctor)
      ? CustomElement.getDefinition(Ctor)
      : null;
  }
}

customElement('au-compose')(AuCompose);

class EmptyComponent { }

export interface ICompositionController {
  readonly controller: IHydratedController;
  readonly context: CompositionContext;
  activate(initiator?: IHydratedController): void | Promise<void>;
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

  public isCurrent(context: CompositionContext): boolean {
    return context.id === this.id;
  }

  public create(changes: ChangeInfo): MaybePromise<CompositionContext> {
    return onResolve(changes.load(), (loaded) => new CompositionContext(++this.id, loaded));
  }

  // simplify increasing the id will invalidate all previously created context
  public invalidate(): void {
    this.id++;
  }
}

class ChangeInfo {
  public constructor(
    public readonly _template: MaybePromise<string> | undefined,
    public readonly _component: MaybePromise<Constructable | object> | undefined,
    public readonly _model: unknown | undefined,
    public readonly _src: ChangeSource | undefined,
  ) { }

  public load(): MaybePromise<LoadedChangeInfo> {
    if (isPromise(this._template) || isPromise(this._component)) {
      return Promise
        .all([this._template, this._component])
        .then(([template, component]) => {
          return new LoadedChangeInfo(template, component, this._model, this._src);
        });
    } else {
      return new LoadedChangeInfo(this._template, this._component, this._model, this._src);
    }
  }
}

class LoadedChangeInfo {
  public constructor(
    public readonly _template: string | undefined,
    public readonly _component: Constructable | object | undefined,
    public readonly _model: unknown | undefined,
    public readonly _src: ChangeSource | undefined,
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
    private readonly start: (attachInitiator?: IHydratedController) => void | Promise<void>,
    private readonly stop: (detachInitator?: IHydratedController) => void | Promise<void>,
    public readonly update: (model: unknown) => void | Promise<void>,
    public readonly context: CompositionContext,
  ) {

  }

  public activate(initiator?: IHydratedController) {
    if (this.state !== 0) {
      if (__DEV__)
        throw createError(`AUR0807: Composition has already been activated/deactivated. Id: ${this.controller.name}`);
      else
        throw createError(`AUR0807:${this.controller.name}`);
    }
    this.state = 1;
    return this.start(initiator);
  }

  public deactivate(detachInitator?: IHydratedController) {
    switch (this.state) {
      case 1:
        this.state = -1;
        return this.stop(detachInitator);
      case -1:
        if (__DEV__)
          throw createError(`AUR0808: Composition has already been deactivated.`);
        else
          throw createError(`AUR0808`);
      default:
        this.state = -1;
    }
  }
}
