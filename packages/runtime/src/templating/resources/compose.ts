import { Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
import { bindable } from '../bindable';
import { createElement } from '../create-element';
import { customElement, ICustomElement } from '../custom-element';
import { IHydrateElementInstruction, ITargetedInstruction, ITemplateSource } from '../instructions';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IView } from '../view';

const composeSource: ITemplateSource = {
  name: 'au-compose',
  containerless: true
};

const composeProps = ['subject', 'composing'];

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, ITargetedInstruction, IRenderingEngine)
export class Compose {
  @bindable public subject: any = null;
  @bindable public composing: boolean = false;

  private task: CompositionTask = null;
  private currentView: IView = null;
  private properties: any = null;

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
  public endComposition(subject: any, flags: BindingFlags): void {
    let view: IView;

    if (subject.onRender && subject.lockScope) {
      view = subject;
    } else {
      const potential = createElement(
        subject,
        this.properties,
        this.$projector.children
      );

      view = potential.createView(
        this.renderingEngine,
        this.renderable.$context
      );
    }

    view.onRender = view => view.$nodes.insertBefore(this.$projector.host);
    view.lockScope(this.renderable.$scope);

    this.clear();
    this.currentView = view;
    this.$addChild(this.currentView, flags);

    this.composing = false;
  }

  private startComposition(subject: any, flags: BindingFlags): void {
    if (!subject) {
      this.clear();
    } else {
      if (this.task) {
        this.task.cancel();
      }

      this.task = new CompositionTask(this, flags);
      this.task.start(subject);
    }
  }

  private clear(): void {
    if (this.currentView) {
      this.$removeChild(this.currentView);
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
