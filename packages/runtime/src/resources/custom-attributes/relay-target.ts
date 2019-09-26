import { IContainer } from '@aurelia/kernel';
import { IHydrateElementInstruction, ITargetedInstruction } from '../../definitions';
import { IDOM, INode } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IRenderContext } from '../../lifecycle';
import { IRenderer } from '../../rendering-engine';
import { customAttribute } from '../custom-attribute';

@customAttribute('relay-target')
export class RelayTarget {

  public $controller?: IController;

  constructor(
    @INode private readonly el: INode,
    @IController private readonly parentController: IController,
    @IRenderer private readonly renderer: IRenderer,
    @IContainer private readonly container: IContainer,
    @IDOM private dom: IDOM,
    @IHydrateElementInstruction private readonly elementInstruction: IHydrateElementInstruction,
  ) {
  }

  public binding(): void {
    const renderer = this.renderer;
    const instructionRenderers = renderer.instructionRenderers;
    const context = this.container as unknown as IRenderContext<INode>;

    const elementInstruction = this.elementInstruction;
    const renderable = this.parentController.parent!;
    if (renderable == null) {
      return;
    }
    const target = this.el;
    const dom = this.dom;

    const instructions: ITargetedInstruction[] = elementInstruction.transferBindings;
    let current: ITargetedInstruction;
    for (let i = 0, ii = instructions.length; i < ii; ++i) {
      current = instructions[i];
      instructionRenderers[current.type](LifecycleFlags.none, dom, context, renderable, target, current, renderable.scopeParts);
    }
  }
}
