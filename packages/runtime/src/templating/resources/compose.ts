import { Constructable, Immutable, inject, IRegistry } from '@aurelia/kernel';
import {
  IHydrateElementInstruction,
  ITargetedInstruction,
  ITemplateDefinition,
  TargetedInstruction,
  TemplateDefinition
} from '../../definitions';
import { CompositionCoordinator, IRenderable, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { createElement, RenderPlan } from '../create-element';
import { customElement, ICustomElement } from '../custom-element';
import { IRenderingEngine } from '../lifecycle-render';

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
  public static register: IRegistry['register'];

  @bindable public subject: Subject | Promise<Subject>;
  @bindable public composing: boolean;

  private coordinator: CompositionCoordinator;
  private lastSubject: Subject | Promise<Subject>;
  private properties: Record<string, TargetedInstruction>;
  private renderable: IRenderable;
  private renderingEngine: IRenderingEngine;

  constructor(renderable: IRenderable, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine, coordinator: CompositionCoordinator) {
    this.subject = null;
    this.composing = false;

    this.coordinator = coordinator;
    this.lastSubject = null;
    this.properties = null;
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

  public subjectChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void {
    this.startComposition(newValue, previousValue, flags);
  }

  private startComposition(subject: Subject | Promise<Subject>, _previousSubject: Subject | Promise<Subject>, flags: LifecycleFlags): void {
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
    this.coordinator.compose(subject as IView | Promise<IView>, flags);
  }

  private resolveView(subject: Subject, flags: LifecycleFlags): IView {
    const view = this.provideViewFor(subject);

    if (view) {
      // todo
      view.hold(this.$projector.host as any, flags);
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
      // todo
      this.$projector.children as any
    ).createView(
      this.renderingEngine,
      this.renderable.$context
    );
  }
}
