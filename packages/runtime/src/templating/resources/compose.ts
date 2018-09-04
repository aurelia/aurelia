import { Constructable, Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
import { INode, IRenderLocation } from '../../dom';
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

const composeProps = ['component', 'composing'];

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, INode, ITargetedInstruction, IRenderingEngine, IRenderLocation)
export class Compose {
  @bindable public component: any;
  @bindable public composing: boolean;

  private task: CompositionTask = null;
  private currentView: IView = null;
  private childNodes: INode[] = null;
  private properties: any = null;

  constructor(
    private renderable: IRenderable,
    host: INode,
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine,
    private location: IRenderLocation
  ) {
    this.childNodes = Array.from(host.childNodes);
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
  public componentChanged(newValue: any): void {
    this.startComposition(newValue, BindingFlags.fromBindableHandler);
  }

  /** @internal */
  public bound(): void {
    this.startComposition(this.component, BindingFlags.fromBind);
  }

  /** @internal */
  public endComposition(component: Constructable, flags: BindingFlags): void {
    const potential = createElement(
      component,
      this.properties,
      this.childNodes
    );

    const view = potential.createView(
      this.renderingEngine,
      this.renderable.$context
    );

    view.onRender = view => view.$nodes.insertBefore(this.location);
    view.lockScope(this.renderable.$scope);

    this.clear();
    this.currentView = view;
    this.$addChild(this.currentView, flags);

    this.composing = false;
  }

  private startComposition(toBeComposed: any, flags: BindingFlags): void {
    if (!toBeComposed) {
      this.clear();
    } else {
      if (this.task) {
        this.task.cancel();
      }

      this.task = new CompositionTask(this, flags);
      this.task.start(toBeComposed);
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

  public start(toBeComposed: any): void {
    if (this.isCancelled) {
      return;
    }

    this.compose.composing = true;

    if (toBeComposed instanceof Promise) {
      toBeComposed.then(x => this.complete(x));
    } else {
      this.complete(toBeComposed);
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    this.compose.composing = false;
  }

  private complete(toBeComposed: any): void {
    if (this.isCancelled) {
      return;
    }

    this.compose.endComposition(toBeComposed, this.flags);
  }
}
