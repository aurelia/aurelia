import { Constructable, onResolve } from '@aurelia/kernel';
import { createElement, RenderPlan } from '../../create-element';
import { HydrateElementInstruction, IInstruction } from '../../renderer';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element';
import { bindable } from '../../bindable';
import { LifecycleFlags, ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, IHydrationContext, ISyntheticView } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { createError, isPromise, isString } from '../../utilities';
import { BindingMode } from '../../binding/interfaces-bindings';

export type Subject = string | IViewFactory | ISyntheticView | RenderPlan | Constructable | CustomElementDefinition;
export type MaybeSubjectPromise = Subject | Promise<Subject> | undefined;

function toLookup(
  acc: Record<string, IInstruction>,
  item: IInstruction & { to?: string },
): Record<string, IInstruction> {
  const to = item.to;
  if (to !== void 0 && to !== 'subject' && to !== 'composing') {
    acc[to] = item as IInstruction;
  }

  return acc;
}

export class AuRender implements ICustomElementViewModel {
  /** @internal */ protected static inject = [IPlatform, IInstruction, IHydrationContext, IRendering];

  @bindable
  public component?: MaybeSubjectPromise = void 0;

  @bindable({ mode: BindingMode.fromView })
  public composing: boolean = false;

  public view?: ISyntheticView = void 0;

  /** @internal */ private readonly _properties: Record<string, IInstruction>;

  /** @internal */ private _lastSubject?: MaybeSubjectPromise = void 0;

  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  public constructor(
    /** @internal */ private readonly _platform: IPlatform,
    /** @internal */ private readonly _instruction: HydrateElementInstruction,
    /** @internal */ private readonly _hdrContext: IHydrationContext,
    /** @internal */ private readonly _rendering: IRendering,
  ) {
    this._properties = _instruction.props.reduce(toLookup, {});
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { component, view } = this;
    if (view === void 0 || this._lastSubject !== component) {
      this._lastSubject = component;
      this.composing = true;

      return this.compose(void 0, component, initiator, flags);
    }

    return this.compose(view, component, initiator, flags);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this._deactivate(this.view, initiator, flags);
  }

  public componentChanged(
    newValue: Subject | Promise<Subject>,
    previousValue: Subject | Promise<Subject>,
    flags: LifecycleFlags,
  ): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    if (this._lastSubject === newValue) {
      return;
    }

    this._lastSubject = newValue;
    this.composing = true;

    flags |= $controller.flags;
    const ret = onResolve(
      this._deactivate(this.view, null, flags),
      () => {
        // TODO(fkleuver): handle & test race condition
        return this.compose(void 0, newValue, null, flags);
      },
    );
    if (isPromise(ret)) { ret.catch(err => { throw err; }); }
  }

  private compose(
    view: ISyntheticView | undefined | Promise<ISyntheticView | undefined>,
    subject: MaybeSubjectPromise,
    initiator: IHydratedController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return onResolve(
      view === void 0
        ? onResolve(subject, resolvedSubject => this._resolveView(resolvedSubject, flags))
        : view,
      resolvedView => this._activate(this.view = resolvedView, initiator, flags),
    );
  }

  /** @internal */
  private _deactivate(
    view: ISyntheticView | undefined,
    initiator: IHydratedController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return view?.deactivate(initiator ?? view, this.$controller, flags);
  }

  /** @internal */
  private _activate(
    view: ISyntheticView | undefined,
    initiator: IHydratedController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return onResolve(
      view?.activate(initiator ?? view, $controller, flags, $controller.scope),
      () => {
        this.composing = false;
      },
    );
  }

  /** @internal */
  private _resolveView(subject: Subject | undefined, flags: LifecycleFlags): ISyntheticView | undefined {
    const view = this._provideViewFor(subject, flags);

    if (view) {
      view.setLocation(this.$controller.location!);
      view.lockScope(this.$controller.scope);
      return view;
    }

    return void 0;
  }

  /** @internal */
  private _provideViewFor(comp: Subject | undefined, _flags: LifecycleFlags): ISyntheticView | undefined {
    if (comp == null) {
      return void 0;
    }

    const ctxContainer = this._hdrContext.controller.container;
    if (typeof comp === 'object') {
      if (isController(comp)) { // IController
        return comp;
      }

      if ('createView' in comp) { // RenderPlan
        return comp.createView(ctxContainer);
      }

      if ('create' in comp) { // IViewFactory
        return comp.create();
      }

      if ('template' in comp) { // Raw Template Definition
        return this._rendering.getViewFactory(CustomElementDefinition.getOrCreate(comp), ctxContainer).create();
      }
    }

    if (isString(comp)) {
      const def = ctxContainer.find(CustomElement, comp);
      if (def == null) {
        if (__DEV__)
          throw createError(`AUR0809: Unable to find custom element ${comp} for <au-render>.`);
        else
          throw createError(`AUR0809:${comp}`);
      }
      comp = def.Type;
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this._platform,
      comp,
      this._properties,
      this.$controller.host.childNodes,
    ).createView(ctxContainer);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

customElement({ name: 'au-render', template: null, containerless: true, capture: true })(AuRender);

function isController(subject: Exclude<Subject, string>): subject is ISyntheticView {
  return 'lockScope' in subject;
}
