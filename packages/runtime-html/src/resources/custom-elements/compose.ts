import { Constructable, Immutable, inject, IRegistry } from '@aurelia/kernel';
import {
  bindable,
  CompositionCoordinator,
  customElement,
  ICustomElement,
  IDOM,
  IHydrateElementInstruction,
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

type Subject = IViewFactory | IView | RenderPlan | Constructable | TemplateDefinition;

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IDOM, IRenderable, ITargetedInstruction, IRenderingEngine, CompositionCoordinator)
export class Compose {
  public static register: IRegistry['register'];

  @bindable public subject: Subject | Promise<Subject> | null;
  @bindable public composing: boolean;

  private dom: IDOM;
  private coordinator: CompositionCoordinator;
  private lastSubject: Subject | Promise<Subject> | null;
  private properties: Record<string, TargetedInstruction>;
  private renderable: IRenderable;
  private renderingEngine: IRenderingEngine;

  constructor(dom: IDOM, renderable: IRenderable, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine, coordinator: CompositionCoordinator) {
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
      .filter((x: ITargetedInstruction & {to?: string}) => !composeProps.includes(x.to as string))
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

  public subjectChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void {
    this.startComposition(newValue, previousValue, flags);
  }

  private startComposition(subject: Subject | Promise<Subject> | null, _previousSubject: Subject | Promise<Subject> | null, flags: LifecycleFlags): void {
    if (this.lastSubject === subject) {
      return;
    }

    this.lastSubject = subject;

    if (subject instanceof Promise) {
      subject = subject.then(x => this.resolveView(x, flags)) as Promise<IView> | null;
    } else {
      subject = this.resolveView(subject, flags);
    }

    this.composing = true;
    this.coordinator.compose(subject as IView | Promise<IView>, flags);
  }

  private resolveView(subject: Subject | null, flags: LifecycleFlags): IView | null {
    const view = this.provideViewFor(subject);

    if (view) {
      view.hold(this.$projector.host, flags);
      view.lockScope(this.renderable.$scope);
      return view;
    }

    return null;
  }

  private provideViewFor(subject: Subject | null): IView | null {
    if (!subject) {
      return null;
    }

    if ('lockScope' in subject) { // IView
      return subject;
    }

    if ('createView' in subject) { // RenderPlan
      return subject.createView(
        this.renderingEngine,
        this.renderable.$context
      );
    }

    if ('create' in subject) { // IViewFactory
      return subject.create();
    }

    if ('template' in subject) { // Raw Template Definition
      return this.renderingEngine.getViewFactory(
        this.dom,
        subject,
        this.renderable.$context
      ).create();
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.dom,
      subject,
      this.properties,
      this.$projector.children
    ).createView(
      this.renderingEngine,
      this.renderable.$context
    );
  }
}
