import { customElement, ICustomElement } from '../custom-element';
import { IRenderSlot, SwapOrder } from '../render-slot';
import { ITargetedInstruction, IHydrateElementInstruction, TargetedInstructionType } from '../instructions';
import { IViewOwner } from '../view';
import { INode, DOM } from '../../dom';
import { VisualWithCentralComponent } from '../visual';
import { IRenderContext } from '../render-context';
import { IRenderingEngine } from '../rendering-engine';
import { Immutable } from '../../../kernel/interfaces';
import { inject } from '../../../kernel/di';
import { BindingFlags } from '../../binding/binding';

const composeSource = {
  name: 'au-compose',
  template: null,
  instructions: null
};

const composeProps = ['component', 'swapOrder', 'isComposing'];

export interface Compose extends ICustomElement {}
@customElement(composeSource)
@inject(IViewOwner, INode, IRenderSlot, ITargetedInstruction, IRenderingEngine)
export class Compose { 
  private task: CompositionTask = null;
  private visual: VisualWithCentralComponent = null;
  private auContent: INode = null;
  private baseInstruction: Immutable<IHydrateElementInstruction>;
  private compositionContext: IRenderContext;

  component: any;
  swapOrder: SwapOrder;
  isComposing: boolean;

  constructor(
    private viewOwner: IViewOwner, 
    private host: INode, 
    private slot: IRenderSlot, 
    instruction: Immutable<IHydrateElementInstruction>,
    private renderingEngine: IRenderingEngine
  ) { 
    this.compositionContext = viewOwner.$context;
    this.baseInstruction = {
      type: TargetedInstructionType.hydrateElement,
      instructions: instruction.instructions.filter((x: any) => !composeProps.includes(x.dest)),
      res: null,
      parts: instruction.parts
    };
  }

  private componentChanged(toBeComposed: any) {
    if (this.visual !== null && this.visual.component === toBeComposed) {
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

  /** @internal */
  compose(toBeComposed: any) {
    const instruction = Object.assign({}, this.baseInstruction, {
      resource: toBeComposed,
      contentOverride: this.createContentElement()
    });

    return this.swap(this.renderingEngine.createVisualFromComponent(this.compositionContext, toBeComposed, instruction));
  }

  private createContentElement() {
    let auContent = this.auContent;
    let append = DOM.appendChild;

    if (auContent == null) {
      this.auContent = auContent = DOM.createElement('au-content');

      if (DOM.isUsingSlotEmulation(this.host)) {
        let nodes = this.$contentView.childNodes;

        for (let i = 0, ii = nodes.length; i < ii; ++i) {
          append(auContent, nodes[i]);
        }
      } else {
        let element = this.host;

        while(element.firstChild) {
          append(auContent, element.firstChild);
        }
      }
    }

    return DOM.cloneNode(auContent);
  }

  private swap(newVisual: VisualWithCentralComponent) {
    let index = this.$bindable.indexOf(this.visual);
    if (index !== -1) {
      this.$bindable.splice(index, 1);
    }

    this.visual = newVisual;
    this.$bindable.push(newVisual);

    if (this.$isBound) {
      newVisual.$bind(BindingFlags.none, this.viewOwner.$scope);
    }

    return this.slot.swap(newVisual, this.swapOrder || SwapOrder.after);
  }

  private clear() {
    this.slot.removeAll();
  }
}

class CompositionTask {
  private isCancelled = false;
  private composeResult = null;

  constructor(private compose: Compose) {}

  start(toBeComposed) {
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

  cancel() {
    this.compose.isComposing = false;
    this.isCancelled = true;
    return this.composeResult;
  }

  private render(toBeComposed: any) {
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
