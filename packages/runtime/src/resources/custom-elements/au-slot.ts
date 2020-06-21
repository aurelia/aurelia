import {
  PartialCustomElementDefinition,
  customElement,
} from '../custom-element';
import {
  INode,
  IDOM,
  IRenderLocation,
} from '../../dom';
import { ICustomElementViewModel } from '../../lifecycle';
import { bindable } from '../../templating/bindable';
import { BindingMode } from '../../flags';
import {
  IHydrateElementInstruction,
  ITargetedInstruction,
} from '../../definitions';
import { DI } from '@aurelia/kernel';

@customElement({ name: 'au-slot', containerless: true })
export class AuSlot<T extends INode = Node> implements ICustomElementViewModel<T> {
  @bindable({ mode: BindingMode.oneTime }) public readonly name!: string;

  public constructor(
    @IDOM private readonly dom: IDOM<T>,
    @ITargetedInstruction instruction: IHydrateElementInstruction,
    // @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
    @IProjections projections: IProjections,
  ) {
    // TODO: Then filter the named projection by looking up the instructions
    console.log(instruction);
    // console.log(factory);
    console.log(location);
  }

  public beforeBind() {
    console.log(`name: ${this.name}`);
  }
}

export type IProjections = Record<string, PartialCustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections").noDefault();
