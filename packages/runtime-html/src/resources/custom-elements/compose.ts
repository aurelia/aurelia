import { Constructable, Immutable, InjectArray, IRegistry } from '@aurelia/kernel';
import {
  bindable,
  CompositionCoordinator,
  CustomElementResource,
  ICustomElement,
  ICustomElementResource,
  IDOM,
  IHydrateElementInstruction,
  INode,
  IRenderable,
  IRenderingEngine,
  ITargetedInstruction,
  ITemplateDefinition,
  IView,
  IViewFactory,
  LifecycleFlags,
  TargetedInstruction,
  TemplateDefinition
} from '@aurelia/runtime';
import { createElement, RenderPlan } from '../../create-element';

const composeSource: ITemplateDefinition = {
  name: 'au-compose',
  containerless: true
};

const composeProps = ['subject', 'composing'];

export type Subject<T extends INode = Node> = IViewFactory<T> | IView<T> | RenderPlan<T> | Constructable | TemplateDefinition;
export type MaybeSubjectPromise<T> = Subject<T> | Promise<Subject<T>> | null;

export interface Compose<T extends INode = Node> extends ICustomElement<T> {}
export class Compose<T extends INode = Node> implements Compose<T> {
  public static readonly inject: InjectArray = [IDOM, IRenderable, ITargetedInstruction, IRenderingEngine, CompositionCoordinator];

  public static readonly register: IRegistry['register'];
  public static readonly kind: ICustomElementResource<Node>;
  public static readonly description: TemplateDefinition;
  public static readonly containerless: TemplateDefinition['containerless'];
  public static readonly shadowOptions: TemplateDefinition['shadowOptions'];
  public static readonly bindables: TemplateDefinition['bindables'];

  @bindable public subject: MaybeSubjectPromise<T>;
  @bindable public composing: boolean;

  private readonly dom: IDOM;
  private readonly coordinator: CompositionCoordinator;
  private readonly properties: Record<string, TargetedInstruction>;
  private readonly renderable: IRenderable<T>;
  private readonly renderingEngine: IRenderingEngine;
  private lastSubject: MaybeSubjectPromise<T>;

  constructor(
    dom: IDOM<T>,
    renderable: IRenderable<T>,
    instruction: Immutable<IHydrateElementInstruction>,
    renderingEngine: IRenderingEngine,
    coordinator: CompositionCoordinator
  ) {
    this.dom = dom;
    this.subject = null;
    this.composing = false;

    this.coordinator = coordinator;
    this.lastSubject = null;
    this.renderable = renderable;
    this.renderingEngine = renderingEngine;

    this.coordinator.onSwapComplete = () => {
      this.composing = false;
    };

    this.properties = instruction.instructions
      .filter((x: ITargetedInstruction & {to?: string}) => !composeProps.includes(x.to))
      .reduce(
        (acc, item: ITargetedInstruction & {to?: string}) => {
          if (item.to) {
            acc[item.to] = item;
          }

          return acc;
        },
        {}
      );
  }

  public binding(flags: LifecycleFlags): void {
    this.startComposition(this.subject, null, flags);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(flags: LifecycleFlags): void {
    this.coordinator.attaching(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.coordinator.detaching(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.lastSubject = null;
    this.coordinator.unbinding(flags);
  }

  public caching(flags: LifecycleFlags): void {
    this.coordinator.caching(flags);
  }

  public subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void {
    this.startComposition(newValue, previousValue, flags);
  }

  private startComposition(subject: MaybeSubjectPromise<T>, _previousSubject: MaybeSubjectPromise<T>, flags: LifecycleFlags): void {
    if (this.lastSubject === subject) {
      return;
    }

    this.lastSubject = subject;

    if (subject instanceof Promise) {
      subject = subject.then(x => this.resolveView(x, flags));
    } else {
      subject = this.resolveView(subject, flags);
    }

    this.composing = true;
    this.coordinator.compose(subject as IView<T> | Promise<IView<T>>, flags);
  }

  private resolveView(subject: Subject<T> | null, flags: LifecycleFlags): IView<T> | null {
    const view = this.provideViewFor(subject, flags);

    if (view) {
      view.hold(this.$projector.host);
      view.lockScope(this.renderable.$scope);
      return view;
    }

    return null;
  }

  private provideViewFor(subject: Subject<T> | null, flags: LifecycleFlags): IView<T> | null {
    if (!subject) {
      return null;
    }

    if ('lockScope' in subject) { // IView
      return subject;
    }

    if ('createView' in subject) { // RenderPlan
      return subject.createView(
        flags,
        this.renderingEngine,
        this.renderable.$context
      ) as IView<T>;
    }

    if ('create' in subject) { // IViewFactory
      return subject.create();
    }

    if ('template' in subject) { // Raw Template Definition
      return this.renderingEngine.getViewFactory(
        this.dom,
        subject,
        this.renderable.$context
      ).create() as IView<T>;
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.dom,
      subject,
      this.properties,
      this.$projector.children
    ).createView(
      flags,
      this.renderingEngine,
      this.renderable.$context
    ) as IView<T>;
  }
}
CustomElementResource.define(composeSource, Compose);
