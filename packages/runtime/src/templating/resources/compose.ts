import { Immutable, inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding/binding-flags';
import { DOM, INode } from '../../dom';
import { customElement, ICustomElement } from '../custom-element';
import { IHydrateElementInstruction, ITargetedInstruction, TargetedInstructionType } from '../instructions';
import { IRenderContext } from '../render-context';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { ViewWithCentralComponent } from '../view';
import { IViewSlot, SwapOrder } from '../view-slot';

const composeSource = {
  name: 'au-compose',
  templateOrNode: null,
  instructions: null
};

const composeProps = ['component', 'swapOrder', 'isComposing'];

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IRenderable, INode, IViewSlot, ITargetedInstruction, IRenderingEngine)
export class Compose {
  public component: any;
  public swapOrder: SwapOrder;
  public isComposing: boolean;

  private task: CompositionTask = null;
  private view: ViewWithCentralComponent = null;
  private content: INode = null;
  private baseInstruction: Immutable<IHydrateElementInstruction>;
  private compositionContext: IRenderContext;

  constructor(
    private renderable: IRenderable,
    private host: INode,
    private slot: IViewSlot,
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine
  ) {
    this.compositionContext = renderable.$context;
    this.baseInstruction = {
      type: TargetedInstructionType.hydrateElement,
      res: null,
      parts: instruction.parts,
      instructions: instruction.instructions
        .filter((x: any) => !composeProps.includes(x.dest))
    };
  }

  /** @internal */
  public compose(toBeComposed: any) {
    const instruction: Immutable<IHydrateElementInstruction> = {
      ...this.baseInstruction,
      res: toBeComposed,
      content: this.createContentElement()
    };

    const view = this.renderingEngine.createViewFromComponent(
      this.compositionContext,
      toBeComposed,
      instruction
    );

    return this.swap(view);
  }

  /** @internal */
  public componentChanged(toBeComposed: any): void {
    if (this.view !== null && this.view.component === toBeComposed) {
      return;
    }

    if (!toBeComposed) {
      this.clear();
    } else {
      const previousTask = this.task;
      const newTask = this.task = new CompositionTask(this);

      if (previousTask !== null) {
        const cancelResult = previousTask.cancel();

        if (cancelResult instanceof Promise) {
          cancelResult.then(() => newTask.start(toBeComposed));
          return;
        }
      }

      newTask.start(toBeComposed);
    }
  }

  private createContentElement(): INode {
    let content = this.content;

    if (content == null) {
      this.content = content = DOM.createElement('au-content');
      DOM.migrateChildNodes(this.host, content);
    }

    return DOM.cloneNode(content);
  }

  private swap(newView: ViewWithCentralComponent) {
    const index = this.$bindables.indexOf(this.view);
    if (index !== -1) {
      this.$bindables.splice(index, 1);
    }

    this.view = newView;
    this.$bindables.push(newView);

    if (this.$isBound) {
      newView.$bind(BindingFlags.fromBind, this.renderable.$scope);
    }

    return this.slot.swap(newView, this.swapOrder || SwapOrder.after);
  }

  private clear(): void {
    this.slot.removeAll();
  }
}

class CompositionTask {
  private isCancelled: boolean = false;
  private composeResult = null;

  constructor(private compose: Compose) {}

  public start(toBeComposed: any): void {
    if (this.isCancelled) {
      return;
    }

    this.compose.isComposing = true;

    if (toBeComposed instanceof Promise) {
      toBeComposed.then(x => this.render(x));
    } else {
      this.render(toBeComposed);
    }
  }

  public cancel() {
    this.compose.isComposing = false;
    this.isCancelled = true;
    return this.composeResult;
  }

  private render(toBeComposed: any): void {
    if (this.isCancelled) {
      return;
    }

    this.composeResult = this.compose.compose(toBeComposed);

    if (this.composeResult instanceof Promise) {
      this.composeResult = this.composeResult.then(() =>  this.compose.isComposing = false);
    } else {
      this.compose.isComposing = false;
      this.composeResult = null;
    }
  }
}
