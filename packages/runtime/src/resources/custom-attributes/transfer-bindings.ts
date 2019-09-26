import { IContainer } from '@aurelia/kernel';
import { IHydrateElementInstruction, ITargetedInstruction } from '../../definitions';
import { IDOM, INode } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IRenderContext } from '../../lifecycle';
import { IRenderer } from '../../rendering-engine';
import { customAttribute } from '../custom-attribute';
import { ICustomElementInstanceData } from '../custom-element';

@customAttribute('transfer-bindings')
export class TransferBindings {

  public $controller?: IController;

  constructor(
    @INode private readonly el: INode,
    @ICustomElementInstanceData private parentCustomElement: ICustomElementInstanceData
  ) {
  }

  public created(): void {

    const customElementData = this.parentCustomElement;
    const sourceController = customElementData.parentController;
    if (sourceController == null) {
      // inside root template
      // there's no parent
      // bails
      return;
    }
    const context = sourceController.context! as IRenderContext<INode>;
    const target = this.el;
    const dom = context.get(IDOM);
    const renderer = context.get(IRenderer);
    const instructionRenderers = renderer.instructionRenderers;

    const instructions: ITargetedInstruction[] = customElementData.instruction.transferBindings;
    let current: ITargetedInstruction;
    for (let i = 0, ii = instructions.length; i < ii; ++i) {
      current = instructions[i];
      instructionRenderers[current.type](LifecycleFlags.none, dom, context, sourceController, target, current, sourceController.scopeParts);
    }
  }
}
