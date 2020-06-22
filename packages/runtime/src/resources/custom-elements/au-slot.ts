import {
  DI,
} from '@aurelia/kernel';
import {
  IHydrateElementInstruction,
  ITargetedInstruction,
} from '../../definitions';
import {
  IDOM,
  INode,
  IRenderLocation,
} from '../../dom';
import {
  ICustomElementViewModel,
} from '../../lifecycle';
import {
  customElement,
  CustomElementDefinition,
} from '../custom-element';

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections").noDefault();

@customElement({ name: 'au-slot', containerless: true })
export class AuSlot<T extends INode = Node> implements ICustomElementViewModel<T> {
  private readonly name: string;
  private readonly definition: CustomElementDefinition;

  public constructor(
    @IDOM private readonly dom: IDOM<T>,
    @ITargetedInstruction instruction: IHydrateElementInstruction,
    @IRenderLocation private readonly location: IRenderLocation<T>,
    @IProjections projections: IProjections,
  ) {
    // console.log('instruction',instruction);
    const name = this.name = instruction.slotName!;
    console.log('slot name', name);
    console.log('fallback', instruction.projectionFallback);
    console.log('projections', projections);
    this.definition = projections[name] ?? instruction.projectionFallback;
    // consume the slot
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete projections[name];
    // console.log(location);
  }
}
