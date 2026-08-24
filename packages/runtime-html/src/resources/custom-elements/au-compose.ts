import { isFunction, isPromise, type Constructable, IContainer, InstanceProvider, type MaybePromise, emptyArray, onResolve, resolve, transient } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IObserverLocator, Scope } from '@aurelia/runtime';
import { HydrateElementInstruction, IInstruction, ITemplateCompiler, AttrSyntax } from '@aurelia/template-compiler';
import { IRenderLocation, convertToRenderLocation, registerHostNode } from '../../dom';
import { INode } from '../../dom.node';
import { IPlatform } from '../../platform';
import { Controller, type ControllerVisitor, HydrationContext, IController, ICustomElementController, IHydratedController, IHydrationContext, ISyntheticView, vmkCe } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { registerResolver } from '../../utilities-di';
import { CustomElement, CustomElementDefinition, CustomElementStaticAuDefinition, elementTypeName } from '../custom-element';
import { ErrorNames, createMappedError } from '../../errors';
import { fromView } from '../../binding/interfaces-bindings';
import { SpreadBinding } from '../../binding/spread-binding';

/**
 * An optional interface describing the dynamic composition activate convention.
 */
export interface IDynamicComponentActivate<T> {
  /**
   * Implement this hook to run custom logic before the component is composed.
   * A returned Promise delays composition until it settles. Its fulfillment value is ignored.
   */
  activate?(model?: T): unknown;
}

type ChangeSource = keyof Pick<AuCompose, 'template' | 'component' | 'model' | 'scopeBehavior' | 'composing' | 'composition' | 'tag' | 'flushMode'>;

// Desired usage:
// <au-component template.bind="Promise<string>" component.bind="" model.bind="" />
// <au-component template.bind="<string>" model.bind="" />
export class AuCompose {
  /** @internal */
  public static readonly $au: CustomElementStaticAuDefinition<keyof Pick<
    AuCompose,
    'template' | 'component' | 'model' | 'scopeBehavior' | 'composing' | 'composition' | 'tag' | 'flushMode'
  >> = {
    type: elementTypeName,
    name: 'au-compose',
    capture: true,
    containerless: true,
    bindables: [
      'template',
      'component',
      'model',
      { name: 'scopeBehavior', set: v => {
        if (v === 'scoped' || v === 'auto') {
          return v;
        }
        throw createMappedError(ErrorNames.au_compose_invalid_scope_behavior, v);
      }},
      { name: 'composing', mode: fromView},
      { name: 'composition', mode: fromView },
      'tag',
      { name: 'flushMode', set: v => {
        if (v === 'sync' || v === 'async') {
          return v;
        }
        throw createMappedError(ErrorNames.au_compose_invalid_flush_mode, v);
      }},
    ]
  };

  /* determine what template used to compose the component */
  public template?: string | Promise<string>;

  /**
   * Determine the component instance used to compose the component.
   *
   * - When a string is given as a value, it will be used as the name of the custom element to compose.
   * If there is no locally or globally registered custom element with that name, an error will be thrown.
   *
   * - When an object is given as a value, the object will be used as the component instance.
   * - When a constructor is given as a value, the constructor will be used to create the component instance.
   * - When a null/undefined is given as a value, the component will be composed as a template-only composition with an empty component instance.
   * - When a promise is given as a value, the promise will be awaited and the resolved value will be used as the value.
   */
  public component?: string | Constructable | object | Promise<string | Constructable | object>;

  /* the model used to pass to activate lifecycle of the component */
  public model?: unknown;

  /**
   * Control scoping behavior of the view created by the au-compose.
   * This only affects template-only composition. Does not have effects on custom element composition.
   *
   * auto = inherit parent scope
   * scoped = do not inherit parent scope
   */
  public scopeBehavior: 'auto' | 'scoped' = 'auto';

  /** @internal */
  private _composing?: Promise<void> | void;
  public get composing(): Promise<void> | void {
    return this._composing;
  }

  /** @internal */
  private _composition: ICompositionController | undefined = void 0;
  // `_composition` is only the committed public value. A newly created
  // controller is already owned before activation commits, and the old value
  // remains owned while it retires; traversal/disposal therefore uses this set.
  /** @internal */
  private readonly _ownedCompositions = new Set<ICompositionController>();
  // Teardown epoch captured by work queued behind `_composing`. Incrementing it
  // invalidates closures that were accepted before detaching began.
  /** @internal */
  private _queueVersion: number = 0;
  public get composition(): ICompositionController | undefined {
    return this._composition;
  }

  /**
   * The tag name of the element to be created for non custom element composition.
   *
   * `null`/`undefined` means containerless
   */
  public tag: string | null | undefined = null;

  /**
   * Control whether the composition is performed synchronously or asynchronously.
   */
  public flushMode: 'sync' | 'async' = 'sync';

  /** @internal */ public readonly $controller!: ICustomElementController<AuCompose>;
  /** @internal */ private readonly _container = resolve(IContainer);
  /** @internal */ private readonly parent = resolve(IController) as ISyntheticView | ICustomElementController;
  /** @internal */ private readonly _host = resolve(INode) as HTMLElement;
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /** @internal */ private readonly _rendering = resolve(IRendering);
  /** @internal */ private readonly _instruction = resolve(IInstruction) as HydrateElementInstruction;
  /** @internal */ private readonly _contextFactory = resolve(transient(CompositionContextFactory, null!));
  /** @internal */ private readonly _compiler = resolve(ITemplateCompiler);
  /** @internal */ private readonly _hydrationContext = resolve(IHydrationContext);
  /** @internal */ private readonly _exprParser = resolve(IExpressionParser);
  /** @internal */ private readonly _observerLocator = resolve(IObserverLocator);

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    return this._enqueueComposition(() =>
      this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), initiator)
    );
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    const pending = this._composing;
    // Close admission immediately. The prior tail must still settle, but no
    // queued bindable callback may publish work outside this teardown snapshot.
    ++this._queueVersion;
    this._contextFactory.invalidate();
    this._composition = this._composing = void 0;
    const deactivate = (): void => {
      // Descendant async work enrolls in the ancestor Controller operation; the
      // AuCompose hook commits only its synchronous owner boundary here.
      this._disposeOwnedCompositions(initiator);
    };
    if (!isPromise(pending)) {
      return deactivate();
    }
    return pending.then(deactivate);
  }

  public accept(visitor: ControllerVisitor): void | true {
    for (const composition of this._ownedCompositions) {
      if (composition.controller.accept(visitor) === true) {
        return true;
      }
    }
  }

  /** @internal */
  private _retireComposition(
    composition: ICompositionController,
    deactivate: () => void | Promise<void>,
    context: CompositionContext,
  ): CompositionContext | Promise<CompositionContext> {
    return onResolve(this._disposeComposition(composition, deactivate), () => context);
  }

  /** @internal */
  private _disposeComposition(
    composition: ICompositionController,
    deactivate: () => void | Promise<void>,
  ): void | Promise<void> {
    const dispose = () => {
      try {
        // Ancestor-driven Controller.deactivate intentionally returns no local
        // drain. Ask Controller to dispose at this composition's own cleanup
        // boundary rather than disposing underneath the ancestor operation.
        (composition.controller as Controller)._disposeAfterDeactivate();
      } finally {
        this._ownedCompositions.delete(composition);
      }
    };
    const result = deactivate();
    if (isPromise(result)) {
      return result.then(dispose);
    }
    dispose();
  }

  /** @internal */
  private _disposeOwnedCompositions(initiator: IHydratedController): void {
    // A composed lifecycle can synchronously change AuCompose inputs before the
    // outer queue publishes its tail, so more than one composition may be owned.
    // Snapshot the set because each disposal removes itself from ownership.
    for (const composition of Array.from(this._ownedCompositions)) {
      // Descendant async work is enrolled in the ancestor Controller operation;
      // no second Promise boundary is returned from this owner hook.
      void this._disposeComposition(composition, () => composition.deactivate(initiator));
    }
  }

  /** @internal */
  public propertyChanged(name: ChangeSource): void {
    if (!this.$controller.isActive || name === 'composing' || name === 'composition') {
      return;
    }
    if (this.flushMode === 'sync') {
      if (name === 'model' && this._composition != null) {
        this._updateModel(this.model);
        return;
      }
      // tag change does not affect existing custom element composition
      if (name === 'tag' && this._composition?.controller.vmKind === vmkCe) {
        if (__DEV__) {
          console.warn('[DEV:aurelia] Changing tag name of a custom element composition is ignored.'); // eslint-disable-line
        }
        return;
      }

      this._handleChangeInfo(new ChangeInfo(this.template, this.component, this.model, name));
    }
  }

  /** @internal */
  public propertiesChanged(changes: { [key in ChangeSource]: { newValue: AuCompose[key]; oldValue: AuCompose[key] } }): void {
    if (this.$controller.isActive && this.flushMode === 'async') {
      // `composing` and `composition` are from-view status bindables. They can
      // share this batched callback with inputs, but must not turn a model-only
      // update into structural recomposition or trigger work by themselves.
      const changeCount = Object.keys(changes).length
        - ('composing' in changes ? 1 : 0)
        - ('composition' in changes ? 1 : 0);
      if (changeCount === 0) {
        return;
      }
      if ('model' in changes && this._composition != null && changeCount === 1) {
        this._updateModel(this.model);
        return;
      }
      // tag change does not affect existing custom element composition
      if ('tag' in changes && this._composition?.controller.vmKind === vmkCe) {
        if (__DEV__) {
          console.warn('[DEV:aurelia] Changing tag name of a custom element composition is ignored.'); // eslint-disable-line
        }
        return;
      }

      this._handleChangeInfo(new ChangeInfo(
        this.template,
        this.component,
        this.model,
        'model' in changes ? 'model' : undefined
      ));
    }
  }

  /** @internal */
  private _handleChangeInfo(info: ChangeInfo): void {
    // Bindable callbacks cannot return async settlement. `_composing` is the
    // stable, bindable-visible tail; the ignored return is the same Promise.
    void this._enqueueComposition(() => this.queue(info, void 0));
  }

  /** @internal */
  private _updateModel(model: unknown): void {
    // As with structural bindable callbacks, `_composing` owns the returned tail.
    void this._enqueueComposition(() => this._composition?.update(model));
  }

  /** @internal */
  private _enqueueComposition(work: () => unknown): void | Promise<void> {
    const current = this._composing;
    // If teardown invalidated this queued successor, do not run it. A rejected
    // predecessor also stops its queued successors and remains the public error.
    let result: unknown;
    if (isPromise(current)) {
      const version = this._queueVersion;
      result = current.then(() => version === this._queueVersion ? work() : void 0);
    } else {
      result = work();
    }
    if (!isPromise(result)) {
      return;
    }

    const composing = result.then(() => {
      // An older tail must not clear a newer queued tail.
      if (this._composing === composing) {
        this._composing = void 0;
      }
    });
    this._composing = composing;
    return composing;
  }

  /** @internal */
  private queue(change: ChangeInfo, initiator: IHydratedController | undefined): CompositionContext | Promise<CompositionContext> {
    const factory = this._contextFactory;
    const prevCompositionCtrl = this._composition;
    return onResolve(
      factory.create(change),
      context => {
        // Don't compose [stale] template/component
        // by always ensuring that the composition context is the latest one
        if (factory._isCurrent(context)) {
          return onResolve(this.compose(context), (result) => {
            // Ownership begins when compose inserts/creates the controller, not
            // when activation commits. Pending and stale results must remain
            // visible to Controller traversal.
            this._ownedCompositions.add(result);
            // Don't activate [stale] controller
            // by always ensuring that the composition context is the latest one
            if (factory._isCurrent(context)) {
              const activation = result.activate(initiator);
              const conclude = () => {
                // Don't conclude the [stale] composition
                // by always ensuring that the composition context is the latest one
                if (factory._isCurrent(context)) {
                  // after activation, if the composition context is still the most recent one
                  // then the job is done
                  this._composition = result;
                  if (prevCompositionCtrl === void 0) {
                    return context;
                  }
                  return this._retireComposition(
                    prevCompositionCtrl,
                    () => prevCompositionCtrl.deactivate(initiator),
                    context,
                  );
                } else {
                  // the stale controller should be deactivated
                  return this._retireComposition(
                    result,
                    () => result.deactivate(result.controller),
                    context,
                  );
                }
              };
              if (isPromise(activation)) {
                return activation.then(conclude);
              }
              return conclude();
            }

            return this._retireComposition(
              result,
              () => result.deactivate(result.controller),
              context,
            );
          });
        }

        return context;
      }
    );
  }

  /** @internal */
  private compose(context: CompositionContext): MaybePromise<ICompositionController> {
    // todo: when both component and template are empty
    //       should it throw or try it best to proceed?
    //       current: proceed
    const {
      _template: template,
      _component: component,
      _model: model
    } = context.change;
    const {
      _container: container,
      $controller,
      _location: loc,
      _instruction
    } = this;
    const vmDef = this._getDefinition(this._hydrationContext.controller.container, component);
    const childCtn: IContainer = container.createChild();

    const compositionHost = this._platform.document.createElement(vmDef == null ? this.tag ?? 'div' : vmDef.name);

    loc.parentNode!.insertBefore(compositionHost, loc);

    let compositionLocation: IRenderLocation | null;
    if (vmDef == null) {
      compositionLocation = this.tag == null ? convertToRenderLocation(compositionHost) : null;
    } else {
      compositionLocation = vmDef.containerless ? convertToRenderLocation(compositionHost) : null;
    }

    const removeCompositionHost = () => {
      compositionHost.remove();
      if (compositionLocation != null) {
        let curr = compositionLocation.$start!.nextSibling;
        let next: ChildNode | null = null;
        while (curr !== null && curr !== compositionLocation) {
          next = curr.nextSibling;
          curr.remove();
          curr = next;
        }
        compositionLocation.$start?.remove();
        compositionLocation.remove();
      }
    };

    const comp = this._createComponentInstance(
      childCtn,
      typeof component === 'string' ? vmDef!.Type : component,
      compositionHost,
      compositionLocation
    );
    const compose: () => ICompositionController = () => {
      const aucomposeCapturedAttrs = _instruction.captures! ?? emptyArray;
      // custom element based composition
      if (vmDef !== null) {
        const capture = vmDef.capture;
        const [capturedBindingAttrs, transferedToHostBindingAttrs] = aucomposeCapturedAttrs
          .reduce((attrGroups: [AttrSyntax[], AttrSyntax[]], attr) => {
            const shouldCapture = !(attr.target in vmDef.bindables)
              && (capture === true
                || isFunction(capture) && !!capture(attr.target));
            attrGroups[shouldCapture ? 0 : 1].push(attr);
            return attrGroups;
          }, [[], []]);

        const controller = Controller.$el(
          childCtn,
          comp,
          compositionHost,
          {
            projections: _instruction.projections,
            captures: capturedBindingAttrs
          },
          vmDef,
          compositionLocation
        );
        // Theoretically these bindings aren't bindings of the composed custom element
        // Though they are meant to be activated (bound)/ deactivated (unbound) together
        // with the custom element controller, so it's practically ok to let the composed
        // custom element manage these bindings
        this._createSpreadBindings(compositionHost, vmDef, transferedToHostBindingAttrs).forEach(b => controller.addBinding(b));

        return new CompositionController(
          controller,
          (attachInitiator) => controller.activate(attachInitiator ?? controller, $controller, $controller.scope.parent!),
          // todo: call deactivate on the component component
          (deactachInitiator) => finalizeCompositionDeactivation(
            () => controller.deactivate(deactachInitiator ?? controller, $controller),
            removeCompositionHost,
          ),
          // casting is technically incorrect
          // but it's ignored in the caller anyway
          (model) => comp.activate?.(model),
          context,
        );
      } else {
        const targetDef = CustomElementDefinition.create({
          name: CustomElement.generateName(),
          template: template,
        });
        const compiledDef = this._rendering.compile(targetDef, childCtn);
        const viewFactory = this._rendering.getViewFactory(compiledDef, childCtn);
        const controller = Controller.$view(
          viewFactory,
          $controller,
          compositionHost,
        );
        const scope = this.scopeBehavior === 'auto'
          ? Scope.fromParent(this.parent.scope, comp)
          : Scope.create(comp);

        controller.setHost(compositionHost);
        if (compositionLocation == null) {
          // only spread the bindings if there is an actual host
          // otherwise we may accidentally do unnecessary work
          this._createSpreadBindings(compositionHost, viewFactory.def, aucomposeCapturedAttrs).forEach(b => controller.addBinding(b));
        } else {
          controller.setLocation(compositionLocation);
        }

        return new CompositionController(
          controller,
          (attachInitiator) => controller.activate(attachInitiator ?? controller, $controller, scope),
          // todo: call deactivate on the component
          // a difference with composing custom element is that we leave render location/host alone
          // as they all share the same host/render location
          (detachInitiator) => finalizeCompositionDeactivation(
            () => controller.deactivate(detachInitiator ?? controller, $controller),
            removeCompositionHost,
          ),
          // casting is technically incorrect
          // but it's ignored in the caller anyway
          (model) => comp.activate?.(model),
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
  private _createComponentInstance(
    container: IContainer,
    comp: Constructable | object | undefined,
    host: HTMLElement | IRenderLocation,
    location: IRenderLocation | null,
  ): IDynamicComponentActivate<unknown> {
    if (comp == null) {
      return new EmptyComponent();
    }
    if (typeof comp === 'object') {
      return comp;
    }

    const p = this._platform;
    registerHostNode(container, host, p);
    registerResolver(
      container,
      IRenderLocation,
      new InstanceProvider('IRenderLocation', location)
    );

    const instance = container.invoke(comp);
    registerResolver(container, comp, new InstanceProvider('au-compose.component', instance));

    return instance;
  }

  /** @internal */
  private _getDefinition(container: IContainer, component?: string | object | Constructable) {
    if (typeof component === 'string') {
      const def = CustomElement.find(container, component);
      if (def == null) {
        throw createMappedError(ErrorNames.au_compose_component_name_not_found, component);
      }
      return def;
    }

    const Ctor = (isFunction(component)
      ? component
      : component?.constructor) as Constructable;
    return CustomElement.isType(Ctor, void 0)
      ? CustomElement.getDefinition(Ctor, null)
      : null;
  }

  /** @internal */
  private _createSpreadBindings(host: HTMLElement, def: CustomElementDefinition, capturedAttrs: AttrSyntax[]) {
    const transferHydrationContext = new HydrationContext(
      this.$controller,
      { projections: null, captures: capturedAttrs },
      this._hydrationContext.parent
    );
    return SpreadBinding.create(
      transferHydrationContext,
      host,
      def,
      this._rendering,
      this._compiler,
      this._platform,
      this._exprParser,
      this._observerLocator,
    );
  }
}

function finalizeCompositionDeactivation(
  deactivate: () => void | Promise<void>,
  cleanup: () => void,
): void | Promise<void> {
  // AuCompose owns the dynamic host outside the composed Controller's node
  // sequence and releases it when that controller deactivates successfully.
  return onResolve(deactivate(), cleanup);
}

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
  update(model: unknown): unknown;
}

class CompositionContextFactory {
  private id = 0;

  public _isCurrent(context: CompositionContext): boolean {
    return context.id === this.id;
  }

  public create(changes: ChangeInfo): MaybePromise<CompositionContext> {
    // Reserve recency before awaiting component/template loads. Otherwise a
    // slow earlier request could receive the newest id when it resolves late.
    const id = ++this.id;
    return onResolve(changes.load(), (loaded) => new CompositionContext(id, loaded));
  }

  // simplify increasing the id will invalidate all previously created context
  public invalidate(): void {
    this.id++;
  }
}

class ChangeInfo {
  public constructor(
    public _template: MaybePromise<string> | undefined,
    public _component: MaybePromise<string | Constructable | object> | undefined,
    public _model: unknown,
    public _src: ChangeSource | undefined,
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
    public readonly _component: string | Constructable | object | undefined,
    public readonly _model: unknown,
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
    public readonly update: (model: unknown) => unknown,
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
        // Even a never-started stale composition has already inserted its host;
        // run stop so host/render-location cleanup is not skipped.
        this.state = -1;
        return this.stop(detachInitator);
    }
  }
}
