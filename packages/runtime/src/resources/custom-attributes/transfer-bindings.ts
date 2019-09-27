import {
  ICallBindingInstruction,
  IHydrateAttributeInstruction,
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  ISetPropertyInstruction,
  ITargetedInstruction
} from '../../definitions';
import { IDOM, INode } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { SetPropertyInstruction } from '../../instructions';
import { IRenderContext } from '../../lifecycle';
import { IRenderer } from '../../rendering-engine';
import { customAttribute } from '../custom-attribute';
import { IHydrateElementInstructionContext } from '../custom-element';

type ITransferableInstructionType =
  IInterpolationInstruction
  | IPropertyBindingInstruction
  | IIteratorBindingInstruction
  | ICallBindingInstruction
  | IRefBindingInstruction
  | ISetPropertyInstruction;


@customAttribute('transfer-bindings')
export class TransferBindings {

  constructor(
    @INode private readonly el: INode,
    @IHydrateElementInstructionContext private readonly hydrationContext: IHydrateElementInstructionContext,
    @ITargetedInstruction private readonly attrInstruction: IHydrateAttributeInstruction
  ) {
  }

  public created(): void {

    const hydrationContext = this.hydrationContext;
    const owningController = hydrationContext.owningController;
    if (owningController == null) {
      // inside root template
      // there's no parent
      // bails
      return;
    }
    const context = owningController.context! as IRenderContext<INode>;
    const target = this.el;
    const dom = context.get(IDOM);
    const renderer = context.get(IRenderer);

    const hydrationContextInstruction = hydrationContext.instruction;
    const tobeTransferredBindingInstructions = hydrationContextInstruction.transferBindings as ITransferableInstructionType[];
    const filterValue = (this.attrInstruction.instructions[0] as SetPropertyInstruction).value as string;

    let tobeRenderedInstructions: ITargetedInstruction[];
    if (filterValue === '') {
      tobeRenderedInstructions = tobeTransferredBindingInstructions;
    } else {
      const validPropertyNames = filterValue.split(',').map(part => part.trim());
      tobeRenderedInstructions = tobeTransferredBindingInstructions
        .filter(instruction => validPropertyNames.indexOf(instruction.to) !== -1);
    }

    renderer.renderInstructions(
      LifecycleFlags.none,
      dom,
      context,
      owningController,
      target,
      tobeRenderedInstructions,
      hydrationContextInstruction.parts
    );
  }
}
