import { Constructable, Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
import { INode, IRenderLocation } from '../../dom';
import { createElement } from '../create-element';
import { customElement, ICustomElement } from '../custom-element';
import { IHydrateElementInstruction, ITargetedInstruction } from '../instructions';
import { IRenderContext } from '../render-context';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IView } from '../view';

const composeSource = {
  name: 'au-compose',
  templateOrNode: null,
  instructions: null
};

const composeProps = ['component', 'isComposing'];

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, INode, ITargetedInstruction, IRenderingEngine, IRenderLocation)
export class Compose {
  public component: any;
  public composing: boolean;

  private task: CompositionTask = null;
  private currentView: IView = null;
  private content: INode = null;
  private compositionContext: IRenderContext;
  private encapsulationSource: INode;

  constructor(
    private renderable: IRenderable,
    private host: INode,
    private instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine,
    private location: IRenderLocation
  ) {
    this.compositionContext = renderable.$context;
  }

  public attaching(encapsulationSource: INode): void {
    this.encapsulationSource = encapsulationSource;
  }

  /** @internal */
  public compose(component: Constructable): void {
    const protoRenderable = createElement(
      component,
      this.instruction.instructions
        .filter((x: any) => !composeProps.includes(x.dest))
        .reduce((acc, item: any) => {
          if (item.dest) {
            acc[item.dest] = item;
          }

          return acc;
        }, {}), // TODO: implement this in the actual createElement function
      this.content.childNodes // TODO: get the content
    );

    const view = protoRenderable.createView(
      this.renderingEngine,
      this.compositionContext
    );

    this.swap(view);
    this.composing = false;
  }

  /** @internal */
  public componentChanged(newComponent: any): void {
    if (!newComponent) {
      this.clear();
    } else {
      if (this.task) {
        this.task.cancel();
      }

      this.task = new CompositionTask(this);
      this.task.start(newComponent);
    }
  }

  private swap(newView: IView): void {
    this.clear();

    newView.onRender = view => view.$nodes.insertBefore(this.location);

    this.currentView = newView;
    this.$bindables.push(newView); // it's going to get the wrong scope ;(
    this.$attachables.push(newView);

    if (this.$isBound) {
      newView.$bind(BindingFlags.fromBind, this.renderable.$scope);
    }

    if (this.$isAttached) {
      newView.$attach(this.encapsulationSource);
    }
  }

  private clear(): void {
    if (this.currentView) {
      const bindableIndex = this.$bindables.indexOf(this.currentView);
      if (bindableIndex !== -1) {
        this.$bindables.splice(bindableIndex, 1);
      }

      const attachableIndex = this.$attachables.indexOf(this.currentView);
      if (attachableIndex !== -1) {
        this.$attachables.splice(attachableIndex, 1);
      }

      this.currentView.$detach();
      this.currentView.$unbind(BindingFlags.fromUnbind);
    }
  }
}

class CompositionTask {
  private isCancelled: boolean = false;

  constructor(private compose: Compose) {}

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

    this.compose.compose(toBeComposed);
  }
}
