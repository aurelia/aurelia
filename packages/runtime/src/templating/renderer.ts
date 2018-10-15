import { Immutable, Reporter } from '@aurelia/kernel';
import { Interpolation } from '../binding';
import { Binding } from '../binding/binding';
import { BindingMode } from '../binding/binding-mode';
import { Call } from '../binding/call';
import { IEventManager } from '../binding/event-manager';
import { BindingType, IExpressionParser } from '../binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from '../binding/interpolation-binding';
import { LetBinding } from '../binding/let-binding';
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
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  ILetElementInstruction,
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

// tslint:disable:function-name
// tslint:disable:no-any

/* @internal */
export class Renderer implements IRenderer {
  constructor(
    private context: IRenderContext,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private renderingEngine: IRenderingEngine
  ) { }

  public render(renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;

    if (targets.length !== targetInstructions.length) {
      if (targets.length > targetInstructions.length) {
        throw Reporter.error(30);
      } else {
        throw Reporter.error(31);
      }
    }
    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        (this as any)[current.type](renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        (this as any)[current.type](renderable, host, current, parts);
      }
    }
  }

  public hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void {
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine, target, instruction);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      const currentType = current.type;

      (this as any)[currentType](renderable, component, current);
    }

    renderable.$bindables.push(component);
    renderable.$attachables.push(component);
  }

  public [TargetedInstructionType.textBinding](renderable: IRenderable, target: any, instruction: Immutable<ITextBindingInstruction>): void {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    const from = instruction.from as any;
    const expr = (from.$kind ? from : this.parser.parse(from, BindingType.Interpolation)) as Interpolation;
    if (expr.isMulti) {
      renderable.$bindables.push(new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, this.context));
    } else {
      renderable.$bindables.push(new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, this.context, true));
    }
  }

  public [TargetedInstructionType.interpolation](renderable: IRenderable, target: any, instruction: Immutable<IInterpolationInstruction>): void {
    const from = instruction.from as any;
    const expr = (from.$kind ? from : this.parser.parse(from, BindingType.Interpolation)) as Interpolation;
    if (expr.isMulti) {
      renderable.$bindables.push(new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, this.context));
    } else {
      renderable.$bindables.push(new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, this.context, true));
    }
  }

  public [TargetedInstructionType.propertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IPropertyBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Binding(from.$kind ? from : this.parser.parse(from, BindingType.IsPropertyCommand | instruction.mode), target, instruction.to, instruction.mode, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.iteratorBinding](renderable: IRenderable, target: any, instruction: Immutable<IIteratorBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Binding(from.$kind ? from : this.parser.parse(from, BindingType.ForCommand), target, instruction.to, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.listenerBinding](renderable: IRenderable, target: any, instruction: Immutable<IListenerBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Listener(instruction.to, instruction.strategy, from.$kind ? from : this.parser.parse(from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta)), target, instruction.preventDefault, this.eventManager, this.context));
  }

  public [TargetedInstructionType.callBinding](renderable: IRenderable, target: any, instruction: Immutable<ICallBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Call(from.$kind ? from : this.parser.parse(from, BindingType.CallCommand), target, instruction.to, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.refBinding](renderable: IRenderable, target: any, instruction: Immutable<IRefBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Ref(from.$kind ? from : this.parser.parse(from, BindingType.IsRef), target, this.context));
  }

  public [TargetedInstructionType.stylePropertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IStylePropertyBindingInstruction>): void {
    const from = instruction.from as any;
    renderable.$bindables.push(new Binding(from.$kind ? from : this.parser.parse(from, BindingType.IsPropertyCommand | BindingMode.toView), (<any>target).style, instruction.to, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.setProperty](renderable: IRenderable, target: any, instruction: Immutable<ISetPropertyInstruction>): void {
    target[instruction.to] = instruction.value;
  }

  public [TargetedInstructionType.setAttribute](renderable: IRenderable, target: any, instruction: Immutable<ISetAttributeInstruction>): void {
    DOM.setAttribute(target, instruction.to, instruction.value);
  }

  public [TargetedInstructionType.hydrateElement](renderable: IRenderable, target: any, instruction: Immutable<IHydrateElementInstruction>): void {
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);    const component = context.get<ICustomElement>(CustomElementResource.keyFrom(instruction.res));

    this.hydrateElementInstance(renderable, target, instruction, component);
    operation.dispose();
  }

  public [TargetedInstructionType.hydrateAttribute](renderable: IRenderable, target: any, instruction: Immutable<IHydrateAttributeInstruction>): void {
    const childInstructions = instruction.instructions;
    const context = this.context;

    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(CustomAttributeResource.keyFrom(instruction.res));
    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this as any)[current.type](renderable, component, current);
    }

    renderable.$bindables.push(component);
    renderable.$attachables.push(component);

    operation.dispose();
  }

  public [TargetedInstructionType.hydrateTemplateController](renderable: IRenderable, target: any, instruction: Immutable<IHydrateTemplateController>, parts?: TemplatePartDefinitions): void {
    const childInstructions = instruction.instructions;
    const factory = this.renderingEngine.getViewFactory(instruction.src, this.context);
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);

    const component = context.get<ICustomAttribute>(CustomAttributeResource.keyFrom(instruction.res));
    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as any).link(renderable.$attachables[renderable.$attachables.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this as any)[current.type](renderable, component, current);
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

  public [TargetedInstructionType.letElement](renderable: IRenderable, target: any, instruction: Immutable<ILetElementInstruction>): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const childInstruction = childInstructions[i];
      const from: any = childInstruction.from;
      renderable.$bindables.push(new LetBinding(
        from.$kind ? from : this.parser.parse(from, BindingType.IsPropertyCommand),
        childInstruction.to,
        this.observerLocator,
        this.context,
        toViewModel
      ));
    }
  }
}
