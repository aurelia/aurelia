import { IContainer, IIndexable, inject, IRegistry, Tracer } from '@aurelia/kernel';
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
import { customAttributeKey, customElementKey, ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, TargetedInstructionType, TemplatePartDefinitions } from './definitions';
import { DOM } from './dom';
import { IElement, IHTMLElement, INode, IRenderLocation } from './dom.interfaces';
import { IAttach, IAttachables, IBindables, IBindScope, IRenderable, IRenderContext } from './lifecycle';
import { ICustomAttribute } from './templating/custom-attribute';
import { ICustomElement } from './templating/custom-element';
import { IElementHydrationOptions, IInstructionRenderer, instructionRenderer, IRenderer, IRenderingEngine } from './templating/lifecycle-render';

const slice = Array.prototype.slice;

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

export function addBindable(renderable: IBindables, bindable: IBindScope): void {
  if (Tracer.enabled) { Tracer.enter('addBindable', slice.call(arguments)); }
  bindable.$prevBind = renderable.$bindableTail;
  bindable.$nextBind = null;
  if (renderable.$bindableTail === null) {
    renderable.$bindableHead = bindable;
  } else {
    renderable.$bindableTail.$nextBind = bindable;
  }
  renderable.$bindableTail = bindable;
  if (Tracer.enabled) { Tracer.leave(); }
}

export function addAttachable(renderable: IAttachables, attachable: IAttach): void {
  if (Tracer.enabled) { Tracer.enter('addAttachable', slice.call(arguments)); }
  attachable.$prevAttach = renderable.$attachableTail;
  attachable.$nextAttach = null;
  if (renderable.$attachableTail === null) {
    renderable.$attachableHead = attachable;
  } else {
    renderable.$attachableTail.$nextAttach = attachable;
  }
  renderable.$attachableTail = attachable;
  if (Tracer.enabled) { Tracer.leave(); }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ITextBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('TextBindingRenderer.render', slice.call(arguments)); }
    const next = target.nextSibling;
    if (DOM.isMarker(target)) {
      DOM.remove(target);
    }
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void {
    if (Tracer.enabled) { Tracer.enter('InterpolationBindingRenderer.render', slice.call(arguments)); }
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IPropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('PropertyBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const bindable = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('IteratorBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const bindable = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IEventManager)
@instructionRenderer(TargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private eventManager: IEventManager;

  constructor(parser: IExpressionParser, eventManager: IEventManager) {
    this.parser = parser;
    this.eventManager = eventManager;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IListenerBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('ListenerBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const bindable = new Listener(instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CallBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const bindable = new Call(expr, target, instruction.to, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser)
@instructionRenderer(TargetedInstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IRefBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('RefBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const bindable = new Ref(expr, target, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IHTMLElement, instruction: IStylePropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('StylePropertyBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const bindable = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IInstructionRenderer {
  public render(context: IRenderContext, renderable: IRenderable, target: IIndexable, instruction: ISetPropertyInstruction): void {
    if (Tracer.enabled) { Tracer.enter('SetPropertyRenderer.render', slice.call(arguments)); }
    target[instruction.to] = instruction.value;
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IInstructionRenderer {
  public render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: ISetAttributeInstruction): void {
    if (Tracer.enabled) { Tracer.enter('SetAttributeRenderer.render', slice.call(arguments)); }
    DOM.setAttribute(target, instruction.to, instruction.value);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IRenderLocation, instruction: IHydrateElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomElementRenderer.render', slice.call(arguments)); }
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
    const component = context.get<ICustomElement>(customElementKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine, target, instruction as IElementHydrationOptions);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateAttributeInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomAttributeRenderer.render', slice.call(arguments)); }
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
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void {
    if (Tracer.enabled) { Tracer.enter('TemplateControllerRenderer.render', slice.call(arguments)); }
    const factory = this.renderingEngine.getViewFactory(instruction.def, context);
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as ICustomAttribute & { link(attachableTail: IAttach): void}).link(renderable.$attachableTail);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateLetElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('LetElementRenderer.render', slice.call(arguments)); }
    target.remove();
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const childInstruction = childInstructions[i];
      const expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      const bindable = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
      addBindable(renderable, bindable);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export const HtmlRenderer = {
  register(container: IContainer): void {
    container.register(
      TextBindingRenderer as unknown as IRegistry,
      InterpolationBindingRenderer as unknown as IRegistry,
      PropertyBindingRenderer as unknown as IRegistry,
      IteratorBindingRenderer as unknown as IRegistry,
      ListenerBindingRenderer as unknown as IRegistry,
      CallBindingRenderer as unknown as IRegistry,
      RefBindingRenderer as unknown as IRegistry,
      StylePropertyBindingRenderer as unknown as IRegistry,
      SetPropertyRenderer as unknown as IRegistry,
      SetAttributeRenderer as unknown as IRegistry,
      CustomElementRenderer as unknown as IRegistry,
      CustomAttributeRenderer as unknown as IRegistry,
      TemplateControllerRenderer as unknown as IRegistry,
      LetElementRenderer as unknown as IRegistry
    );
  }
};
