import { Constructable, Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
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
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IView, IViewFactory } from '../view';

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
  @bindable public subject: any = null;
  @bindable public composing: boolean = false;

  private task: CompositionTask = null;
  private currentView: IView = null;
  private properties: Record<string, TargetedInstruction> = null;

  constructor(
    private renderable: IRenderable,
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine
  ) {
    this.properties = instruction.instructions
      .filter((x: any) => !composeProps.includes(x.dest))
      .reduce((acc, item: any) => {
        if (item.dest) {
          acc[item.dest] = item;
        }

        return acc;
      }, {});
  }

  /** @internal */
  public subjectChanged(newValue: any): void {
    this.startComposition(newValue, BindingFlags.fromBindableHandler);
  }

  /** @internal */
  public bound(): void {
    this.startComposition(this.subject, BindingFlags.fromBind);
  }

  /** @internal */
  public endComposition(subject: Subject, flags: BindingFlags): void {
    const view = this.provideViewFor(subject);

    this.clear();

    if (view) {
      view.onRender = () => view.$nodes.insertBefore(this.$projector.host);
      view.lockScope(this.renderable.$scope);

      this.currentView = view;
      this.$addChild(view, flags);
    }

    this.composing = false;
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

  private startComposition(subject: any, flags: BindingFlags): void {
    if (this.task) {
      this.task.cancel();
    }

    this.task = new CompositionTask(this, flags);
    this.task.start(subject);
  }

  private clear(): void {
    if (this.currentView) {
      this.$removeChild(this.currentView);
      this.currentView = null;
    }
  }
}

class CompositionTask {
  private isCancelled: boolean = false;

  constructor(private compose: Compose, private flags: BindingFlags) {}

  public start(subject: any): void {
    if (this.isCancelled) {
      return;
    }

    this.compose.composing = true;

    if (subject instanceof Promise) {
      subject.then(x => this.complete(x));
    } else {
      this.complete(subject);
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    this.compose.composing = false;
  }

  private complete(subject: any): void {
    if (this.isCancelled) {
      return;
    }

    this.compose.endComposition(subject, this.flags);
  }
}
