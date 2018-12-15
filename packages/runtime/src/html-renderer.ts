import { IContainer, inject, IRegistry } from '../kernel';
import { Binding } from './binding/binding';
import { BindingMode } from './binding/binding-mode';
import { Call } from './binding/call';
import { IEventManager } from './binding/event-manager';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { Listener } from './binding/listener';
import { IObserverLocator } from './binding/observer-locator';
import { Ref } from './binding/ref';
import { customAttributeKey, customElementKey, ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, TargetedInstructionType, TemplatePartDefinitions } from './definitions';
import { DOM, INode, IRemovableNode } from './dom';
import { IAttach, IAttachables, IBindables, IBindScope, IRenderable, IRenderContext } from './lifecycle';
import { ICustomAttribute } from './templating/custom-attribute';
import { ICustomElement } from './templating/custom-element';
import { IInstructionRenderer, instructionRenderer, IRenderer, IRenderingEngine } from './templating/lifecycle-render';
import { IFabricNode, IFabricRenderLocation, ThreejsDOM } from './three-dom';
import { I3VNode } from './three-vnode';

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return <Exclude<TFrom, string>><unknown>parser.parse(srcOrExpr, bindingType);
  }
  return <Exclude<TFrom, string>>srcOrExpr;
}

export function addBindable(renderable: IBindables, bindable: IBindScope): void {
  bindable.$prevBind = renderable.$bindableTail;
  bindable.$nextBind = null;
  if (renderable.$bindableTail === null) {
    renderable.$bindableHead = bindable;
  } else {
    renderable.$bindableTail.$nextBind = bindable;
  }
  renderable.$bindableTail = bindable;
}

export function addAttachable(renderable: IAttachables, attachable: IAttach): void {
  attachable.$prevAttach = renderable.$attachableTail;
  attachable.$nextAttach = null;
  if (renderable.$attachableTail === null) {
    renderable.$attachableHead = attachable;
  } else {
    renderable.$attachableTail.$nextAttach = attachable;
  }
  renderable.$attachableTail = attachable;
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.textBinding)
/*@internal*/
export class TextBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ITextBindingInstruction): void {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.interpolation)
/*@internal*/
export class InterpolationBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void {
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.propertyBinding)
/*@internal*/
export class PropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: Node | I3VNode, instruction: IPropertyBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const bindable = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.iteratorBinding)
/*@internal*/
export class IteratorBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const bindable = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IEventManager)
@instructionRenderer(TargetedInstructionType.listenerBinding)
/*@internal*/
export class ListenerBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private eventManager: IEventManager;

  constructor(parser: IExpressionParser, eventManager: IEventManager) {
    this.parser = parser;
    this.eventManager = eventManager;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: I3VNode, instruction: IListenerBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const bindable = new Listener(instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.callBinding)
/*@internal*/
export class CallBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const bindable = new Call(expr, target, instruction.to, this.observerLocator, context);
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser)
@instructionRenderer(TargetedInstructionType.refBinding)
/*@internal*/
export class RefBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: I3VNode, instruction: IRefBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const bindable = new Ref(expr, target, context);
    addBindable(renderable, bindable);
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.stylePropertyBinding)
/*@internal*/
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IStylePropertyBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const bindable = new Binding(expr, (<any>target).style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
  }
}

@instructionRenderer(TargetedInstructionType.setProperty)
/*@internal*/
export class SetPropertyRenderer implements IInstructionRenderer {
  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ISetPropertyInstruction): void {
    target[instruction.to] = instruction.value;
  }
}

@instructionRenderer(TargetedInstructionType.setAttribute)
/*@internal*/
export class SetAttributeRenderer implements IInstructionRenderer {
  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ISetAttributeInstruction): void {
    DOM.setAttribute(target, instruction.to, instruction.value);
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateElement)
/*@internal*/
export class CustomElementRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: I3VNode, instruction: IHydrateElementInstruction): void {
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target as IFabricRenderLocation, true);
    const component = context.get<ICustomElement>(customElementKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine, target, instruction);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/*@internal*/
export class CustomAttributeRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: I3VNode, instruction: IHydrateAttributeInstruction): void {
    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/*@internal*/
export class TemplateControllerRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: I3VNode, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void {
    const factory = this.renderingEngine.getViewFactory(instruction.def, context);
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, ThreejsDOM.convertToRenderLocation(target), false);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as any).link(renderable.$attachableTail);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.letElement)
/*@internal*/
export class LetElementRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IRemovableNode, instruction: ILetElementInstruction): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const childInstruction = childInstructions[i];
      const expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      const bindable = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
      addBindable(renderable, bindable);
    }
  }
}

export const HtmlRenderer = {
  register(container: IContainer): void {
    container.register(
      <IRegistry><unknown>TextBindingRenderer,
      <IRegistry><unknown>InterpolationBindingRenderer,
      <IRegistry><unknown>PropertyBindingRenderer,
      <IRegistry><unknown>IteratorBindingRenderer,
      <IRegistry><unknown>ListenerBindingRenderer,
      <IRegistry><unknown>CallBindingRenderer,
      <IRegistry><unknown>RefBindingRenderer,
      <IRegistry><unknown>StylePropertyBindingRenderer,
      <IRegistry><unknown>SetPropertyRenderer,
      <IRegistry><unknown>SetAttributeRenderer,
      <IRegistry><unknown>CustomElementRenderer,
      <IRegistry><unknown>CustomAttributeRenderer,
      <IRegistry><unknown>TemplateControllerRenderer,
      <IRegistry><unknown>LetElementRenderer
    );
  }
};
