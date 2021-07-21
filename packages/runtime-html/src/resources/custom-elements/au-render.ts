import { Constructable, nextId, onResolve } from '@aurelia/kernel';
import { BindingMode, LifecycleFlags } from '@aurelia/runtime';
import { createElement, RenderPlan } from '../../create-element.js';
import { HydrateElementInstruction, IInstruction, Instruction } from '../../renderer.js';
import { IPlatform } from '../../platform.js';
import { IViewFactory } from '../../templating/view.js';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element.js';
import { bindable } from '../../bindable.js';
import { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, IHydrationContext, ISyntheticView } from '../../templating/controller.js';
import { IRendering } from '../../templating/rendering.js';

export type Subject = string | IViewFactory | ISyntheticView | RenderPlan | Constructable | CustomElementDefinition;
export type MaybeSubjectPromise = Subject | Promise<Subject> | undefined;

function toLookup(
  acc: Record<string, IInstruction>,
  item: IInstruction & { to?: string },
): Record<string, IInstruction> {
  const to = item.to;
  if (to !== void 0 && to !== 'subject' && to !== 'composing') {
    acc[to] = item as Instruction;
  }

  return acc;
}

@customElement({ name: 'au-render', template: null, containerless: true })
export class AuRender implements ICustomElementViewModel {
  public readonly id: number = nextId('au$component');

  @bindable
  public component?: MaybeSubjectPromise = void 0;

  @bindable({ mode: BindingMode.fromView })
  public composing: boolean = false;

  public view?: ISyntheticView = void 0;

  private readonly _properties: Record<string, IInstruction>;
  private readonly _hdrContext: IHydrationContext;

  private lastSubject?: MaybeSubjectPromise = void 0;

  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  public constructor(
    @IPlatform private readonly p: IPlatform,
    @IInstruction instruction: HydrateElementInstruction,
    @IHydrationContext hdrContext: IHydrationContext,
    @IRendering private readonly r: IRendering,
  ) {
    this._properties = instruction.instructions.reduce(toLookup, {});
    this._hdrContext = hdrContext;
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { component, view } = this;
    if (view === void 0 || this.lastSubject !== component) {
      this.lastSubject = component;
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
    if (this.lastSubject === newValue) {
      return;
    }

    this.lastSubject = newValue;
    this.composing = true;

    flags |= $controller.flags;
    const ret = onResolve(
      this._deactivate(this.view, null, flags),
      () => {
        // TODO(fkleuver): handle & test race condition
        return this.compose(void 0, newValue, null, flags);
      },
    );
    if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
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

  private _deactivate(
    view: ISyntheticView | undefined,
    initiator: IHydratedController | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return view?.deactivate(initiator ?? view, this.$controller, flags);
  }

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

  private _resolveView(subject: Subject | undefined, flags: LifecycleFlags): ISyntheticView | undefined {
    const view = this._provideViewFor(subject, flags);

    if (view) {
      view.setLocation(this.$controller.location!);
      view.lockScope(this.$controller.scope);
      return view;
    }

    return void 0;
  }

  private _provideViewFor(comp: Subject | undefined, flags: LifecycleFlags): ISyntheticView | undefined {
    if (!comp) {
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
        return comp.create(flags);
      }

      if ('template' in comp) { // Raw Template Definition
        return this.r.getViewFactory(CustomElementDefinition.getOrCreate(comp), ctxContainer).create(flags);
      }
    }

    if (typeof comp === 'string') {
      const def = ctxContainer.find(CustomElement, comp);
      if (def == null) {
        throw new Error(`Unable to find custom element ${comp} for <au-render>.`);
      }
      comp = def.Type;
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.p,
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

function isController(subject: Exclude<Subject, string>): subject is ISyntheticView {
  return 'lockScope' in subject;
}
