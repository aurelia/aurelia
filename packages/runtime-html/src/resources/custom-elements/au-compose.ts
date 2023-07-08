import { Constructable, IContainer, InstanceProvider, onResolve, resolve, transient } from '@aurelia/kernel';
import { IExpressionParser, IObserverLocator, Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable';
import { INode, IRenderLocation, isRenderLocation, registerHostNode } from '../../dom';
import { IPlatform } from '../../platform';
import { HydrateElementInstruction, IInstruction, ITemplateCompiler } from '../../renderer';
import { Controller, IController, ICustomElementController, IHydratedController, IHydrationContext, ISyntheticView } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { isFunction, isPromise } from '../../utilities';
import { registerResolver } from '../../utilities-di';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element';
import { ErrorNames, createMappedError } from '../../errors';
import { BindingMode } from '../../binding/interfaces-bindings';
import { SpreadBinding } from '../../binding/spread-binding';

/**
 * An optional interface describing the dynamic composition activate convention.
 */
export interface IDynamicComponentActivate<T> {
  /**
   * Implement this hook if you want to perform custom logic just before the component is is composed.
   * The returned value is not used.
   */
  activate?(model?: T): unknown | Promise<unknown>;
}

type MaybePromise<T> = T | Promise<T>;
type ChangeSource = keyof Pick<AuCompose, 'template' | 'component' | 'model' | 'scopeBehavior' | 'composing' | 'composition'>;

// Desired usage:
// <au-component template.bind="Promise<string>" component.bind="" model.bind="" />
// <au-component template.bind="<string>" model.bind="" />
//
export class AuCompose {
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
      throw createMappedError(ErrorNames.au_compose_invalid_scope_behavior, v);
    }
  })
  public scopeBehavior: 'auto' | 'scoped' = 'auto';

  /** @internal */
  public readonly $controller!: ICustomElementController<AuCompose>;

  /** @internal */
  private _composing?: Promise<void> | void;
  @bindable({
    mode: BindingMode.fromView
  })
  public get composing(): Promise<void> | void {
    return this._composing;
  }

  /** @internal */
  private _composition: ICompositionController | undefined = void 0;
  @bindable({
    mode: BindingMode.fromView
  })
  public get composition(): ICompositionController | undefined {
    return this._composition;
  }

  /** @internal */ private readonly _container = resolve(IContainer);
  /** @internal */ private readonly parent = resolve(IController) as ISyntheticView | ICustomElementController;
  /** @internal */ private readonly host = resolve(INode) as HTMLElement;
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /** @internal */ private readonly _rendering = resolve(IRendering);
  /** @internal */ private readonly _instruction = resolve(IInstruction) as HydrateElementInstruction;
  /** @internal */ private readonly _contextFactory = resolve(transient(CompositionContextFactory));
  /** @internal */ private readonly _compiler = resolve(ITemplateCompiler);
  /** @internal */ private readonly _hydrationContext = resolve(IHydrationContext);
  /** @internal */ private readonly _exprParser = resolve(IExpressionParser);
  /** @internal */ private readonly _observerLocator = resolve(IObserverLocator);

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    return this._composing = onResolve(
      this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), initiator),
      (context) => {
        if (this._contextFactory.isCurrent(context)) {
          this._composing = void 0;
        }
      }
    );
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    const cmpstn = this._composition;
    const pending = this._composing;
    this._contextFactory.invalidate();
    this._composition = this._composing = void 0;
    return onResolve(pending, () => cmpstn?.deactivate(initiator));
  }

  /** @internal */
  public propertyChanged(name: ChangeSource): void {
    if (name === 'composing' || name === 'composition') return;
    if (name === 'model' && this._composition != null) {
      // eslint-disable-next-line
      this._composition.update(this.model);
      return;
    }
    this._composing = onResolve(this._composing, () =>
      onResolve(
        this.queue(new ChangeInfo(this.template, this.component, this.model, name), void 0),
        (context) => {
          if (this._contextFactory.isCurrent(context)) {
            this._composing = void 0;
          }
        }
      )
    );
  }

  /** @internal */
  private queue(change: ChangeInfo, initiator: IHydratedController | undefined): CompositionContext | Promise<CompositionContext> {
    const factory = this._contextFactory;
    const prevCompositionCtrl = this._composition;
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
                  return onResolve(prevCompositionCtrl?.deactivate(initiator), () => context);
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
    let removeCompositionHost: () => void;
    // todo: when both component and template are empty
    //       should it throw or try it best to proceed?
    //       current: proceed
    const { _template: template, _component: component, _model: model } = context.change;
    const { _container: container, host, $controller, _location: loc } = this;
    const vmDef = this.getDef(component);
    const childCtn: IContainer = container.createChild();
    let compositionHost: HTMLElement | IRenderLocation;

    if (vmDef !== null) {
      if (vmDef.containerless) {
        throw createMappedError(ErrorNames.au_compose_containerless, vmDef);
      }
      compositionHost = this._platform.document.createElement(vmDef.name);
      removeCompositionHost = () => {
        compositionHost.remove();
      };
      if (loc == null) {
        host.appendChild(compositionHost);
      } else {
        loc.parentNode!.insertBefore(compositionHost, loc);
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

        const bindings = SpreadBinding.create(
          this.$controller.container,
          compositionHost as HTMLElement,
          vmDef,
          this._rendering,
          this._compiler,
          this._platform,
          this._exprParser,
          this._observerLocator,
        );
        // Theoretically these bindings aren't bindings of the composed custom element
        // Though they are meant to be activated (bound)/ deactivated (unbound) together
        // with the custom element controller, so it's practically ok to let the composed
        // custom element manage these bindings
        bindings.forEach(b => controller.addBinding(b));

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
    registerHostNode(container, p, isLocation ? null : host);
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

customElement({
  name: 'au-compose',
  capture: true,
})(AuCompose);

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
      throw createMappedError(ErrorNames.au_compose_invalid_run, this);
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
        throw createMappedError(ErrorNames.au_compose_duplicate_deactivate);
      default:
        this.state = -1;
    }
  }
}
