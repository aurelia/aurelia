import { Constructable, Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
import { INode } from '../../dom';
import { bindable } from '../bindable';
import { createElement, PotentialRenderable } from '../create-element';
import { customElement, ICustomElement } from '../custom-element';
import {
  IHydrateElementInstruction,
  ITargetedInstruction,
  ITemplateSource,
  TargetedInstruction,
  TemplateDefinition
} from '../instructions';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';

const composeSource: ITemplateSource = {
  name: 'au-compose',
  containerless: true
};

const composeProps = ['subject', 'composing'];

type Subject = IViewFactory | IView | PotentialRenderable | Constructable | TemplateDefinition;

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, ITargetedInstruction, IRenderingEngine)
export class Compose {
  @bindable public subject: Subject | Promise<Subject> = null;
  @bindable public composing: boolean = false;

  private properties: Record<string, TargetedInstruction> = null;
  private coordinator: CompositionCoordinator;
  private lastSubject: Subject | Promise<Subject> = null;

  constructor(
    private renderable: IRenderable,
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine
  ) {
    this.coordinator = new CompositionCoordinator();
    this.coordinator.onSwapComplete = () => {
      this.composing = false;
    };

    this.properties = instruction.instructions
      .filter((x: any) => !composeProps.includes(x.dest))
      .reduce((acc, item: any) => {
        if (item.dest) {
          acc[item.dest] = item;
        }

        return acc;
      }, {});
  }

  public binding(flags: BindingFlags): void {
    this.startComposition(this.subject);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    this.coordinator.attaching(encapsulationSource, lifecycle);
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    this.coordinator.detaching(lifecycle);
  }

  public unbinding(flags: BindingFlags): void {
    this.lastSubject = null;
    this.coordinator.unbinding(flags);
  }

  public caching(): void {
    this.coordinator.caching();
  }

  public subjectChanged(newValue: any): void {
    this.startComposition(newValue);
  }

  private startComposition(subject: any): void {
    if (this.lastSubject === subject) {
      return;
    }

    this.lastSubject = subject;

    if (subject instanceof Promise) {
      subject = subject.then(x => this.resolveView(x));
    } else {
      subject = this.resolveView(subject);
    }

    this.composing = true;
    this.coordinator.compose(subject);
  }

  private resolveView(subject: Subject): IView {
    const view = this.provideViewFor(subject);

    if (view) {
      view.mount(this.$projector.host);
      view.lockScope(this.renderable.$scope);
      return view;
    }

    return null;
  }

  private provideViewFor(subject: Subject): IView | null {
    if (!subject) {
      return null;
    }

    if ('templateOrNode' in subject) { // Raw Template Definition
      return this.renderingEngine.getViewFactory(
        subject,
        this.renderable.$context
      ).create();
    }

    if ('create' in subject) { // IViewFactory
      return subject.create();
    }

    if ('createView' in subject) { // PotentialRenderable
      return subject.createView(
        this.renderingEngine,
        this.renderable.$context
      );
    }

    if ('lockScope' in subject) { // IView
      return subject;
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
