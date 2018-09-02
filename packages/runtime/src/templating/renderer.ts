import { Immutable } from '@aurelia/kernel';
import { Binding } from '../binding/binding';
import { BindingMode } from '../binding/binding-mode';
import { Call } from '../binding/call';
import { IEventManager } from '../binding/event-manager';
import { BindingType, IExpressionParser } from '../binding/expression-parser';
import { Listener } from '../binding/listener';
import { IObserverLocator } from '../binding/observer-locator';
import { Ref } from '../binding/ref';
import { DOM, INode } from '../dom';
import { CustomAttributeResource, ICustomAttribute } from './custom-attribute';
import { CustomElementResource, ICustomElement } from './custom-element';
import {
  ICallBindingInstruction,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateTemplateController,
  IListenerBindingInstruction,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  IRenderStrategyInstruction,
  ISetAttributeInstruction,
  ISetPropertyInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  TemplatePartDefinitions
} from './instructions';
import { IRenderContext } from './render-context';
import { IRenderStrategy, RenderStrategyResource } from './render-strategy';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';

export interface IRenderer {
  render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void;
}

/* @internal */
export class Renderer implements IRenderer {
  constructor(
    private context: IRenderContext,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private renderingEngine: IRenderingEngine
  ) {}

  public render(renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        (this[current.type] as any)(renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        (this[current.type] as any)(renderable, host, current, parts);
      }
    }
  }

  public hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement) {
    let childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine, target, instruction);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      const currentType = current.type;
      let realTarget;

      if (currentType === TargetedInstructionType.stylePropertyBinding || currentType === TargetedInstructionType.listenerBinding) {
        realTarget = target;
      } else {
        realTarget = component;
      }

      ((<any>this)[currentType] as any)(renderable, realTarget, current);
    }

    renderable.$bindables.push(component);
    renderable.$attachables.push(component);
  }

  public [TargetedInstructionType.textBinding](renderable: IRenderable, target: any, instruction: Immutable<ITextBindingInstruction>) {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.Interpolation), next, 'textContent', BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.propertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IPropertyBindingInstruction>) {
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.IsPropertyCommand | instruction.mode), target, instruction.dest, instruction.mode, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.listenerBinding](renderable: IRenderable, target: any, instruction: Immutable<IListenerBindingInstruction>) {
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Listener(instruction.dest, instruction.strategy, srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta)), target, instruction.preventDefault, this.eventManager, this.context));
  }

  public [TargetedInstructionType.callBinding](renderable: IRenderable, target: any, instruction: Immutable<ICallBindingInstruction>) {
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Call(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.CallCommand), target, instruction.dest, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.refBinding](renderable: IRenderable, target: any, instruction: Immutable<IRefBindingInstruction>) {
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Ref(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.IsRef), target, this.context));
  }

  public [TargetedInstructionType.stylePropertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IStylePropertyBindingInstruction>) {
    const srcOrExpr = instruction.srcOrExpr as any;
    renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, BindingType.IsPropertyCommand | BindingMode.toView), (<any>target).style, instruction.dest, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.setProperty](renderable: IRenderable, target: any, instruction: Immutable<ISetPropertyInstruction>) {
    target[instruction.dest] = instruction.value;
  }

  public [TargetedInstructionType.setAttribute](renderable: IRenderable, target: any, instruction: Immutable<ISetAttributeInstruction>) {
    DOM.setAttribute(target, instruction.dest, instruction.value);
  }

  public [TargetedInstructionType.hydrateElement](renderable: IRenderable, target: any, instruction: Immutable<IHydrateElementInstruction>) {
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);    const component = context.get<ICustomElement>(CustomElementResource.keyFrom(instruction.res));

    this.hydrateElementInstance(renderable, target, instruction, component);
    operation.dispose();
  }

  public [TargetedInstructionType.hydrateAttribute](renderable: IRenderable, target: any, instruction: Immutable<IHydrateAttributeInstruction>) {
    const childInstructions = instruction.instructions;
    const context = this.context;

    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(CustomAttributeResource.keyFrom(instruction.res));
    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this[current.type] as any)(renderable, component, current);
    }

    renderable.$bindables.push(component);
    renderable.$attachables.push(component);

    operation.dispose();
  }

  public [TargetedInstructionType.hydrateTemplateController](renderable: IRenderable, target: any, instruction: Immutable<IHydrateTemplateController>, parts?: TemplatePartDefinitions) {
    const childInstructions = instruction.instructions;
    const factory = this.renderingEngine.getViewFactory(this.context, instruction.src);
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);

    const component = context.get<ICustomAttribute>(CustomAttributeResource.keyFrom(instruction.res));
    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as any).link(renderable.$attachables[renderable.$attachables.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this[current.type] as any)(renderable, component, current);
    }

    renderable.$bindables.push(component);
    renderable.$attachables.push(component);

    operation.dispose();
  }

  public [TargetedInstructionType.renderStrategy](renderable: IRenderable, target: any, instruction: Immutable<IRenderStrategyInstruction>): void {
    const strategyName = instruction.name;
    if (this[strategyName] === undefined) {
      const strategy = this.context.get(RenderStrategyResource.keyFrom(strategyName)) as IRenderStrategy;
      if (strategy === null || strategy === undefined) {
        throw new Error(`Unknown renderStrategy "${strategyName}"`);
      }
      this[strategyName] = strategy.render.bind(strategy);
    }
    this[strategyName](renderable, target, instruction);
  }
}
