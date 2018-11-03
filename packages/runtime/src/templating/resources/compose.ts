import { Constructable, Immutable, inject } from '@aurelia/kernel';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { createElement, RenderPlan } from '../create-element';
import { customElement } from '../custom-element';
import {
  IHydrateElementInstruction,
  ITargetedInstruction,
  ITemplateDefinition,
  TargetedInstruction,
  TemplateDefinition
} from '../definitions';
import { ICustomElement, IRenderable, IRenderingEngine } from '../lifecycle-render';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';

const composeSource: ITemplateDefinition = {
  name: 'au-compose',
  containerless: true
};

const composeProps = ['subject', 'composing'];

type Subject = IViewFactory | IView | RenderPlan | Constructable | TemplateDefinition;

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, ITargetedInstruction, IRenderingEngine, CompositionCoordinator)
export class Compose {
  @bindable public subject: Subject | Promise<Subject> = null;
  @bindable public composing: boolean = false;

  private properties: Record<string, TargetedInstruction> = null;
  private lastSubject: Subject | Promise<Subject> = null;

  constructor(
    private renderable: IRenderable,
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine,
    private coordinator: CompositionCoordinator
  ) {
    this.coordinator.onSwapComplete = () => {
      this.composing = false;
    };

    this.properties = instruction.instructions
      .filter((x: any) => !composeProps.includes(x.to))
      .reduce((acc, item: any) => {
        if (item.to) {
          acc[item.to] = item;
        }

        return acc;
      }, {});
  }

  public binding(flags: LifecycleFlags): void {
    this.startComposition(this.subject, undefined, flags);
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

  public subjectChanged(newValue: any, previousValue: any, flags: LifecycleFlags): void {
    this.startComposition(newValue, previousValue, flags);
  }

  private startComposition(subject: any, previousSubject: any, flags: LifecycleFlags): void {
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
    this.coordinator.compose(subject, flags);
  }

  private resolveView(subject: Subject, flags: LifecycleFlags): IView {
    const view = this.provideViewFor(subject);

    if (view) {
      view.hold(this.$projector.host, flags);
      view.lockScope(this.renderable.$scope);
      return view;
    }

    return null;
  }

  private provideViewFor(subject: Subject): IView | null {
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
        subject,
        this.renderable.$context
      ).create();
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      subject,
      this.properties,
      this.$projector.children
    ).createView(
      this.renderingEngine,
      this.renderable.$context
    );
  }
}
